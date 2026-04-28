import fs from "node:fs";
import path from "node:path";

function sortSources(sources = []) {
  return [...sources].sort((a, b) => a.path.localeCompare(b.path));
}

const reportExtensions = new Set([".csv", ".json", ".md", ".markdown", ".html"]);
const ignoredSegments = new Set([
  "raw",
  "normalized",
  "inputs",
  "requests",
  "request",
  "video-requests",
  "image-requests",
  "images",
  "image",
  "audio",
  "videos",
  "voices",
  "assets",
  "scripts",
  "downloads",
  "download-reports"
]);

function prettifyLabel(filePath) {
  return path
    .basename(filePath, path.extname(filePath))
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function prettifyCampaignName(campaignId) {
  return campaignId
    .split("-")
    .filter((part) => !/^\d{4}$/.test(part) && !/^\d{2}$/.test(part))
    .join(" ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function readCampaignReportManifest(campaignRoot) {
  const manifestPath = path.join(campaignRoot, "campaign.manifest.json");
  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    return null;
  }
}

function deriveCampaignContext(filePath) {
  const absolutePath = path.resolve(filePath);
  const segments = absolutePath.split(path.sep);
  const customersIndex = segments.lastIndexOf("customers");
  if (customersIndex < 0 || segments[customersIndex + 2] !== "campaigns") {
    return null;
  }

  const customerId = segments[customersIndex + 1];
  const campaignId = segments[customersIndex + 3];
  if (!customerId || !campaignId) {
    return null;
  }

  const campaignRoot = segments.slice(0, customersIndex + 4).join(path.sep);
  const relativePath = path.relative(campaignRoot, absolutePath);
  return {
    absolutePath,
    campaignRoot,
    customerId,
    campaignId,
    relativePath
  };
}

function isLikelyCampaignReport(relativePath) {
  const extension = path.extname(relativePath).toLowerCase();
  if (!reportExtensions.has(extension)) {
    return false;
  }

  const segments = relativePath.split(path.sep).map((part) => part.toLowerCase());
  if (segments.some((segment) => ignoredSegments.has(segment))) {
    return false;
  }

  const normalized = relativePath.toLowerCase();
  if (
    normalized.includes(`${path.sep}reports${path.sep}`) ||
    normalized.includes(`${path.sep}analysis${path.sep}`) ||
    normalized.includes(`${path.sep}summary${path.sep}`) ||
    normalized.includes(`${path.sep}exports${path.sep}`) ||
    normalized.includes(`${path.sep}notes${path.sep}`)
  ) {
    return true;
  }

  return /(summary|shortlist|report|dashboard|top|benchmark|direction)/.test(normalized);
}

export function writeCampaignReportManifest(campaignRoot, manifest) {
  const manifestPath = path.join(campaignRoot, "campaign.manifest.json");
  const payload = {
    version: 1,
    ...manifest,
    confirmSources: sortSources(manifest.confirmSources ?? []),
    reportSources: sortSources(manifest.reportSources ?? [])
  };

  fs.writeFileSync(`${manifestPath}.tmp`, `${JSON.stringify(payload, null, 2)}\n`);
  fs.renameSync(`${manifestPath}.tmp`, manifestPath);
  return manifestPath;
}

export function maybeRegisterCampaignReport(filePath, options = {}) {
  const context = deriveCampaignContext(filePath);
  if (!context || !isLikelyCampaignReport(context.relativePath)) {
    return null;
  }

  const existing = readCampaignReportManifest(context.campaignRoot);
  const existingSources = Array.isArray(existing?.reportSources) ? existing.reportSources : [];
  const retained = existingSources.filter((source) => source?.path !== context.relativePath);
  const prior = existingSources.find((source) => source?.path === context.relativePath);

  const manifestPath = writeCampaignReportManifest(context.campaignRoot, {
    ...existing,
    campaignName:
      existing?.campaignName ||
      options.campaignName ||
      prettifyCampaignName(context.campaignId),
    reportSources: [
      ...retained,
      {
        path: context.relativePath,
        label: options.label || prior?.label || prettifyLabel(context.relativePath)
      }
    ]
  });

  return {
    manifestPath,
    campaignRoot: context.campaignRoot,
    relativePath: context.relativePath
  };
}
