#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { requestJson } from './network_runtime.mjs';

const POSTPLUS_SESSION_REFRESH_LEEWAY_SECONDS = 60;

function createHardError(code, message, cause, extra = {}) {
  const error = new Error(message);
  error.code = code;
  if (cause !== undefined) {
    error.cause = cause;
  }
  Object.assign(error, extra);
  return error;
}

function resolveConfigProfile() {
  const value = process.env.POSTPLUS_PROFILE?.trim();

  if (!value || value.toLowerCase() === 'default') {
    return null;
  }

  return value.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

function resolveDefaultConfigRoot() {
  const profile = resolveConfigProfile();
  const appendProfile = (basePath) =>
    profile ? path.join(basePath, 'profiles', profile) : basePath;

  switch (process.platform) {
    case 'darwin':
      return appendProfile(
        path.join(os.homedir(), 'Library', 'Application Support', 'postplus'),
      );
    case 'win32': {
      const appData = process.env.APPDATA?.trim();

      return appendProfile(
        appData && appData.length > 0
          ? path.join(appData, 'postplus')
          : path.join(os.homedir(), 'AppData', 'Roaming', 'postplus'),
      );
    }
    default: {
      const xdgConfigHome = process.env.XDG_CONFIG_HOME?.trim();

      return appendProfile(
        xdgConfigHome && xdgConfigHome.length > 0
          ? path.join(xdgConfigHome, 'postplus')
          : path.join(os.homedir(), '.config', 'postplus'),
      );
    }
  }
}

export function getPostPlusCliConfigPath() {
  const override = process.env.POSTPLUS_CONFIG_DIR?.trim();
  const root =
    override && override.length > 0
      ? path.resolve(override)
      : resolveDefaultConfigRoot();

  return path.join(root, 'config.json');
}

export function readPostPlusCliConfig() {
  const configPath = getPostPlusCliConfigPath();

  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      return null;
    }

    if (error instanceof SyntaxError) {
      throw createHardError(
        'postplus_cli_config_invalid_json',
        `PostPlus CLI config is not valid JSON: ${configPath}`,
        error,
        { configPath },
      );
    }

    throw createHardError(
      'postplus_cli_config_read_failed',
      `Failed to read PostPlus CLI config: ${configPath}`,
      error,
      { configPath },
    );
  }
}

function writePostPlusCliConfig(config) {
  const configPath = getPostPlusCliConfigPath();
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(
    configPath,
    `${JSON.stringify(
      {
        ...config,
        updatedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
}

export function resolvePostPlusAccessToken() {
  const envValue = process.env.POSTPLUS_ACCESS_TOKEN?.trim();

  if (envValue) {
    return {
      source: 'env',
      value: envValue,
    };
  }

  const configValue = readPostPlusCliConfig()?.accessToken;

  return typeof configValue === 'string' && configValue.trim().length > 0
    ? {
        source: 'config',
        value: configValue.trim(),
      }
    : null;
}

export function resolvePostPlusRefreshToken() {
  const envValue = process.env.POSTPLUS_REFRESH_TOKEN?.trim();

  if (envValue) {
    return {
      source: 'env',
      value: envValue,
    };
  }

  const configValue = readPostPlusCliConfig()?.refreshToken;

  return typeof configValue === 'string' && configValue.trim().length > 0
    ? {
        source: 'config',
        value: configValue.trim(),
      }
    : null;
}

export function resolvePostPlusApiBaseUrl() {
  const envValue = process.env.POSTPLUS_API_BASE_URL?.trim();

  if (envValue) {
    return envValue.replace(/\/+$/, '');
  }

  const configValue = readPostPlusCliConfig()?.apiBaseUrl;

  return typeof configValue === 'string' && configValue.trim().length > 0
    ? configValue.trim().replace(/\/+$/, '')
    : null;
}

export function resolvePostPlusHostedSessionAuth() {
  const accessToken = resolvePostPlusAccessToken();
  const refreshToken = resolvePostPlusRefreshToken();
  const apiBaseUrl = resolvePostPlusApiBaseUrl();

  if (!accessToken?.value || !apiBaseUrl) {
    return null;
  }

  return {
    accessToken: accessToken.value,
    accessTokenSource: accessToken.source,
    apiBaseUrl,
    refreshToken: refreshToken?.value ?? null,
    refreshTokenSource: refreshToken?.source ?? 'missing',
  };
}

export async function refreshPostPlusHostedSessionAuthIfNeeded() {
  const auth = resolvePostPlusHostedSessionAuth();
  const config = readPostPlusCliConfig();
  const sessionExpiresAt = config?.sessionExpiresAt;

  if (
    !auth ||
    !auth.refreshToken ||
    auth.accessTokenSource !== 'config' ||
    auth.refreshTokenSource !== 'config' ||
    typeof sessionExpiresAt !== 'number' ||
    !Number.isFinite(sessionExpiresAt)
  ) {
    return null;
  }

  const nowSeconds = Math.floor(Date.now() / 1_000);

  if (sessionExpiresAt - nowSeconds > POSTPLUS_SESSION_REFRESH_LEEWAY_SECONDS) {
    return null;
  }

  return refreshPostPlusHostedSessionAuth();
}

export async function refreshPostPlusHostedSessionAuth(input = {}) {
  const auth = resolvePostPlusHostedSessionAuth();

  if (!auth || !auth.refreshToken) {
    return null;
  }

  const response = await requestJson(
    `${auth.apiBaseUrl}/api/postplus-cli/auth/refresh`,
    {
      allowHttp: true,
      body: JSON.stringify({
        refreshToken: auth.refreshToken,
      }),
      codePrefix: 'postplus_cli_auth_refresh',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      method: 'POST',
      providerName: 'PostPlus auth refresh',
    },
  );

  const payload = response?.data;

  if (!payload || typeof payload !== 'object') {
    throw new Error('PostPlus auth refresh returned an invalid payload.');
  }

  if (
    typeof payload.accessToken !== 'string' ||
    !payload.accessToken.trim() ||
    typeof payload.refreshToken !== 'string' ||
    !payload.refreshToken.trim()
  ) {
    throw new Error(
      'PostPlus auth refresh returned incomplete session tokens.',
    );
  }

  if (
    auth.accessTokenSource === 'config' &&
    auth.refreshTokenSource === 'config'
  ) {
    const currentConfig = readPostPlusCliConfig() || {};
    writePostPlusCliConfig({
      ...currentConfig,
      accessToken: payload.accessToken.trim(),
      refreshToken: payload.refreshToken.trim(),
      ...(typeof payload.accountId === 'string'
        ? { accountId: payload.accountId }
        : {}),
      ...(typeof payload.sessionExpiresAt === 'number'
        ? { sessionExpiresAt: payload.sessionExpiresAt }
        : {}),
      ...(typeof payload.userEmail === 'string' || payload.userEmail === null
        ? { userEmail: payload.userEmail }
        : {}),
      ...(typeof payload.userId === 'string' ? { userId: payload.userId } : {}),
    });
  }

  return {
    accessToken: payload.accessToken.trim(),
    accessTokenSource: auth.accessTokenSource,
    apiBaseUrl: auth.apiBaseUrl,
    refreshToken: payload.refreshToken.trim(),
    refreshTokenSource: auth.refreshTokenSource,
  };
}
