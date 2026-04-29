#!/usr/bin/env node

import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import tls from "node:tls";
import { randomUUID } from "node:crypto";

const LOCAL_HTTP_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function getProxyUrl(env = process.env) {
  return env.https_proxy || env.HTTPS_PROXY || env.http_proxy || env.HTTP_PROXY;
}

export function getNoProxy(env = process.env) {
  return env.no_proxy || env.NO_PROXY;
}

export function shouldBypassProxy(urlString, noProxy = getNoProxy()) {
  let hostname = null;

  try {
    hostname = new URL(urlString).hostname.toLowerCase();
  } catch {
    return false;
  }

  if (LOCAL_HTTP_HOSTS.has(hostname)) {
    return true;
  }

  if (!noProxy) {
    return false;
  }

  if (noProxy === "*") {
    return true;
  }

  try {
    const url = new URL(urlString);
    const port = url.port || (url.protocol === "https:" ? "443" : "80");
    const hostWithPort = `${hostname}:${port}`;
    const noProxyList = noProxy.split(/[,\s]+/).filter(Boolean);

    return noProxyList.some((rawPattern) => {
      const pattern = rawPattern.toLowerCase().trim();
      if (pattern.includes(":")) {
        return hostWithPort === pattern;
      }
      if (pattern.startsWith(".")) {
        return hostname === pattern.slice(1) || hostname.endsWith(pattern);
      }
      return hostname === pattern;
    });
  } catch {
    return false;
  }
}

export function formatCliError(error) {
  if (error instanceof Error && typeof error.code === "string") {
    return `${error.code}: ${error.message}`;
  }

  return error instanceof Error ? error.message : String(error);
}

function isEnvTruthy(value) {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return (
    normalized.length > 0 &&
    normalized !== "0" &&
    normalized !== "false" &&
    normalized !== "no" &&
    normalized !== "off"
  );
}

function getLookupFamily(value) {
  if (value === 0 || value === 4 || value === 6) {
    return value;
  }
  if (value === "IPv6") {
    return 6;
  }
  return 4;
}

function createProxyAgent(proxyUrl) {
  const proxy = new URL(proxyUrl);
  const agentOptions = {};

  if (proxy.protocol !== "http:" && proxy.protocol !== "https:") {
    throw createHardError(
      "network_invalid_proxy_url",
      `Unsupported proxy protocol for ${proxyUrl}`,
    );
  }

  if (isEnvTruthy(process.env.CLAUDE_CODE_PROXY_RESOLVES_HOSTS)) {
    agentOptions.lookup = (hostname, lookupOptions, callback) => {
      callback(null, hostname, getLookupFamily(lookupOptions?.family));
    };
  }

  return new https.Agent({
    ...agentOptions,
    createConnection: (_options, callback) => {
      const headers = {};
      const auth =
        proxy.username || proxy.password
          ? Buffer.from(
              `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`,
            ).toString("base64")
          : null;

      if (auth) {
        headers["proxy-authorization"] = `Basic ${auth}`;
      }

      const requestModule = proxy.protocol === "https:" ? https : http;
      const connectRequest = requestModule.request({
        host: proxy.hostname,
        port:
          proxy.port || (proxy.protocol === "https:" ? 443 : 80),
        method: "CONNECT",
        path: `${_options.host}:${_options.port}`,
        headers,
        lookup: agentOptions.lookup,
        servername: proxy.protocol === "https:" ? proxy.hostname : undefined,
      });

      connectRequest.once("connect", (response, socket) => {
        if ((response.statusCode ?? 0) < 200 || (response.statusCode ?? 0) >= 300) {
          socket.destroy();
          callback(
            createHardError(
              "network_proxy_tunnel_failed",
              `Proxy tunnel request failed with ${response.statusCode ?? 0}.`,
              undefined,
              {
                status: response.statusCode ?? 0,
              },
            ),
          );
          return;
        }

        const tlsSocket = tls.connect({
          socket,
          servername: _options.servername || _options.host,
          lookup: agentOptions.lookup,
        });

        callback(null, tlsSocket);
      });
      connectRequest.once("error", (error) => {
        callback(error);
      });
      connectRequest.end();
    },
  });
}

function createHardError(code, message, cause, extra = {}) {
  const error = new Error(message);
  error.code = code;
  if (cause !== undefined) {
    error.cause = cause;
  }
  Object.assign(error, extra);
  return error;
}

function normalizeCodePrefix(value) {
  return String(value || "network")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeProviderName(value) {
  const text = String(value || "Network request").trim();
  return text.length > 0 ? text : "Network request";
}

function normalizeBody(body) {
  if (body === undefined || body === null) {
    return null;
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (body instanceof Uint8Array) {
    return Buffer.from(body);
  }
  if (typeof body === "string") {
    return Buffer.from(body);
  }

  throw createHardError(
    "network_invalid_body",
    `Unsupported request body type: ${typeof body}`,
  );
}

function isHttpAllowed(requestUrl, allowHttp) {
  if (requestUrl.protocol === "https:") {
    return true;
  }

  if (requestUrl.protocol !== "http:") {
    return false;
  }

  return allowHttp || LOCAL_HTTP_HOSTS.has(requestUrl.hostname);
}

function buildTransport(urlString, options = {}) {
  const requestUrl = new URL(urlString);
  const proxyUrl = getProxyUrl();
  const proxyBypassed = shouldBypassProxy(urlString);
  const proxyBypassReason = LOCAL_HTTP_HOSTS.has(
    requestUrl.hostname.toLowerCase(),
  )
    ? "local_host"
    : proxyBypassed
      ? "no_proxy"
      : null;
  const useProxy = Boolean(proxyUrl) && !proxyBypassed;
  const codePrefix = normalizeCodePrefix(options.codePrefix);
  const providerName = normalizeProviderName(options.providerName);

  if (!isHttpAllowed(requestUrl, options.allowHttp === true)) {
    throw createHardError(
      `${codePrefix}_unsupported_protocol`,
      `${providerName} requires an https URL. Received ${requestUrl.href}`,
    );
  }

  if (useProxy && requestUrl.protocol !== "https:") {
    throw createHardError(
      `${codePrefix}_unsupported_proxy_protocol`,
      `${providerName} cannot proxy a non-https URL. Received ${requestUrl.href}`,
    );
  }

  return {
    agent: useProxy ? createProxyAgent(proxyUrl) : undefined,
    codePrefix,
    proxyBypassReason,
    providerName,
    proxyBypassed,
    proxyUrl,
    requestModule: requestUrl.protocol === "https:" ? https : http,
    requestUrl,
    useProxy,
  };
}

function shouldDebugHostedSkillBilling(providerName) {
  return (
    process.env.POSTPLUS_DEBUG_SKILL_BILLING === "1" &&
    normalizeProviderName(providerName) === "Hosted skill billing"
  );
}

function buildNetworkFailureMessage(transport, detail) {
  const proxyMessage = transport.useProxy
    ? `Proxy ${transport.proxyUrl} was used.`
    : transport.proxyUrl
      ? transport.proxyBypassReason === "local_host"
        ? `Proxy ${transport.proxyUrl} was bypassed for the local host.`
        : `Proxy ${transport.proxyUrl} was configured but bypassed by NO_PROXY.`
      : "No HTTP(S)_PROXY was configured.";

  return `${transport.providerName} network request failed for ${transport.requestUrl.hostname}. ${proxyMessage} ${detail}`.trim();
}

function buildNetworkError(error, transport) {
  const code =
    error && typeof error === "object" && "code" in error ? error.code : null;
  const detail = error instanceof Error ? error.message : String(error);
  const baseMessage = buildNetworkFailureMessage(transport, detail);

  if (code === "ENOTFOUND") {
    return createHardError(
      `${transport.codePrefix}_dns_resolution_failed`,
      `${baseMessage} DNS resolution failed.`,
      error,
      {
        rawErrorCode: code,
        rawErrorMessage: detail,
      },
    );
  }

  if (transport.useProxy) {
    return createHardError(
      `${transport.codePrefix}_proxy_request_failed`,
      baseMessage,
      error,
      {
        rawErrorCode: code,
        rawErrorMessage: detail,
      },
    );
  }

  return createHardError(
    `${transport.codePrefix}_network_request_failed`,
    baseMessage,
    error,
    {
      rawErrorCode: code,
      rawErrorMessage: detail,
    },
  );
}

function buildHttpError(statusCode, bodyText, transport) {
  const preview = String(bodyText || "").trim();
  const suffix = preview ? ` ${preview}` : "";

  if (statusCode === 429) {
    return createHardError(
      `${transport.codePrefix}_rate_limited`,
      `${transport.providerName} request was rate limited (429).${suffix}`,
      undefined,
      { status: statusCode },
    );
  }

  if (statusCode === 401) {
    return createHardError(
      `${transport.codePrefix}_unauthorized`,
      `${transport.providerName} request was unauthorized (401).${suffix}`,
      undefined,
      { status: statusCode },
    );
  }

  if (
    statusCode === 503 &&
    /capability_unavailable|not configured|unavailable/i.test(preview)
  ) {
    return createHardError(
      `${transport.codePrefix}_capability_unavailable`,
      `${transport.providerName} capability is unavailable (503).${suffix}`,
      undefined,
      { status: statusCode },
    );
  }

  return createHardError(
    `${transport.codePrefix}_request_failed`,
    `${transport.providerName} request failed with ${statusCode}.${suffix}`,
    undefined,
    { status: statusCode },
  );
}

function shouldUseLowLevelTransport(urlString, options = {}) {
  let isLocalHost = false;

  try {
    isLocalHost = LOCAL_HTTP_HOSTS.has(new URL(urlString).hostname.toLowerCase());
  } catch {
    isLocalHost = false;
  }

  return (
    options.forceLowLevel === true ||
    isLocalHost ||
    (Boolean(getProxyUrl()) && !shouldBypassProxy(urlString))
  );
}

async function requestTextViaHttp(urlString, options = {}) {
  const transport = buildTransport(urlString, options);
  const body = normalizeBody(options.body);
  const headers = {
    ...options.headers,
  };

  if (shouldDebugHostedSkillBilling(options.providerName)) {
    console.error(
      "[Hosted skill billing transport]",
      JSON.stringify({
        mode: "http",
        url: urlString,
        useProxy: transport.useProxy,
        proxyUrl: transport.proxyUrl ?? null,
        proxyBypassed: transport.proxyBypassed,
        proxyBypassReason: transport.proxyBypassReason ?? null,
      }),
    );
  }

  if (body && !("content-length" in headers) && !("Content-Length" in headers)) {
    headers["content-length"] = String(body.byteLength);
  }

  return await new Promise((resolve, reject) => {
    const request = transport.requestModule.request(
      transport.requestUrl,
      {
        agent: transport.agent,
        headers,
        method: options.method || "GET",
      },
      (incoming) => {
        const chunks = [];
        incoming.setEncoding("utf8");
        incoming.on("data", (chunk) => {
          chunks.push(chunk);
        });
        incoming.on("end", () => {
          const bodyText = chunks.join("");
          const statusCode = incoming.statusCode ?? 0;
          if (statusCode < 200 || statusCode >= 300) {
            reject(buildHttpError(statusCode, bodyText, transport));
            return;
          }
          resolve({
            bodyText,
            headers: incoming.headers,
            statusCode,
            transport,
          });
        });
        incoming.on("error", (streamError) => {
          reject(buildNetworkError(streamError, transport));
        });
      },
    );

    request.on("error", (requestError) => {
      reject(buildNetworkError(requestError, transport));
    });

    if (body) {
      request.write(body);
    }
    request.end();
  });
}

async function requestTextViaFetch(urlString, options = {}) {
  const transport = buildTransport(urlString, options);
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;

  if (shouldDebugHostedSkillBilling(options.providerName)) {
    console.error(
      "[Hosted skill billing transport]",
      JSON.stringify({
        mode: "fetch",
        url: urlString,
        useProxy: transport.useProxy,
        proxyUrl: transport.proxyUrl ?? null,
        proxyBypassed: transport.proxyBypassed,
        proxyBypassReason: transport.proxyBypassReason ?? null,
      }),
    );
  }

  if (typeof fetchImpl !== "function") {
    throw createHardError(
      `${transport.codePrefix}_network_request_failed`,
      `${transport.providerName} requires fetch to be available.`,
    );
  }

  try {
    const response = await fetchImpl(urlString, {
      body: options.body,
      headers: options.headers,
      method: options.method || "GET",
    });
    const bodyText = await response.text();
    if (!response.ok) {
      throw buildHttpError(response.status, bodyText, transport);
    }
    return {
      bodyText,
      headers:
        typeof response.headers?.entries === "function"
          ? Object.fromEntries(response.headers.entries())
          : {},
      statusCode: response.status,
      transport,
    };
  } catch (error) {
    if (error instanceof Error && typeof error.code === "string") {
      throw error;
    }
    throw buildNetworkError(error, transport);
  }
}

export async function requestText(urlString, options = {}) {
  if (shouldUseLowLevelTransport(urlString, options)) {
    return requestTextViaHttp(urlString, options);
  }

  return requestTextViaFetch(urlString, options);
}

export async function requestJson(urlString, options = {}) {
  const result = await requestText(urlString, options);

  try {
    return {
      ...result,
      data: result.bodyText ? JSON.parse(result.bodyText) : null,
    };
  } catch (error) {
    throw createHardError(
      `${result.transport.codePrefix}_invalid_json`,
      `${result.transport.providerName} returned non-JSON text.`,
      error,
      { bodyText: result.bodyText },
    );
  }
}

async function requestBytesViaHttp(urlString, options = {}) {
  const transport = buildTransport(urlString, options);
  const body = normalizeBody(options.body);
  const headers = {
    ...options.headers,
  };

  if (body && !("content-length" in headers) && !("Content-Length" in headers)) {
    headers["content-length"] = String(body.byteLength);
  }

  return await new Promise((resolve, reject) => {
    const request = transport.requestModule.request(
      transport.requestUrl,
      {
        agent: transport.agent,
        headers,
        method: options.method || "GET",
      },
      (incoming) => {
        const chunks = [];
        incoming.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        incoming.on("end", () => {
          const bodyBuffer = Buffer.concat(chunks);
          const statusCode = incoming.statusCode ?? 0;
          if (statusCode < 200 || statusCode >= 300) {
            reject(
              buildHttpError(statusCode, bodyBuffer.toString("utf8"), transport),
            );
            return;
          }
          resolve({
            bodyBuffer,
            headers: incoming.headers,
            statusCode,
            transport,
          });
        });
        incoming.on("error", (streamError) => {
          reject(buildNetworkError(streamError, transport));
        });
      },
    );

    request.on("error", (requestError) => {
      reject(buildNetworkError(requestError, transport));
    });

    if (body) {
      request.write(body);
    }
    request.end();
  });
}

async function requestBytesViaFetch(urlString, options = {}) {
  const transport = buildTransport(urlString, options);
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    throw createHardError(
      `${transport.codePrefix}_network_request_failed`,
      `${transport.providerName} requires fetch to be available.`,
    );
  }

  try {
    const response = await fetchImpl(urlString, {
      body: options.body,
      headers: options.headers,
      method: options.method || "GET",
    });
    const bodyBuffer = Buffer.from(await response.arrayBuffer());
    if (!response.ok) {
      throw buildHttpError(response.status, bodyBuffer.toString("utf8"), transport);
    }
    return {
      bodyBuffer,
      headers:
        typeof response.headers?.entries === "function"
          ? Object.fromEntries(response.headers.entries())
          : {},
      statusCode: response.status,
      transport,
    };
  } catch (error) {
    if (error instanceof Error && typeof error.code === "string") {
      throw error;
    }
    throw buildNetworkError(error, transport);
  }
}

export async function requestBytes(urlString, options = {}) {
  if (shouldUseLowLevelTransport(urlString, options)) {
    return requestBytesViaHttp(urlString, options);
  }

  return requestBytesViaFetch(urlString, options);
}

export async function downloadFile(urlString, outputPath, options = {}) {
  fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
  const result = await requestBytes(urlString, {
    ...options,
    method: "GET",
  });
  fs.writeFileSync(path.resolve(outputPath), result.bodyBuffer);
  return result;
}

export function createMultipartFormData({ fields = [], files = [] } = {}) {
  const boundary = `----vibe-marketing-${randomUUID()}`;
  const chunks = [];

  for (const field of fields) {
    chunks.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${field.name}"\r\n\r\n${field.value}\r\n`,
        "utf8",
      ),
    );
  }

  for (const file of files) {
    const data =
      file.buffer instanceof Buffer
        ? file.buffer
        : Buffer.from(file.buffer ?? fs.readFileSync(path.resolve(file.filePath)));
    const contentType = file.contentType || "application/octet-stream";
    chunks.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${file.name}"; filename="${file.filename}"\r\nContent-Type: ${contentType}\r\n\r\n`,
        "utf8",
      ),
    );
    chunks.push(data);
    chunks.push(Buffer.from("\r\n", "utf8"));
  }

  chunks.push(Buffer.from(`--${boundary}--\r\n`, "utf8"));

  return {
    body: Buffer.concat(chunks),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}
