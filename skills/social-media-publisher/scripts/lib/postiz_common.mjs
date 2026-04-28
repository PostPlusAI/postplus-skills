import fs from "node:fs";
import path from "node:path";

import { runHostedProviderOperation } from "../../_postplus_shared/shared-runtime/scripts/lib/hosted_provider_bridge.mjs";

export const DEFAULT_POSTIZ_API_URL = "https://api.postiz.com/public/v1";

export function isDirectRun(importMetaUrl) {
  return importMetaUrl === new URL(process.argv[1], "file:").href;
}

export function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith("--")) {
      continue;
    }

    const key = current.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

export function requireArg(args, key, message = `Missing required --${key}`) {
  const value = args[key];
  if (!value) {
    throw new Error(message);
  }
  return value;
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
}

export function ensureDirForFile(filePath) {
  fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
}

export function writeJson(filePath, value) {
  const absolutePath = path.resolve(filePath);
  ensureDirForFile(absolutePath);
  fs.writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function writeText(filePath, value) {
  const absolutePath = path.resolve(filePath);
  ensureDirForFile(absolutePath);
  fs.writeFileSync(absolutePath, value);
}

export function readCustomerConfig(configPath) {
  const payload = readJson(configPath);
  return {
    postizWorkspace: payload.postizWorkspace ?? null,
    allowedIntegrationIds: Array.isArray(payload.allowedIntegrationIds)
      ? payload.allowedIntegrationIds.map(String)
      : [],
    defaultPlatforms: Array.isArray(payload.defaultPlatforms)
      ? payload.defaultPlatforms.map(String)
      : []
  };
}

export function assertAllowedIntegrationIds(customerConfig, integrationIds) {
  const allowed = new Set(customerConfig.allowedIntegrationIds ?? []);
  if (!allowed.size) {
    throw new Error("Customer Postiz config has no allowedIntegrationIds.");
  }

  const disallowed = integrationIds.filter((id) => !allowed.has(String(id)));
  if (disallowed.length) {
    throw new Error(
      `Integration ids not allowed for customer: ${disallowed.join(", ")}`
    );
  }
}

export async function postizJson(pathname, { method = "GET", body, headers = {} } = {}, options = {}) {
  const url = pathname.startsWith("http")
    ? pathname
    : `${DEFAULT_POSTIZ_API_URL}${pathname}`;
  const charge = method === "POST" && new URL(url).pathname.endsWith("/posts");

  return await runHostedProviderOperation({
    family: "postiz",
    operation: "json-request",
    url,
    method,
    ...(body !== undefined ? { body } : {}),
    ...(Object.keys(headers).length > 0 ? { headers } : {}),
    charge,
  });
}

export async function postizUploadFile(localFilePath, options = {}) {
  const absoluteInput = path.resolve(localFilePath);
  const fileBuffer = fs.readFileSync(absoluteInput);

  return await runHostedProviderOperation({
    family: "postiz",
    operation: "upload-file",
    fileContentBase64: fileBuffer.toString("base64"),
    fileName: path.basename(absoluteInput),
    mimeType: options.mimeType ?? "application/octet-stream",
  });
}

export function normalizeMediaUrls(mediaUrls = []) {
  return mediaUrls.map((mediaUrl, index) => ({
    id: `media-${index + 1}`,
    path: String(mediaUrl)
  }));
}

export function normalizeTags(tags) {
  if (tags === undefined) {
    return [];
  }
  if (!Array.isArray(tags)) {
    throw new Error("Create request tags must be an array.");
  }
  for (const tag of tags) {
    if (!tag || Array.isArray(tag) || typeof tag !== "object") {
      throw new Error("Create request tags must contain objects that match the Postiz API schema.");
    }
  }
  return tags;
}

export function normalizeSettings(settings, integrationId) {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    throw new Error(`Post ${integrationId} must include a settings object.`);
  }
  if (typeof settings.__type !== "string" || !settings.__type.trim()) {
    throw new Error(`Post ${integrationId} settings must include __type.`);
  }
  const type = settings.__type.trim();
  if (type === "instagram" || type === "instagram-standalone") {
    if (typeof settings.post_type !== "string" || !settings.post_type.trim()) {
      throw new Error(`Post ${integrationId} settings for ${type} must include post_type.`);
    }
    if (settings.collaborators !== undefined) {
      if (!Array.isArray(settings.collaborators)) {
        throw new Error(`Post ${integrationId} settings for ${type} collaborators must be an array.`);
      }
      for (const collaborator of settings.collaborators) {
        if (
          !collaborator ||
          Array.isArray(collaborator) ||
          typeof collaborator !== "object" ||
          typeof collaborator.label !== "string" ||
          !collaborator.label.trim()
        ) {
          throw new Error(
            `Post ${integrationId} settings for ${type} collaborators must contain { label } objects.`
          );
        }
      }
    }
  }
  return settings;
}

export function toPostizCreatePayload(request) {
  const type = request.type ?? "draft";
  const date = request.date ?? new Date().toISOString();
  const tags = normalizeTags(request.tags);
  const shortLink = Boolean(request.shortLink);

  if (!Array.isArray(request.posts) || !request.posts.length) {
    throw new Error("Create request must include at least one post.");
  }

  return {
    type,
    date,
    shortLink,
    tags,
    posts: request.posts.map((post) => {
      if (!post.integrationId) {
        throw new Error("Every post must include integrationId.");
      }
      if (!Array.isArray(post.value) || !post.value.length) {
        throw new Error(`Post ${post.integrationId} must include at least one value item.`);
      }
      const settings = normalizeSettings(post.settings, post.integrationId);

      return {
        integration: {
          id: String(post.integrationId)
        },
        settings,
        value: post.value.map((entry) => ({
          content: String(entry.content ?? ""),
          ...(entry.delay !== undefined ? { delay: Number(entry.delay) } : {}),
          image: normalizeMediaUrls(entry.mediaUrls ?? [])
        }))
      };
    })
  };
}

export function summarizeCreateResult(result) {
  const created = Array.isArray(result) ? result.length : 0;
  const postIds = Array.isArray(result)
    ? result.map((post) => post.postId).filter(Boolean)
    : [];
  return {
    created,
    postIds
  };
}

export function buildDateRange({ startDate, endDate, days = 30 }) {
  if (startDate && endDate) {
    return { startDate, endDate };
  }

  const now = Date.now();
  const delta = days * 24 * 60 * 60 * 1000;
  return {
    startDate: new Date(now - delta).toISOString(),
    endDate: new Date(now + delta).toISOString()
  };
}
