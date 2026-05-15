#!/usr/bin/env node

import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import fsp from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const POSTPLUS_STUDIO_DIRECTORY_NAME = "PostPlus Studio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ARTIFACT_INGESTOR_SCRIPT = path.resolve(
  __dirname,
  "../../../workspace-artifact-ingestor/scripts/ingest_workspace_artifacts.mjs",
);

export const ASSET_ROLES = new Set([
  "reference",
  "generated_asset",
  "intermediate",
  "preview",
  "final_output",
  "exported",
  "cache",
]);

export const ASSET_TYPES = new Set([
  "text",
  "image",
  "audio",
  "video",
  "html",
  "reference",
]);

export const ASSET_STATUSES = new Set([
  "draft",
  "ready",
  "running",
  "failed",
  "archived",
]);

export const PIPELINE_STATUSES = new Set([
  "pending",
  "running",
  "done",
  "failed",
]);

export const ASSET_TYPE_DIRS = {
  audio: "audio",
  html: "html",
  image: "images",
  reference: "references",
  text: "texts",
  video: "videos",
};

const PROJECT_FILE_NAMES = [
  "studio.json",
  "project.json",
  "manifest.json",
  "pipeline.json",
  "provenance.jsonl",
  "activity.jsonl",
  "context.json",
];

const PROJECT_DIRS = [
  "data",
  "assets/references",
  "assets/texts",
  "assets/images",
  "assets/audio",
  "assets/videos",
  "assets/html",
  ".postplus/cache",
  ".postplus/thumbnails",
  ".postplus/locks",
  ".postplus/temp",
];

const HTML_ACTION_ROLES = new Map([
  ["save", "preview"],
  ["save_as_asset", "preview"],
  ["pin", "preview"],
  ["pin_to_assets", "preview"],
  ["export", "exported"],
  ["export_html", "exported"],
  ["use", "final_output"],
  ["use_in_next_step", "final_output"],
]);

export function nowIso() {
  return new Date().toISOString();
}

export function defaultProjectsRoot() {
  return path.join(os.homedir(), "postplus", "projects");
}

export function expandHome(inputPath) {
  if (typeof inputPath !== "string") {
    return inputPath;
  }

  if (inputPath === "~") {
    return os.homedir();
  }

  if (inputPath.startsWith("~/")) {
    return path.join(os.homedir(), inputPath.slice(2));
  }

  return inputPath;
}

export function resolveProjectsRoot(projectsRoot = defaultProjectsRoot()) {
  return path.resolve(expandHome(projectsRoot));
}

export function resolveStudioRoot(workdir = process.cwd()) {
  const root = path.resolve(expandHome(workdir));

  if (path.basename(root) === POSTPLUS_STUDIO_DIRECTORY_NAME) {
    return root;
  }

  return path.join(root, POSTPLUS_STUDIO_DIRECTORY_NAME);
}

export function resolveProjectRoot(project, options = {}) {
  if (options.projectRoot) {
    return path.resolve(expandHome(options.projectRoot));
  }

  const value = project ?? options.projectSlug;
  if (!value || typeof value !== "string") {
    throw new Error("A project slug or project path is required.");
  }

  const expanded = expandHome(value);
  if (
    path.isAbsolute(expanded) ||
    expanded.startsWith(".") ||
    expanded.includes("/") ||
    expanded.includes(path.sep)
  ) {
    return path.resolve(expanded);
  }

  return path.join(resolveProjectsRoot(options.projectsRoot), safeSlug(expanded));
}

export function safeSlug(value) {
  const slug = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) {
    throw new Error("Project slug must contain at least one letter or number.");
  }

  return slug;
}

export function safeIdentifier(value, label = "identifier") {
  const identifier = String(value ?? "").trim();

  if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(identifier)) {
    throw new Error(`${label} must use only letters, numbers, underscore, or hyphen.`);
  }

  return identifier;
}

export function safeFileStem(value, fallback = "file") {
  const stem = String(value ?? fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return stem || fallback;
}

export function assertSafeRelativePath(relativePath, label = "relative path") {
  if (!relativePath || typeof relativePath !== "string") {
    throw new Error(`${label} is required.`);
  }

  if (path.isAbsolute(relativePath)) {
    throw new Error(`${label} must be project-relative.`);
  }

  const parts = relativePath.split(/[\\/]+/);
  if (parts.some((part) => part === ".." || part === "")) {
    throw new Error(`${label} must stay inside the project workspace.`);
  }

  return parts.join(path.sep);
}

export function resolveProjectPath(projectRoot, relativePath, label = "relative path") {
  const safeRelativePath = assertSafeRelativePath(relativePath, label);
  const root = path.resolve(projectRoot);
  const target = path.resolve(root, safeRelativePath);

  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new Error(`${label} must stay inside the project workspace.`);
  }

  return target;
}

export function toProjectRelative(projectRoot, absolutePath) {
  const root = path.resolve(projectRoot);
  const target = path.resolve(absolutePath);

  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Path is outside the project workspace: ${absolutePath}`);
  }

  return path.relative(root, target).split(path.sep).join("/");
}

export function readJsonFile(filePath, fallback = undefined) {
  if (!fs.existsSync(filePath)) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`JSON file not found: ${filePath}`);
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function readJsonlFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) {
    return [];
  }

  return text
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

export function ensureProjectDirectories(projectRoot) {
  for (const dir of PROJECT_DIRS) {
    fs.mkdirSync(resolveProjectPath(projectRoot, dir), { recursive: true });
  }

  for (const fileName of PROJECT_FILE_NAMES) {
    const filePath = resolveProjectPath(projectRoot, fileName);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    if (!fs.existsSync(filePath)) {
      fs.closeSync(fs.openSync(filePath, "a"));
    }
  }
}

export function atomicWriteFileSync(targetPath, content, options = {}) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });

  const tempPath = `${targetPath}.tmp-${process.pid}-${crypto.randomUUID()}`;
  const fd = fs.openSync(tempPath, "w", options.mode ?? 0o666);

  try {
    fs.writeFileSync(fd, content, "utf8");
    try {
      fs.fsyncSync(fd);
    } catch {
      // fsync is best effort across local filesystems.
    }
  } finally {
    fs.closeSync(fd);
  }

  fs.renameSync(tempPath, targetPath);

  try {
    const dirFd = fs.openSync(path.dirname(targetPath), "r");
    try {
      fs.fsyncSync(dirFd);
    } finally {
      fs.closeSync(dirFd);
    }
  } catch {
    // Directory fsync is not available on every platform/filesystem.
  }
}

export function writeJsonFileAtomic(filePath, payload, options = {}) {
  atomicWriteFileSync(
    filePath,
    `${JSON.stringify(payload, null, 2)}\n`,
    options,
  );
}

function appendJsonLineSync(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `${JSON.stringify(payload)}\n`, "utf8");
}

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

export class LockManager {
  constructor(projectRoot, options = {}) {
    this.projectRoot = path.resolve(projectRoot);
    this.lockDir =
      options.lockDir ?? resolveProjectPath(this.projectRoot, ".postplus/locks");
    fs.mkdirSync(this.lockDir, { recursive: true });
  }

  lockPath(lockName) {
    const safeName = safeFileStem(lockName, "lock");
    return path.join(this.lockDir, `${safeName}.lock`);
  }

  acquire(lockName, options = {}) {
    const lockPath = this.lockPath(lockName);
    const timeoutMs = options.timeoutMs ?? 5000;
    const staleMs = options.staleMs ?? 30000;
    const startedAt = Date.now();

    while (true) {
      try {
        const fd = fs.openSync(lockPath, "wx", 0o600);
        fs.writeFileSync(
          fd,
          JSON.stringify(
            {
              created_at: nowIso(),
              lock_name: lockName,
              pid: process.pid,
            },
            null,
            2,
          ),
        );
        fs.closeSync(fd);
        return () => {
          try {
            fs.unlinkSync(lockPath);
          } catch (error) {
            if (error?.code !== "ENOENT") {
              throw error;
            }
          }
        };
      } catch (error) {
        if (error?.code !== "EEXIST") {
          throw error;
        }

        try {
          const stat = fs.statSync(lockPath);
          if (Date.now() - stat.mtimeMs > staleMs) {
            fs.unlinkSync(lockPath);
            continue;
          }
        } catch (statError) {
          if (statError?.code !== "ENOENT") {
            throw statError;
          }
        }

        if (Date.now() - startedAt > timeoutMs) {
          throw new Error(`Timed out waiting for project lock: ${lockName}`);
        }

        sleepSync(25);
      }
    }
  }

  withLock(lockName, callback, options = {}) {
    const release = this.acquire(lockName, options);
    try {
      return callback();
    } finally {
      release();
    }
  }
}

export class DashboardNotifier {
  constructor() {
    this.clients = new Set();
  }

  attach(response) {
    response.writeHead(200, {
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
      "X-Accel-Buffering": "no",
    });
    response.write(": connected\n\n");
    this.clients.add(response);

    return () => {
      this.clients.delete(response);
      try {
        response.end();
      } catch {
        // Ignore already closed SSE clients.
      }
    };
  }

  send(eventName, payload = {}) {
    const frame = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const client of [...this.clients]) {
      try {
        client.write(frame);
      } catch {
        this.clients.delete(client);
      }
    }
  }
}

export class ProvenanceManager {
  constructor(projectRoot, lockManager) {
    this.projectRoot = path.resolve(projectRoot);
    this.lockManager = lockManager;
    this.provenancePath = resolveProjectPath(this.projectRoot, "provenance.jsonl");
  }

  append(event, payload = {}) {
    const record = {
      event_id: payload.event_id ?? createEventId("evt"),
      event,
      ...payload,
      created_at: payload.created_at ?? nowIso(),
    };

    this.lockManager.withLock("provenance", () => {
      appendJsonLineSync(this.provenancePath, record);
    });

    return record;
  }
}

export class ActivityManager {
  constructor(projectRoot, lockManager) {
    this.projectRoot = path.resolve(projectRoot);
    this.lockManager = lockManager;
    this.activityPath = resolveProjectPath(this.projectRoot, "activity.jsonl");
  }

  append(message, payload = {}) {
    const record = {
      activity_id: payload.activity_id ?? createEventId("act"),
      event: payload.event ?? "activity",
      message,
      ...payload,
      created_at: payload.created_at ?? nowIso(),
    };

    this.lockManager.withLock("activity", () => {
      appendJsonLineSync(this.activityPath, record);
    });

    return record;
  }
}

export class PipelineManager {
  constructor(runtime) {
    this.runtime = runtime;
  }

  getPipeline() {
    return this.runtime.readPipeline();
  }

  ensureStep(stepId, name = titleizeSlug(stepId)) {
    safeIdentifier(stepId, "step_id");

    const pipeline = this.runtime.lockManager.withLock("pipeline", () => {
      const current = this.runtime.readPipeline();
      current.steps = Array.isArray(current.steps) ? current.steps : [];
      const existing = current.steps.find((item) => item.id === stepId);
      if (existing) {
        if (!existing.name) {
          existing.name = name;
          this.runtime.writePipelineUnlocked(current);
        }
        return current;
      }

      current.steps.push({
        id: stepId,
        name,
        status: "pending",
        updated_at: nowIso(),
      });
      this.runtime.writePipelineUnlocked(current);
      return current;
    });

    this.runtime.notifier.send("pipeline.step.updated", {
      pipeline,
      status: "pending",
      step_id: stepId,
    });

    return pipeline;
  }

  updateStepStatus(stepId, status, extra = {}) {
    safeIdentifier(stepId, "step_id");
    if (!PIPELINE_STATUSES.has(status)) {
      throw new Error(`Invalid pipeline step status: ${status}`);
    }

    const pipeline = this.runtime.lockManager.withLock("pipeline", () => {
      const current = this.runtime.readPipeline();
      const step = current.steps.find((item) => item.id === stepId);
      if (!step) {
        throw new Error(`Pipeline step not found: ${stepId}`);
      }

      step.status = status;
      step.updated_at = nowIso();
      if (extra.error) {
        step.error = String(extra.error);
      } else {
        delete step.error;
      }

      this.runtime.writePipelineUnlocked(current);
      return current;
    });

    this.runtime.notifier.send("pipeline.step.updated", {
      step_id: stepId,
      status,
      pipeline,
    });

    return pipeline;
  }

  markStepRunning(stepId) {
    return this.updateStepStatus(stepId, "running");
  }

  markStepDone(stepId) {
    return this.updateStepStatus(stepId, "done");
  }

  markStepFailed(stepId, error = null) {
    return this.updateStepStatus(stepId, "failed", { error });
  }
}

export class ContextBridge {
  constructor(runtime) {
    this.runtime = runtime;
  }

  getContext() {
    return this.runtime.readContext();
  }

  updateContext(patch = {}) {
    const context = this.runtime.lockManager.withLock("context", () => {
      const current = this.runtime.readContext();
      const next = {
        ...current,
        ...filterContextPatch(patch),
        updated_at: nowIso(),
      };
      this.runtime.writeContextUnlocked(next);
      return next;
    });

    this.runtime.notifier.send("context.updated", { context });
    return context;
  }
}

export class AssetManager {
  constructor(runtime) {
    this.runtime = runtime;
  }

  createAsset(input = {}) {
    return this.runtime.createAsset(input);
  }

  importAsset(input = {}) {
    return this.runtime.importAsset(input);
  }

  createVersion(input = {}) {
    return this.runtime.createVersion(input);
  }

  setCurrentVersion(assetId, versionId) {
    return this.runtime.setCurrentVersion(assetId, versionId);
  }

  getCurrentAsset(assetId) {
    return this.runtime.getCurrentAsset(assetId);
  }

  registerLargeFile(input = {}) {
    return this.runtime.registerLargeFile(input);
  }

  exportMarkdownBackup(asset, version, data) {
    return this.runtime.exportMarkdownBackup(asset, version, data);
  }

  parseMarkdownExternalEdit(filePath, options = {}) {
    return this.runtime.handleExternalMarkdownEdit(filePath, options);
  }

  validateAssetData(type, data) {
    return validateAssetData(type, data);
  }

  saveHtmlAssetFromView(input = {}) {
    return this.runtime.saveHtmlAssetFromView(input);
  }
}

export class FileWatcher {
  constructor(runtime) {
    this.runtime = runtime;
    this.watcher = null;
    this.pending = new Map();
  }

  start() {
    if (this.watcher) {
      return this;
    }

    const textDir = resolveProjectPath(this.runtime.projectRoot, "assets/texts");
    fs.mkdirSync(textDir, { recursive: true });
    this.watcher = fs.watch(textDir, (eventType, filename) => {
      if (!filename || !String(filename).endsWith(".md")) {
        return;
      }

      const absolutePath = path.join(textDir, String(filename));
      clearTimeout(this.pending.get(absolutePath));
      const timer = setTimeout(() => {
        this.pending.delete(absolutePath);
        if (!fs.existsSync(absolutePath)) {
          return;
        }

        try {
          this.runtime.handleExternalMarkdownEdit(absolutePath, {
            fromWatcher: true,
          });
        } catch (error) {
          const activity = this.runtime.activity.append(
            `External Markdown edit failed: ${path.basename(absolutePath)}`,
            {
              event: "external_file_edit_failed",
              error: error instanceof Error ? error.message : String(error),
              path: toProjectRelative(this.runtime.projectRoot, absolutePath),
            },
          );
          this.runtime.notifier.send("activity.created", { activity });
        }
      }, eventType === "rename" ? 150 : 75);
      this.pending.set(absolutePath, timer);
    });

    return this;
  }

  close() {
    for (const timer of this.pending.values()) {
      clearTimeout(timer);
    }
    this.pending.clear();

    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}

export class ProjectStateWatcher {
  constructor(runtime) {
    this.runtime = runtime;
    this.timer = null;
    this.watchers = [];
  }

  start() {
    if (this.watchers.length > 0) {
      return this;
    }

    for (const relativePath of [
      ".",
      "data",
      "assets",
      "assets/references",
      "assets/texts",
      "assets/images",
      "assets/audio",
      "assets/videos",
      "assets/html",
    ]) {
      const absolutePath = resolveProjectPath(this.runtime.projectRoot, relativePath);
      fs.mkdirSync(absolutePath, { recursive: true });
      try {
        const watcher = fs.watch(absolutePath, (eventType, filename) => {
          this.schedule(eventType, filename ? path.join(relativePath, String(filename)) : relativePath);
        });
        this.watchers.push(watcher);
      } catch {
        // Watch support differs by filesystem. Missing watch coverage should not
        // prevent the dashboard server from serving the workspace.
      }
    }

    return this;
  }

  schedule(eventType, relativePath) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.timer = null;
      this.runtime.notifier.send("project.updated", {
        event_type: eventType,
        path: String(relativePath ?? "").replace(/^\.\//u, ""),
        project_id: this.runtime.readProject().project_id ?? null,
      });
    }, 120);
  }

  close() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    for (const watcher of this.watchers) {
      try {
        watcher.close();
      } catch {
        // Ignore already closed native watchers.
      }
    }
    this.watchers = [];
  }
}

export function initializeProject(options = {}) {
  const projectRoot = options.projectRoot
    ? path.resolve(expandHome(options.projectRoot))
    : options.studioRoot
      ? path.resolve(expandHome(options.studioRoot))
      : options.workdir
        ? resolveStudioRoot(options.workdir)
        : resolveProjectRoot(safeSlug(options.projectSlug ?? options.project_id), {
            projectsRoot: options.projectsRoot,
          });
  const projectSlug = safeSlug(
    options.projectSlug ??
      options.project_id ??
      (path.basename(projectRoot) === POSTPLUS_STUDIO_DIRECTORY_NAME
        ? "postplus-studio"
        : path.basename(projectRoot)),
  );
  const createdAt = nowIso();
  const pipelineId = safeIdentifier(
    options.pipelineId ?? "ad-video-pipeline",
    "pipeline_id",
  );
  const steps = normalizePipelineSteps(options.steps);

  fs.mkdirSync(projectRoot, { recursive: true });
  ensureProjectDirectories(projectRoot);

  const lockManager = new LockManager(projectRoot);
  const projectPath = resolveProjectPath(projectRoot, "project.json");
  const studioPath = resolveProjectPath(projectRoot, "studio.json");
  const manifestPath = resolveProjectPath(projectRoot, "manifest.json");
  const pipelinePath = resolveProjectPath(projectRoot, "pipeline.json");
  const contextPath = resolveProjectPath(projectRoot, "context.json");

  lockManager.withLock("studio", () => {
    if (isEmptyFile(studioPath)) {
      writeJsonFileAtomic(studioPath, {
        schemaVersion: 1,
        studio_id: projectSlug,
        name: options.name ?? "PostPlus Studio",
        root_name: POSTPLUS_STUDIO_DIRECTORY_NAME,
        created_at: createdAt,
        updated_at: createdAt,
      });
    }
  });

  lockManager.withLock("project", () => {
    if (isEmptyFile(projectPath)) {
      writeJsonFileAtomic(projectPath, {
        project_id: projectSlug,
        name: options.name ?? titleizeSlug(projectSlug),
        goal: options.goal ?? "",
        status: options.status ?? "active",
        created_at: createdAt,
        updated_at: createdAt,
      });
    }
  });

  lockManager.withLock("manifest", () => {
    if (isEmptyFile(manifestPath)) {
      writeJsonFileAtomic(manifestPath, {
        assets: [],
      });
    }
  });

  lockManager.withLock("pipeline", () => {
    if (isEmptyFile(pipelinePath)) {
      writeJsonFileAtomic(pipelinePath, {
        pipeline_id: pipelineId,
        steps: steps.map((step) => ({
          id: step.id,
          name: step.name,
          status: "pending",
          updated_at: createdAt,
        })),
      });
    }
  });

  lockManager.withLock("context", () => {
    if (isEmptyFile(contextPath)) {
      writeJsonFileAtomic(contextPath, {
        active_project: projectSlug,
        active_pipeline: pipelineId,
        active_step: steps[0]?.id ?? "brief",
        selected_asset_id: null,
        selected_block_id: null,
        selected_version: null,
        visible_panel: "dashboard",
        playhead_time: null,
        related_script_block: null,
        updated_at: createdAt,
      });
    }
  });

  return {
    projectRoot,
    projectSlug,
  };
}

export class PostPlusWorkspaceRuntime {
  constructor(projectRoot, options = {}) {
    this.projectRoot = path.resolve(expandHome(projectRoot));
    ensureProjectDirectories(this.projectRoot);
    this.notifier = options.notifier ?? new DashboardNotifier();
    this.lockManager = new LockManager(this.projectRoot);
    this.provenance = new ProvenanceManager(this.projectRoot, this.lockManager);
    this.activity = new ActivityManager(this.projectRoot, this.lockManager);
    this.pipeline = new PipelineManager(this);
    this.context = new ContextBridge(this);
    this.assets = new AssetManager(this);
    this.fileWatcher = new FileWatcher(this);
    this.internalMarkdownWrites = new Map();
  }

  switchProjectRoot(projectRoot) {
    this.fileWatcher?.close();
    this.projectRoot = path.resolve(expandHome(projectRoot));
    ensureProjectDirectories(this.projectRoot);
    this.lockManager = new LockManager(this.projectRoot);
    this.provenance = new ProvenanceManager(this.projectRoot, this.lockManager);
    this.activity = new ActivityManager(this.projectRoot, this.lockManager);
    this.pipeline = new PipelineManager(this);
    this.context = new ContextBridge(this);
    this.assets = new AssetManager(this);
    this.fileWatcher = new FileWatcher(this);
    this.internalMarkdownWrites.clear();
  }

  readProject() {
    return readJsonFile(resolveProjectPath(this.projectRoot, "project.json"), {});
  }

  writeProjectUnlocked(project) {
    writeJsonFileAtomic(resolveProjectPath(this.projectRoot, "project.json"), project);
  }

  readManifest() {
    return readJsonFile(resolveProjectPath(this.projectRoot, "manifest.json"), {
      assets: [],
    });
  }

  writeManifestUnlocked(manifest) {
    writeJsonFileAtomic(
      resolveProjectPath(this.projectRoot, "manifest.json"),
      manifest,
    );
  }

  readPipeline() {
    return readJsonFile(resolveProjectPath(this.projectRoot, "pipeline.json"), {
      pipeline_id: "ad-video-pipeline",
      steps: [],
    });
  }

  writePipelineUnlocked(pipeline) {
    writeJsonFileAtomic(
      resolveProjectPath(this.projectRoot, "pipeline.json"),
      pipeline,
    );
  }

  readContext() {
    return readJsonFile(resolveProjectPath(this.projectRoot, "context.json"), {});
  }

  writeContextUnlocked(context) {
    writeJsonFileAtomic(resolveProjectPath(this.projectRoot, "context.json"), context);
  }

  readProvenance() {
    return readJsonlFile(resolveProjectPath(this.projectRoot, "provenance.jsonl"));
  }

  readActivity() {
    return readJsonlFile(resolveProjectPath(this.projectRoot, "activity.jsonl"));
  }

  getProjectSnapshot() {
    const manifest = this.readManifest();
    const currentAssetData = {};

    for (const asset of manifest.assets ?? []) {
      const version = findCurrentVersion(asset);
      if (version?.data_path) {
        try {
          currentAssetData[asset.asset_id] = readJsonFile(
            resolveProjectPath(this.projectRoot, version.data_path, "data_path"),
          );
        } catch {
          currentAssetData[asset.asset_id] = null;
        }
      } else {
        currentAssetData[asset.asset_id] = null;
      }
    }

    return {
      activity: this.readActivity(),
      context: this.readContext(),
      currentAssetData,
      manifest,
      pipeline: this.readPipeline(),
      project: this.readProject(),
      provenance: this.readProvenance(),
    };
  }

  createAsset(input = {}) {
    const assetId = safeIdentifier(input.assetId ?? input.asset_id, "asset_id");
    const type = validateAssetType(input.type ?? "text");
    const role = validateAssetRole(input.role ?? "generated_asset");
    const status = validateAssetStatus(input.status ?? "ready");
    const stepId = safeIdentifier(input.stepId ?? input.step_id ?? "brief", "step_id");
    const source = input.source ?? "generated_by_agent";
    const createdAt = nowIso();

    return this.lockManager.withLock(`asset-${assetId}`, () => {
      const manifest = this.readManifest();
      if (manifest.assets.some((asset) => asset.asset_id === assetId)) {
        throw new Error(`Asset already exists: ${assetId}`);
      }

      const versionId = safeIdentifier(
        input.versionId ?? input.version_id ?? buildVersionId(assetId, 1),
        "version_id",
      );
      const asset = {
        asset_id: assetId,
        type,
        step_id: stepId,
        role,
        status,
        reusable: input.reusable ?? true,
        current_version: versionId,
        versions: [],
      };

      if (input.name) {
        asset.name = String(input.name);
      }
      const sourceAssets = normalizeStringArray(input.sourceAssets ?? input.source_assets);
      if (sourceAssets.length) {
        asset.source_assets = sourceAssets;
      }

      const version = this.createVersionFiles(asset, {
        createdAt,
        data: normalizeVersionData(type, input.data, {
          assetId,
          versionId,
        }),
        filePath: input.file_path ?? input.filePath ?? null,
        source,
        versionId,
      });
      asset.versions.push(version);
      manifest.assets.push(asset);

      this.lockManager.withLock("manifest", () => {
        this.writeManifestUnlocked(manifest);
      });

      const provenance = this.provenance.append("asset_created", {
        asset_id: assetId,
        version_id: versionId,
        created_by: input.createdBy ?? input.created_by ?? source,
        input_assets: input.inputAssets ?? input.input_assets ?? [],
      });
      const activity = this.activity.append(
        input.activityMessage ?? `${displayAssetName(asset)} created`,
        {
          asset_id: assetId,
          event: "asset_created",
          version_id: versionId,
        },
      );

      this.notifier.send("provenance.created", { provenance });
      this.notifier.send("activity.created", { activity });
      this.notifier.send("asset.created", {
        asset,
        currentData: this.readCurrentAssetData(asset),
      });

      return {
        asset,
        version,
      };
    });
  }

  importAsset(input = {}) {
    const sourceFile = path.resolve(expandHome(input.sourceFile ?? input.source_file));
    if (!fs.existsSync(sourceFile)) {
      throw new Error(`Source file not found: ${sourceFile}`);
    }

    const type = validateAssetType(input.type ?? inferAssetTypeFromPath(sourceFile));
    if (type === "text") {
      const ext = path.extname(sourceFile).toLowerCase();
      const text = fs.readFileSync(sourceFile, "utf8");
      const data =
        ext === ".json"
          ? JSON.parse(text)
          : parseMarkdownAsset(text, {
              assetId: input.assetId ?? input.asset_id ?? "text_asset",
              versionId: input.versionId ?? input.version_id ?? "text_asset_v1",
            });

      return this.createAsset({
        ...input,
        data,
        source: input.source ?? "generated_by_agent",
        type,
      });
    }

    return this.registerLargeFile({
      ...input,
      sourceFile,
      type,
    });
  }

  createVersion(input = {}) {
    const assetId = safeIdentifier(input.assetId ?? input.asset_id, "asset_id");
    const source = input.source ?? "edited_by_user";
    const createdAt = nowIso();

    return this.lockManager.withLock(`asset-${assetId}`, () => {
      const manifest = this.readManifest();
      const asset = findAssetOrThrow(manifest, assetId);
      const fromVersion = asset.current_version;
      const nextIndex = (asset.versions?.length ?? 0) + 1;
      const versionId = safeIdentifier(
        input.versionId ?? input.version_id ?? buildVersionId(assetId, nextIndex),
        "version_id",
      );
      const data = normalizeVersionData(asset.type, input.data, {
        assetId,
        versionId,
      });
      const version = this.createVersionFiles(asset, {
        createdAt,
        data,
        filePath: input.file_path ?? input.filePath ?? null,
        source,
        versionId,
      });

      asset.versions.push(version);
      if (input.setCurrent !== false && input.set_current !== false) {
        asset.current_version = versionId;
      }
      asset.status = validateAssetStatus(input.status ?? asset.status ?? "ready");
      if (Object.hasOwn(input, "sourceAssets") || Object.hasOwn(input, "source_assets")) {
        asset.source_assets = normalizeStringArray(input.sourceAssets ?? input.source_assets);
      }

      this.lockManager.withLock("manifest", () => {
        this.writeManifestUnlocked(manifest);
      });

      const updateEvent = this.provenance.append("asset_updated", {
        actor: input.actor ?? actorFromSource(source),
        asset_id: assetId,
        from_version: fromVersion,
        reason: input.reason ?? null,
        to_version: versionId,
      });
      const specificEvent = maybeAppendSourceSpecificProvenance(this.provenance, {
        actor: input.actor ?? actorFromSource(source),
        assetId,
        filePath: input.externalFilePath ?? input.path ?? null,
        fromVersion,
        reason: input.reason ?? null,
        source,
        toVersion: versionId,
      });
      const activity = this.activity.append(
        input.activityMessage ?? `${displayAssetName(asset)} updated`,
        {
          asset_id: assetId,
          event: "asset_updated",
          version_id: versionId,
        },
      );

      this.notifier.send("provenance.created", { provenance: updateEvent });
      if (specificEvent) {
        this.notifier.send("provenance.created", { provenance: specificEvent });
      }
      this.notifier.send("activity.created", { activity });
      this.notifier.send("asset.updated", {
        asset,
        currentData: this.readCurrentAssetData(asset),
        from_version: fromVersion,
        to_version: versionId,
      });

      return {
        asset,
        fromVersion,
        version,
      };
    });
  }

  createVersionFiles(asset, options = {}) {
    const versionId = safeIdentifier(options.versionId, "version_id");
    const version = {
      version_id: versionId,
      source: options.source,
      created_at: options.createdAt ?? nowIso(),
    };

    if (options.data !== null && options.data !== undefined) {
      validateAssetData(asset.type, options.data);
      const dataPath = `data/${safeFileStem(versionId)}.json`;
      writeJsonFileAtomic(
        resolveProjectPath(this.projectRoot, dataPath, "data_path"),
        options.data,
      );
      version.data_path = dataPath;

      if (asset.type === "text") {
        version.file_path = this.exportMarkdownBackup(asset, version, options.data);
      }
    }

    if (options.filePath) {
      assertSafeRelativePath(options.filePath, "file_path");
      version.file_path = options.filePath.split(path.sep).join("/");
    }

    return version;
  }

  exportMarkdownBackup(asset, version, data) {
    if (asset.type !== "text") {
      throw new Error("Markdown backup export is only supported for text assets.");
    }

    const mdPath = `assets/texts/${safeFileStem(version.version_id)}.md`;
    const absolutePath = resolveProjectPath(this.projectRoot, mdPath, "file_path");
    const text = renderMarkdownBackup(asset, version, data);
    this.markInternalMarkdownWrite(absolutePath);
    atomicWriteFileSync(absolutePath, text);
    return mdPath;
  }

  setCurrentVersion(assetId, versionId) {
    safeIdentifier(assetId, "asset_id");
    safeIdentifier(versionId, "version_id");

    const asset = this.lockManager.withLock(`asset-${assetId}`, () => {
      const manifest = this.readManifest();
      const target = findAssetOrThrow(manifest, assetId);
      if (!target.versions.some((version) => version.version_id === versionId)) {
        throw new Error(`Version not found for ${assetId}: ${versionId}`);
      }
      target.current_version = versionId;

      this.lockManager.withLock("manifest", () => {
        this.writeManifestUnlocked(manifest);
      });

      return target;
    });

    this.notifier.send("asset.updated", {
      asset,
      currentData: this.readCurrentAssetData(asset),
    });
    return asset;
  }

  getCurrentAsset(assetId) {
    safeIdentifier(assetId, "asset_id");
    const manifest = this.readManifest();
    const asset = findAssetOrThrow(manifest, assetId);
    const version = findCurrentVersion(asset);
    return {
      asset,
      data: this.readCurrentAssetData(asset),
      version,
    };
  }

  readCurrentAssetData(asset) {
    const version = findCurrentVersion(asset);
    if (!version?.data_path) {
      return null;
    }

    return readJsonFile(resolveProjectPath(this.projectRoot, version.data_path));
  }

  updateTextBlock(assetId, blockId, text, options = {}) {
    safeIdentifier(blockId, "block_id");
    const current = this.getCurrentAsset(assetId);
    if (current.asset.type !== "text") {
      throw new Error(`Asset is not a text asset: ${assetId}`);
    }

    const data = structuredClone(current.data);
    const block = data.blocks.find((item) => item.block_id === blockId);
    if (!block) {
      throw new Error(`Text block not found: ${blockId}`);
    }

    block.text = String(text ?? "");
    data.updated_at = nowIso();

    return this.createVersion({
      actor: options.actor ?? "user",
      assetId,
      data,
      reason: options.reason ?? `User edited block ${blockId} in HTML dashboard`,
      source: options.source ?? "edited_by_user",
    });
  }

  updateTextAsset(input = {}) {
    const assetId = safeIdentifier(input.assetId ?? input.asset_id, "asset_id");
    const data = {
      asset_id: assetId,
      blocks: Array.isArray(input.blocks)
        ? input.blocks
        : Array.isArray(input.data?.blocks)
          ? input.data.blocks
          : [],
      type: "text",
      updated_at: nowIso(),
    };
    const manifest = this.readManifest();
    const existing = (manifest.assets ?? []).find((asset) => asset.asset_id === assetId);

    if (!existing) {
      return this.createAsset({
        activityMessage: input.activityMessage ?? `${titleizeSlug(assetId)} created`,
        assetId,
        data,
        name: input.name,
        role: input.role ?? "generated_asset",
        source: input.source ?? "edited_by_user",
        status: input.status ?? "ready",
        stepId: input.stepId ?? input.step_id ?? "script",
        type: "text",
      });
    }

    if (existing.type !== "text") {
      throw new Error(`Asset is not a text asset: ${assetId}`);
    }

    return this.createVersion({
      activityMessage: input.activityMessage ?? `${displayAssetName(existing)} updated`,
      actor: input.actor ?? "user",
      assetId,
      data,
      reason: input.reason ?? "Text asset edited in workspace dashboard",
      source: input.source ?? "edited_by_user",
    });
  }

  registerLargeFile(input = {}) {
    const assetId = safeIdentifier(input.assetId ?? input.asset_id, "asset_id");
    const type = validateAssetType(input.type ?? inferAssetTypeFromPath(input.sourceFile));
    if (!["image", "audio", "video", "reference"].includes(type)) {
      throw new Error(`Large file registration is not supported for type: ${type}`);
    }

    const sourceFile = path.resolve(expandHome(input.sourceFile ?? input.source_file));
    if (!fs.existsSync(sourceFile)) {
      throw new Error(`Source file not found: ${sourceFile}`);
    }

    const targetRelativePath = this.copyFileIntoAssets(type, sourceFile, {
      preferredName: input.fileName ?? input.file_name,
    });

    const result = this.createAsset({
      ...input,
      assetId,
      file_path: targetRelativePath,
      source: input.source ?? "generated_by_agent",
      status: input.status ?? "ready",
      type,
    });
    this.materializePipelineRunForVideoOutput(result.asset, input);
    return result;
  }

  upsertLargeFileAsset(input = {}) {
    const assetId = safeIdentifier(input.assetId ?? input.asset_id, "asset_id");
    const type = validateAssetType(input.type ?? inferAssetTypeFromPath(input.sourceFile));
    if (!["image", "audio", "video", "reference"].includes(type)) {
      throw new Error(`Large file registration is not supported for type: ${type}`);
    }

    const sourceFile = path.resolve(expandHome(input.sourceFile ?? input.source_file));
    const targetRelativePath = this.copyFileIntoAssets(type, sourceFile, {
      preferredName: input.fileName ?? input.file_name,
    });
    const manifest = this.readManifest();
    const existing = (manifest.assets ?? []).find((asset) => asset.asset_id === assetId);

    if (!existing) {
      const result = this.createAsset({
        ...input,
        assetId,
        file_path: targetRelativePath,
        source: input.source ?? "generated_by_agent",
        status: input.status ?? "ready",
        type,
      });
      this.materializePipelineRunForVideoOutput(result.asset, input);
      return result;
    }

    if (existing.type !== type) {
      throw new Error(`Asset ${assetId} is type ${existing.type}, not ${type}.`);
    }

    const result = this.createVersion({
      activityMessage: input.activityMessage ?? `${displayAssetName(existing)} updated`,
      actor: input.actor ?? "fixture",
      assetId,
      filePath: targetRelativePath,
      reason: input.reason ?? "Fixture pipeline generated a new media file",
      source: input.source ?? "generated_by_agent",
      sourceAssets: input.sourceAssets ?? input.source_assets ?? [],
    });
    this.materializePipelineRunForVideoOutput(result.asset, input);
    return result;
  }

  materializePipelineRunForVideoOutput(asset, input = {}) {
    if (!asset || asset.type !== "video") {
      return null;
    }

    const inputAssets = normalizeStringArray(
      input.sourceAssets ?? input.source_assets ?? asset.source_assets,
    );
    if (inputAssets.length === 0) {
      return null;
    }

    for (const [stepId, name] of [
      ["script", "Script"],
      ["visuals", "Visuals"],
      ["audio", "Audio"],
      ["video", "Video"],
    ]) {
      this.pipeline.ensureStep(stepId, name);
    }

    const manifest = this.readManifest();
    const inputAssetRecords = inputAssets
      .map((assetId) => manifest.assets.find((item) => item.asset_id === assetId))
      .filter(Boolean);
    const inputTypes = new Set(inputAssetRecords.map((item) => item.type));
    const inputSteps = new Set(inputAssetRecords.map((item) => item.step_id));

    if (inputTypes.has("text") || inputSteps.has("script")) {
      this.pipeline.markStepDone("script");
    }
    if (
      inputTypes.has("image") ||
      inputTypes.has("reference") ||
      inputSteps.has("visuals") ||
      inputSteps.has("storyboard")
    ) {
      this.pipeline.markStepDone("visuals");
    }
    if (inputTypes.has("audio") || inputSteps.has("audio")) {
      this.pipeline.markStepDone("audio");
    } else if (input.audioOptional !== false && input.audio_optional !== false) {
      this.pipeline.markStepDone("audio");
    }
    this.pipeline.markStepDone("video");

    const pipeline = this.lockManager.withLock("pipeline", () => {
      const current = this.readPipeline();
      const runs = Array.isArray(current.runs) ? current.runs : [];
      const existing = runs.find((run) =>
        normalizeStringArray(run.output_assets).includes(asset.asset_id),
      );
      const updatedAt = nowIso();
      const command =
        input.pipelineCommand ??
        input.pipeline_command ??
        `Generate ${displayAssetName(asset)} from selected workspace assets`;

      if (existing) {
        existing.command = existing.command || command;
        existing.input_assets = mergeUnique([
          ...normalizeStringArray(existing.input_assets),
          ...inputAssets,
        ]);
        existing.output_assets = mergeUnique([
          ...normalizeStringArray(existing.output_assets),
          asset.asset_id,
        ]);
        existing.status = "done";
        existing.updated_at = updatedAt;
        this.writePipelineUnlocked(current);
        return current;
      }

      const runNumber = String(runs.length + 1).padStart(2, "0");
      const run = {
        run_id: input.pipelineRunId ?? input.pipeline_run_id ?? `run-${runNumber}`,
        title:
          input.pipelineRunTitle ??
          input.pipeline_run_title ??
          `Run ${runNumber}`,
        command,
        status: "done",
        input_assets: inputAssets,
        output_assets: [asset.asset_id],
        created_at: updatedAt,
        updated_at: updatedAt,
        source: "video_output",
      };
      current.runs = [...runs, run];
      this.writePipelineUnlocked(current);
      return current;
    });

    this.notifier.send("pipeline.step.updated", { pipeline });
    const activity = this.activity.append(
      `${displayAssetName(asset)} linked to pipeline`,
      {
        asset_id: asset.asset_id,
        event: "pipeline_run_materialized",
        version_id: asset.current_version,
      },
    );
    this.notifier.send("activity.created", { activity });

    return pipeline;
  }

  uploadImageAsset(input = {}) {
    const upload = normalizeUploadedImage(input);
    const tempDir = path.join(this.projectRoot, ".postplus/temp/uploads");
    fs.mkdirSync(tempDir, { recursive: true });
    const tempPath = path.join(
      tempDir,
      `${safeFileStem(upload.assetId)}-${crypto.randomUUID()}${upload.extension}`,
    );

    try {
      atomicWriteFileSync(tempPath, upload.bytes);
      return this.upsertLargeFileAsset({
        activityMessage: input.activityMessage ?? `${upload.name} imported`,
        assetId: upload.assetId,
        fileName: upload.fileName,
        name: upload.name,
        reason: input.reason ?? "Image uploaded through workspace dashboard",
        role: input.role ?? "reference",
        source: input.source ?? "uploaded_by_user",
        sourceAssets: input.sourceAssets ?? input.source_assets ?? [],
        sourceFile: tempPath,
        status: "ready",
        stepId: input.stepId ?? input.step_id ?? "visuals",
        type: "image",
      });
    } finally {
      fs.rmSync(tempPath, { force: true });
    }
  }

  launchFixturePipeline(input = {}) {
    const command =
      input.command ??
      "Create a vertical product video showing the phone stand in natural light.";
    const currentPipeline = this.readPipeline();
    const currentRuns = Array.isArray(currentPipeline.runs)
      ? currentPipeline.runs
      : [];
    const runNumber = String(currentRuns.length + 1).padStart(2, "0");
    const pipelineRunId = safeIdentifier(
      input.pipelineRunId ?? input.pipeline_run_id ?? `run-${runNumber}`,
      "pipeline_run_id",
    );
    const pipelineRunTitle =
      input.pipelineRunTitle ?? input.pipeline_run_title ?? `Run ${runNumber}`;

    for (const [stepId, name] of [
      ["script", "Script"],
      ["visuals", "Visuals"],
      ["audio", "Audio"],
      ["video", "Video"],
    ]) {
      this.pipeline.ensureStep(stepId, name);
      this.pipeline.markStepRunning(stepId);
    }

    const sourceDir = resolveProjectPath(
      this.projectRoot,
      `data/pipeline-runs/${pipelineRunId}/generated`,
    );
    fs.mkdirSync(sourceDir, { recursive: true });

    const scriptPath = path.join(sourceDir, "script-main.json");
    writeJsonFileAtomic(scriptPath, {
      blocks: [
        {
          block_id: "hook_001",
          label: "Hook",
          text: "Ever tried taking the perfect selfie, only to get your arm in the shot?",
        },
        {
          block_id: "problem_001",
          label: "Problem",
          text: "You want natural video, but holding the phone changes every angle.",
        },
        {
          block_id: "solution_001",
          label: "Solution",
          text: "Phone Free Selfie keeps the camera steady so you can record hands-free.",
        },
        {
          block_id: "cta_001",
          label: "CTA",
          text: "Set it down, hit record, and capture what matters.",
        },
      ],
    });

    const imageSpecs = [
      {
        assetId: "product_lavender",
        fileName: "product-lavender.svg",
        name: "Phone Mount - Lavender",
        stepId: "visuals",
        tone: "purple",
        title: "Phone Mount - Lavender",
      },
      {
        assetId: "lifestyle_talking",
        fileName: "lifestyle-talking.svg",
        name: "Lifestyle - Talking to Camera",
        stepId: "visuals",
        tone: "green",
        title: "Lifestyle - Talking to Camera",
      },
      {
        assetId: "compact_portable",
        fileName: "compact-portable.svg",
        name: "Compact & Portable",
        stepId: "visuals",
        tone: "gray",
        title: "Compact & Portable",
      },
      {
        assetId: "storyboard_scene_01",
        fileName: "storyboard-scene-01.svg",
        name: "Scene 1 - Greeting",
        stepId: "storyboard",
        tone: "gray",
        title: "Scene 1 - Greeting",
      },
      {
        assetId: "storyboard_scene_02",
        fileName: "storyboard-scene-02.svg",
        name: "Frame 02 - Product Reveal",
        stepId: "storyboard",
        tone: "blue",
        title: "Frame 02 - Product Reveal",
      },
    ];

    for (const [index, spec] of imageSpecs.entries()) {
      atomicWriteFileSync(
        path.join(sourceDir, spec.fileName),
        renderFixtureSvg(spec, index + 1),
      );
    }

    const videoSource = path.join(sourceDir, "outcome-video-v1-2.mp4");
    generateFixtureVideo(videoSource);

    const skillRunDir = resolveProjectPath(
      this.projectRoot,
      `.postplus/runs/workspace-artifact-ingestor/${pipelineRunId}`,
    );
    fs.mkdirSync(skillRunDir, { recursive: true });
    const inputPath = path.join(skillRunDir, "input.json");
    const outputPath = path.join(skillRunDir, "output.json");
    const inputAssetIds = [
      "script_main",
      ...imageSpecs.map((spec) => spec.assetId),
    ];
    writeJsonFileAtomic(inputPath, {
      schemaVersion: 1,
      input: {
        artifacts: [
          {
            assetId: "script_main",
            name: "Main Script",
            path: scriptPath,
            role: "generated_asset",
            stepId: "script",
            type: "text",
          },
          ...imageSpecs.map((spec) => ({
            assetId: spec.assetId,
            name: spec.name,
            path: path.join(sourceDir, spec.fileName),
            role: spec.stepId === "storyboard" ? "intermediate" : "generated_asset",
            stepId: spec.stepId,
            type: "image",
          })),
          {
            assetId: "outcome_video_v1_2",
            name: "Outcome Video v1.2",
            path: videoSource,
            pipelineCommand: command,
            pipelineRunId,
            pipelineRunTitle,
            role: "final_output",
            sourceAssets: inputAssetIds,
            stepId: "video",
            type: "video",
          },
        ],
        project: this.projectRoot,
      },
    });

    const skillStartedAt = nowIso();
    this.activity.append("Running workspace-artifact-ingestor for pipeline", {
      event: "skill_run_started",
      pipeline_run_id: pipelineRunId,
      skill_id: "workspace-artifact-ingestor",
    });

    let stdout = "";
    try {
      stdout = execFileSync(
        process.execPath,
        [
          WORKSPACE_ARTIFACT_INGESTOR_SCRIPT,
          "--input",
          inputPath,
          "--output",
          outputPath,
        ],
        {
          cwd: this.projectRoot,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
    } catch (error) {
      const stderr = error?.stderr ? String(error.stderr) : "";
      this.activity.append("workspace-artifact-ingestor failed", {
        event: "skill_run_failed",
        pipeline_run_id: pipelineRunId,
        skill_id: "workspace-artifact-ingestor",
        stderr,
      });
      throw new Error(stderr || error.message || "Pipeline skill run failed.");
    }

    const skillResult = readJsonFile(outputPath);
    this.provenance.append("skill_run_completed", {
      output_path: toProjectRelative(this.projectRoot, outputPath),
      pipeline_run_id: pipelineRunId,
      skill_id: "workspace-artifact-ingestor",
      started_at: skillStartedAt,
      stdout,
    });
    this.activity.append("workspace-artifact-ingestor completed", {
      event: "skill_run_completed",
      imported: skillResult.imported ?? [],
      pipeline_run_id: pipelineRunId,
      skill_id: "workspace-artifact-ingestor",
    });

    const manifest = this.readManifest();
    const assets = [
      ...inputAssetIds,
      "outcome_video_v1_2",
    ]
      .map((assetId) => manifest.assets.find((asset) => asset.asset_id === assetId))
      .filter(Boolean);
    const videoAsset = assets.find((asset) => asset.asset_id === "outcome_video_v1_2");
    const pipeline = this.readPipeline();

    const context = this.context.updateContext({
      active_step: "video",
      selected_asset_id: videoAsset?.asset_id ?? "outcome_video_v1_2",
      selected_block_id: null,
      selected_version: videoAsset?.current_version ?? null,
      visible_panel: "video_preview",
    });

    const activity = this.activity.append("Pipeline launched with workspace-artifact-ingestor", {
      event: "pipeline_launched",
      input_command: command,
      pipeline_run_id: pipelineRunId,
    });
    this.notifier.send("activity.created", { activity });

    return {
      assets,
      context,
      currentAssetData: this.getProjectSnapshot().currentAssetData,
      pipeline,
      skillResult,
    };
  }

  copyFileIntoAssets(type, sourceFile, options = {}) {
    const assetDir = ASSET_TYPE_DIRS[type];
    if (!assetDir) {
      throw new Error(`No asset directory configured for type: ${type}`);
    }

    const targetDir = resolveProjectPath(this.projectRoot, `assets/${assetDir}`);
    fs.mkdirSync(targetDir, { recursive: true });

    const sourceAbsolute = path.resolve(sourceFile);
    if (sourceAbsolute.startsWith(`${targetDir}${path.sep}`)) {
      return toProjectRelative(this.projectRoot, sourceAbsolute);
    }

    const ext = path.extname(sourceAbsolute);
    const preferredName =
      options.preferredName && path.extname(String(options.preferredName))
        ? path.basename(String(options.preferredName), path.extname(String(options.preferredName)))
        : options.preferredName;
    const baseName = safeFileStem(
      preferredName ?? path.basename(sourceAbsolute, ext),
      "asset",
    );
    let targetPath = path.join(targetDir, `${baseName}${ext.toLowerCase()}`);
    let index = 2;
    while (fs.existsSync(targetPath)) {
      targetPath = path.join(targetDir, `${baseName}-${index}${ext.toLowerCase()}`);
      index += 1;
    }

    fs.copyFileSync(sourceAbsolute, targetPath);
    return toProjectRelative(this.projectRoot, targetPath);
  }

  saveHtmlAssetFromView(input = {}) {
    const sourceView = safeIdentifier(
      input.sourceView ?? input.source_view ?? "dashboard",
      "source_view",
    );
    const action = String(input.action ?? "save_as_asset").trim();
    const role = validateAssetRole(input.role ?? HTML_ACTION_ROLES.get(action));
    const stepId = safeIdentifier(input.stepId ?? input.step_id ?? sourceView, "step_id");
    const html = String(input.html ?? "");

    if (!html.trim()) {
      throw new Error("HTML content is required.");
    }

    const manifest = this.readManifest();
    const assetId = safeIdentifier(
      input.assetId ??
        input.asset_id ??
        nextHtmlAssetId(manifest, sourceView),
      "asset_id",
    );
    const versionId = safeIdentifier(
      input.versionId ?? input.version_id ?? assetId,
      "version_id",
    );
    const filePath = nextHtmlFilePath(this.projectRoot, sourceView, role);
    const createdAt = nowIso();

    return this.lockManager.withLock(`asset-${assetId}`, () => {
      const currentManifest = this.readManifest();
      if (currentManifest.assets.some((asset) => asset.asset_id === assetId)) {
        throw new Error(`HTML asset already exists: ${assetId}`);
      }

      atomicWriteFileSync(
        resolveProjectPath(this.projectRoot, filePath, "file_path"),
        html.endsWith("\n") ? html : `${html}\n`,
      );

      const asset = {
        asset_id: assetId,
        type: "html",
        step_id: stepId,
        role,
        status: "ready",
        reusable: true,
        current_version: versionId,
        source_view: sourceView,
        source_assets: normalizeStringArray(input.sourceAssets ?? input.source_assets),
        saved_by: input.savedBy ?? input.saved_by ?? "user",
        versions: [
          {
            version_id: versionId,
            file_path: filePath,
            source: "saved_from_dashboard",
            created_at: createdAt,
          },
        ],
      };

      currentManifest.assets.push(asset);
      this.lockManager.withLock("manifest", () => {
        this.writeManifestUnlocked(currentManifest);
      });

      const provenance = this.provenance.append("html_asset_saved", {
        asset_id: assetId,
        saved_by: asset.saved_by,
        source_assets: asset.source_assets,
        source_view: sourceView,
      });
      const activity = this.activity.append(
        `${titleizeSlug(sourceView)} HTML saved as asset`,
        {
          asset_id: assetId,
          event: "html_asset_saved",
          version_id: versionId,
        },
      );

      this.notifier.send("provenance.created", { provenance });
      this.notifier.send("activity.created", { activity });
      this.notifier.send("html.asset.saved", { asset });
      this.notifier.send("asset.created", { asset, currentData: null });

      return {
        asset,
        version: asset.versions[0],
      };
    });
  }

  handleExternalMarkdownEdit(filePath, options = {}) {
    const absolutePath = path.resolve(filePath);
    const textDir = resolveProjectPath(this.projectRoot, "assets/texts");
    if (absolutePath !== textDir && !absolutePath.startsWith(`${textDir}${path.sep}`)) {
      throw new Error("External Markdown edits must be under assets/texts.");
    }

    if (options.fromWatcher && this.shouldIgnoreInternalMarkdownWrite(absolutePath)) {
      return null;
    }

    const relativePath = toProjectRelative(this.projectRoot, absolutePath);
    const manifest = this.readManifest();
    const asset = findAssetByVersionFilePath(manifest, relativePath);
    if (!asset) {
      throw new Error(`No text asset version owns Markdown path: ${relativePath}`);
    }

    if (options.fromWatcher && this.isCurrentMarkdownBackupContent(asset, relativePath, absolutePath)) {
      return null;
    }

    const currentVersion = findCurrentVersion(asset);
    const parsed = parseMarkdownAsset(fs.readFileSync(absolutePath, "utf8"), {
      assetId: asset.asset_id,
      versionId: buildVersionId(asset.asset_id, (asset.versions?.length ?? 0) + 1),
    });

    return this.createVersion({
      actor: "external",
      assetId: asset.asset_id,
      data: parsed,
      externalFilePath: relativePath,
      reason: "External Markdown edit",
      source: "external_file_edit",
      path: relativePath,
      previousVersion: currentVersion?.version_id ?? null,
    });
  }

  markInternalMarkdownWrite(absolutePath) {
    this.internalMarkdownWrites.set(path.resolve(absolutePath), Date.now() + 1500);
  }

  shouldIgnoreInternalMarkdownWrite(absolutePath) {
    const resolved = path.resolve(absolutePath);
    const expiresAt = this.internalMarkdownWrites.get(resolved);
    if (!expiresAt) {
      return false;
    }

    if (Date.now() > expiresAt) {
      this.internalMarkdownWrites.delete(resolved);
      return false;
    }

    return true;
  }

  isCurrentMarkdownBackupContent(asset, relativePath, absolutePath) {
    const normalized = relativePath.split(path.sep).join("/");
    const version = (asset.versions ?? []).find((item) => item.file_path === normalized);
    if (!version?.data_path) {
      return false;
    }

    try {
      const data = readJsonFile(resolveProjectPath(this.projectRoot, version.data_path));
      const expected = renderMarkdownBackup(asset, version, data);
      const actual = fs.readFileSync(absolutePath, "utf8");
      return actual === expected;
    } catch {
      return false;
    }
  }

  startMarkdownWatcher() {
    return this.fileWatcher.start();
  }
}

export async function startDashboardServer(options = {}) {
  const projectsRoot = resolveProjectsRoot(options.projectsRoot);
  const projectRoot = resolveProjectRoot(options.project, {
    projectRoot: options.projectRoot,
    projectsRoot,
  });
  const notifier = options.notifier ?? new DashboardNotifier();
  const runtime =
    options.runtime ?? new PostPlusWorkspaceRuntime(projectRoot, { notifier });
  runtime.notifier = notifier;
  runtime.dashboardDist = resolveDashboardDist(options.dashboardDist);
  runtime.enableFixtureLaunch = Boolean(options.enableFixtureLaunch);
  const state = {
    notifier,
    projectWatcher:
      options.watchProjectState === false ? null : new ProjectStateWatcher(runtime).start(),
    projectsRoot,
    runtime,
    watcher: options.watchMarkdown === false ? null : runtime.startMarkdownWatcher(),
    watchMarkdown: options.watchMarkdown !== false,
    watchProjectState: options.watchProjectState !== false,
  };
  const host = options.host ?? "127.0.0.1";
  const port = Number(options.port ?? 3978);

  const server = http.createServer(async (request, response) => {
    try {
      await handleDashboardRequest(state, request, response);
    } catch (error) {
      sendJson(response, error.statusCode ?? 500, {
        error: error instanceof Error ? error.message : String(error),
        ok: false,
      });
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address();
  const actualPort =
    address && typeof address === "object" ? address.port : Number(port);
  const url = `http://${host}:${actualPort}`;

  return {
    close: () =>
      new Promise((resolve, reject) => {
        state.projectWatcher?.close();
        state.watcher?.close();
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      }),
    runtime,
    server,
    url,
  };
}

async function handleDashboardRequest(state, request, response) {
  const { runtime } = state;
  const url = new URL(request.url ?? "/", "http://localhost");
  const pathname = url.pathname;

  if (request.method === "GET" && pathname === "/") {
    if (runtime.dashboardDist) {
      await sendDashboardDistFile(runtime.dashboardDist, "/dashboard/index.html", response);
      return;
    }
    sendHtml(response, renderDashboardHtml());
    return;
  }

  if (request.method === "GET" && pathname.startsWith("/dashboard/")) {
    if (!runtime.dashboardDist) {
      sendJson(response, 404, { error: "Dashboard dist not configured", ok: false });
      return;
    }
    await sendDashboardDistFile(runtime.dashboardDist, pathname, response);
    return;
  }

  if (request.method === "GET" && pathname === "/events") {
    const detach = runtime.notifier.attach(response);
    request.on("close", detach);
    return;
  }

  if (request.method === "GET" && pathname === "/api/project") {
    sendJson(response, 200, runtime.getProjectSnapshot());
    return;
  }

  if (request.method === "GET" && pathname === "/api/projects") {
    sendJson(response, 200, {
      active_project: runtime.readProject().project_id ?? null,
      projects: listWorkspaceProjects(state.projectsRoot, runtime.projectRoot),
    });
    return;
  }

  if (request.method === "POST" && pathname === "/api/project/switch") {
    const body = await readRequestJson(request);
    const project = body.project ?? body.project_id ?? body.projectId ?? body.slug;
    const projectRoot = resolveProjectRoot(project, {
      projectsRoot: state.projectsRoot,
    });
    if (!fs.existsSync(resolveProjectPath(projectRoot, "project.json"))) {
      sendJson(response, 404, {
        error: `Project not found: ${project}`,
        ok: false,
      });
      return;
    }

    state.watcher?.close();
    state.projectWatcher?.close();
    runtime.switchProjectRoot(projectRoot);
    state.watcher = state.watchMarkdown ? runtime.startMarkdownWatcher() : null;
    state.projectWatcher = state.watchProjectState ? new ProjectStateWatcher(runtime).start() : null;
    runtime.notifier.send("context.updated", {
      context: runtime.context.getContext(),
    });
    runtime.notifier.send("project.updated", {
      project_id: runtime.readProject().project_id ?? null,
      reason: "project_switched",
    });
    sendJson(response, 200, {
      ok: true,
      projects: listWorkspaceProjects(state.projectsRoot, runtime.projectRoot),
      snapshot: runtime.getProjectSnapshot(),
    });
    return;
  }

  if (request.method === "GET" && pathname === "/api/context") {
    sendJson(response, 200, { context: runtime.context.getContext() });
    return;
  }

  if (["PATCH", "POST"].includes(request.method) && pathname === "/api/context") {
    const body = await readRequestJson(request);
    const context = runtime.context.updateContext(body);
    sendJson(response, 200, { context, ok: true });
    return;
  }

  if (request.method === "POST" && pathname === "/api/text-block") {
    const body = await readRequestJson(request);
    const result = runtime.updateTextBlock(
      body.asset_id ?? body.assetId,
      body.block_id ?? body.blockId,
      body.text,
      {
        reason: body.reason,
      },
    );
    sendJson(response, 200, { ok: true, ...result });
    return;
  }

  if (request.method === "POST" && pathname === "/api/text-asset") {
    const body = await readRequestJson(request);
    const result = runtime.updateTextAsset(body);
    sendJson(response, 200, {
      currentData: runtime.readCurrentAssetData(result.asset),
      ok: true,
      ...result,
    });
    return;
  }

  if (request.method === "POST" && pathname === "/api/html-assets") {
    const body = await readRequestJson(request);
    const result = runtime.saveHtmlAssetFromView(body);
    sendJson(response, 200, { ok: true, ...result });
    return;
  }

  if (request.method === "POST" && pathname === "/api/assets/images") {
    const body = await readRequestJson(request);
    const result = runtime.uploadImageAsset(body);
    sendJson(response, 200, { ok: true, ...result });
    return;
  }

  if (request.method === "POST" && pathname === "/api/pipeline/step") {
    const body = await readRequestJson(request);
    const pipeline = runtime.pipeline.updateStepStatus(
      body.step_id ?? body.stepId,
      body.status,
      {
        error: body.error,
      },
    );
    sendJson(response, 200, { ok: true, pipeline });
    return;
  }

  if (request.method === "POST" && pathname === "/api/pipeline/launch") {
    if (!runtime.enableFixtureLaunch) {
      sendJson(response, 403, {
        error: "Fixture pipeline launch is not enabled for this server.",
        ok: false,
      });
      return;
    }

    const body = await readRequestJson(request);
    const result = runtime.launchFixturePipeline(body);
    sendJson(response, 200, { ok: true, ...result });
    return;
  }

  if (request.method === "GET" && pathname.startsWith("/assets/")) {
    await sendProjectAssetFile(runtime.projectRoot, pathname, request, response);
    return;
  }

  sendJson(response, 404, { error: "Not found", ok: false });
}

async function readRequestJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }

  const text = Buffer.concat(chunks).toString("utf8");
  return text.trim() ? JSON.parse(text) : {};
}

function sendJson(response, statusCode, payload) {
  if (response.headersSent) {
    return;
  }

  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function sendHtml(response, html) {
  response.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
  });
  response.end(html);
}

async function sendProjectAssetFile(projectRoot, pathname, request, response) {
  const suffix = decodeURIComponent(pathname.slice("/assets/".length));
  const relativePath = `assets/${suffix}`;
  const absolutePath = resolveProjectPath(projectRoot, relativePath, "asset path");
  const stat = await fsp.stat(absolutePath).catch(() => null);
  if (!stat?.isFile()) {
    sendJson(response, 404, { error: "Asset file not found", ok: false });
    return;
  }

  const contentType = contentTypeForPath(absolutePath);
  const range = parseByteRange(request.headers.range, stat.size);
  if (range?.invalid) {
    response.writeHead(416, {
      "Accept-Ranges": "bytes",
      "Content-Range": `bytes */${stat.size}`,
      "Content-Type": contentType,
    });
    response.end();
    return;
  }

  if (range) {
    const contentLength = range.end - range.start + 1;
    response.writeHead(206, {
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Range": `bytes ${range.start}-${range.end}/${stat.size}`,
      "Content-Type": contentType,
    });
    fs.createReadStream(absolutePath, {
      end: range.end,
      start: range.start,
    }).pipe(response);
    return;
  }

  response.writeHead(200, {
    "Accept-Ranges": "bytes",
    "Content-Length": stat.size,
    "Content-Type": contentType,
  });
  fs.createReadStream(absolutePath).pipe(response);
}

function parseByteRange(rawRange, size) {
  if (!rawRange) {
    return null;
  }

  const header = Array.isArray(rawRange) ? rawRange[0] : rawRange;
  if (typeof header !== "string" || !header.startsWith("bytes=") || size <= 0) {
    return { invalid: true };
  }

  const spec = header.slice("bytes=".length).trim();
  if (!spec || spec.includes(",")) {
    return { invalid: true };
  }

  const match = /^(\d*)-(\d*)$/u.exec(spec);
  if (!match) {
    return { invalid: true };
  }

  const [, rawStart, rawEnd] = match;
  if (!rawStart && !rawEnd) {
    return { invalid: true };
  }

  if (!rawStart) {
    const suffixLength = Number(rawEnd);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
      return { invalid: true };
    }
    const start = Math.max(size - suffixLength, 0);
    return {
      end: size - 1,
      start,
    };
  }

  const start = Number(rawStart);
  const end = rawEnd ? Number(rawEnd) : size - 1;
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    end < start ||
    start >= size
  ) {
    return { invalid: true };
  }

  return {
    end: Math.min(end, size - 1),
    start,
  };
}

async function sendDashboardDistFile(dashboardDist, pathname, response) {
  const suffix =
    pathname === "/dashboard" || pathname === "/dashboard/"
      ? "index.html"
      : decodeURIComponent(pathname.slice("/dashboard/".length));
  const relativePath = suffix || "index.html";
  const absolutePath = resolveUnderRoot(dashboardDist, relativePath, "dashboard path");
  const stat = await fsp.stat(absolutePath).catch(() => null);
  if (!stat?.isFile()) {
    sendJson(response, 404, { error: "Dashboard file not found", ok: false });
    return;
  }

  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Length": stat.size,
    "Content-Type": contentTypeForPath(absolutePath),
  });
  fs.createReadStream(absolutePath).pipe(response);
}

function listWorkspaceProjects(projectsRoot, activeProjectRoot) {
  const root = resolveProjectsRoot(projectsRoot);
  const active = activeProjectRoot ? path.resolve(activeProjectRoot) : null;
  if (!fs.existsSync(root)) {
    return [];
  }

  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const projectRoot = path.join(root, entry.name);
      const projectPath = path.join(projectRoot, "project.json");
      if (!fs.existsSync(projectPath)) {
        return null;
      }

      const project = readJsonFile(projectPath, {});
      return {
        active: active === path.resolve(projectRoot),
        goal: project.goal ?? "",
        name: project.name ?? titleizeSlug(entry.name),
        project_id: project.project_id ?? entry.name,
        status: project.status ?? "active",
        updated_at: project.updated_at ?? project.created_at ?? null,
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (left.active) return -1;
      if (right.active) return 1;
      return String(left.name).localeCompare(String(right.name));
    });
}

function resolveUnderRoot(rootDir, relativePath, label) {
  const root = path.resolve(rootDir);
  const safeRelativePath = assertSafeRelativePath(relativePath, label);
  const target = path.resolve(root, safeRelativePath);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new Error(`${label} must stay inside the configured root.`);
  }
  return target;
}

function resolveDashboardDist(inputPath) {
  const configured = inputPath ? path.resolve(expandHome(inputPath)) : null;
  if (configured) {
    return fs.existsSync(path.join(configured, "index.html")) ? configured : null;
  }

  const candidate = path.resolve(
    process.cwd(),
    "apps/postplus-workspace-dashboard/dist",
  );
  return fs.existsSync(path.join(candidate, "index.html")) ? candidate : null;
}

function renderDashboardHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>PostPlus Workspace</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f6f7f9;
      --panel: #ffffff;
      --ink: #16181d;
      --muted: #647084;
      --line: #d9dee7;
      --accent: #12715b;
      --accent-2: #b45309;
      --danger: #b91c1c;
      --ready: #0f766e;
      --running: #2563eb;
      --pending: #697386;
      --failed: #b91c1c;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font: 14px/1.45 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    button, textarea, select { font: inherit; }
    button {
      border: 1px solid var(--line);
      background: #fff;
      border-radius: 6px;
      color: var(--ink);
      cursor: pointer;
      min-height: 34px;
      padding: 6px 10px;
    }
    button.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
    button:disabled { cursor: not-allowed; opacity: .55; }
    header {
      border-bottom: 1px solid var(--line);
      background: #fff;
      padding: 16px 20px 12px;
      position: sticky;
      top: 0;
      z-index: 5;
    }
    h1, h2, h3 { margin: 0; letter-spacing: 0; }
    h1 { font-size: 22px; line-height: 1.2; }
    h2 { font-size: 15px; margin-bottom: 10px; }
    h3 { font-size: 14px; }
    .goal { color: var(--muted); margin-top: 4px; max-width: 1000px; }
    .context-chip {
      display: inline-flex;
      gap: 6px;
      align-items: center;
      border: 1px solid #b7d5cb;
      background: #eef8f4;
      color: #07503f;
      border-radius: 999px;
      padding: 5px 10px;
      margin-top: 10px;
      max-width: 100%;
    }
    main {
      display: grid;
      grid-template-columns: 280px minmax(0, 1fr) 320px;
      gap: 14px;
      padding: 14px;
      min-height: calc(100vh - 96px);
    }
    section, aside {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      min-width: 0;
    }
    .pane { padding: 14px; }
    .pipeline-step, .asset-card, .activity-row, .provenance-row {
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 9px;
      margin-bottom: 8px;
      background: #fff;
    }
    .pipeline-step { display: flex; justify-content: space-between; gap: 8px; align-items: center; }
    .status { color: #fff; border-radius: 999px; padding: 2px 7px; font-size: 12px; white-space: nowrap; }
    .status.pending { background: var(--pending); }
    .status.running { background: var(--running); }
    .status.done, .status.ready { background: var(--ready); }
    .status.failed { background: var(--failed); }
    .asset-group { margin-bottom: 18px; }
    .asset-card { text-align: left; width: 100%; }
    .asset-card.selected { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(18, 113, 91, .14); }
    .asset-meta { color: var(--muted); font-size: 12px; margin-top: 3px; overflow-wrap: anywhere; }
    .preview-toolbar {
      border-bottom: 1px solid var(--line);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 14px;
    }
    .preview-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    #preview { padding: 14px; }
    .empty { color: var(--muted); padding: 16px 0; }
    .block { border: 1px solid var(--line); border-radius: 6px; margin-bottom: 10px; overflow: hidden; }
    .block-head { align-items: center; background: #f9fafb; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; padding: 8px 10px; gap: 8px; }
    textarea { border: 0; display: block; min-height: 110px; padding: 10px; resize: vertical; width: 100%; }
    img, video, audio { max-width: 100%; }
    iframe { border: 1px solid var(--line); min-height: 420px; width: 100%; }
    .right-stack { display: grid; gap: 14px; align-content: start; }
    .feed { max-height: 320px; overflow: auto; }
    code { background: #f2f4f7; border-radius: 4px; padding: 1px 4px; }
    @media (max-width: 1050px) {
      main { grid-template-columns: 240px minmax(0, 1fr); }
      .right-stack { grid-column: 1 / -1; grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 760px) {
      header { position: static; }
      main { display: block; padding: 10px; }
      section, aside { margin-bottom: 10px; }
      .right-stack { display: block; }
      .preview-toolbar { align-items: flex-start; flex-direction: column; }
    }
  </style>
</head>
<body>
  <header>
    <h1 id="project-title">PostPlus Workspace</h1>
    <div id="project-goal" class="goal"></div>
    <div id="context-chip" class="context-chip">Ask AI about: Project</div>
  </header>
  <main>
    <aside class="pane">
      <h2>Pipeline</h2>
      <div id="pipeline"></div>
      <h2>Assets</h2>
      <div id="assets"></div>
    </aside>
    <section>
      <div class="preview-toolbar">
        <div>
          <h2 id="preview-title">Current Project</h2>
          <div id="preview-meta" class="asset-meta"></div>
        </div>
        <div class="preview-actions">
          <button data-html-action="save_as_asset">Save as Asset</button>
          <button data-html-action="pin_to_assets">Pin to Assets</button>
          <button data-html-action="export_html">Export HTML</button>
          <button class="primary" data-html-action="use_in_next_step">Use in Next Step</button>
        </div>
      </div>
      <div id="preview"></div>
    </section>
    <div class="right-stack">
      <aside class="pane">
        <h2>Provenance</h2>
        <div id="provenance" class="feed"></div>
      </aside>
      <aside class="pane">
        <h2>Activity</h2>
        <div id="activity" class="feed"></div>
      </aside>
    </div>
  </main>
  <script>
    let state = null;
    let selectedAssetId = null;

    const byId = (id) => document.getElementById(id);
    const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);

    async function api(path, options = {}) {
      const response = await fetch(path, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {})
        }
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Request failed");
      }
      return payload;
    }

    async function loadProject() {
      state = await api("/api/project");
      selectedAssetId = state.context.selected_asset_id || state.manifest.assets[0]?.asset_id || null;
      renderStatic();
      renderPipeline();
      renderAssets();
      renderContext();
      renderPreview();
      renderProvenance();
      renderActivity();
    }

    function renderStatic() {
      byId("project-title").textContent = state.project.name || state.project.project_id || "PostPlus Workspace";
      byId("project-goal").textContent = state.project.goal || "";
    }

    function renderPipeline() {
      byId("pipeline").innerHTML = (state.pipeline.steps || []).map((step) => \`
        <div class="pipeline-step">
          <div>
            <h3>\${escapeHtml(step.name || step.id)}</h3>
            <div class="asset-meta">\${escapeHtml(step.id)}</div>
          </div>
          <span class="status \${escapeHtml(step.status)}">\${escapeHtml(step.status)}</span>
        </div>
      \`).join("") || '<div class="empty">No pipeline steps.</div>';
    }

    function renderAssets() {
      const groups = new Map();
      for (const asset of state.manifest.assets || []) {
        const key = \`\${asset.step_id || "unknown"} · \${asset.type || "asset"}\`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(asset);
      }

      byId("assets").innerHTML = [...groups.entries()].map(([group, assets]) => \`
        <div class="asset-group">
          <h3>\${escapeHtml(group)}</h3>
          \${assets.map((asset) => \`
            <button class="asset-card \${asset.asset_id === selectedAssetId ? "selected" : ""}" data-asset-id="\${escapeHtml(asset.asset_id)}">
              <strong>\${escapeHtml(asset.name || asset.asset_id)}</strong>
              <div class="asset-meta">\${escapeHtml(asset.role)} · \${escapeHtml(asset.status)} · \${escapeHtml(asset.current_version)}</div>
            </button>
          \`).join("")}
        </div>
      \`).join("") || '<div class="empty">No assets yet.</div>';

      for (const card of document.querySelectorAll("[data-asset-id]")) {
        card.addEventListener("click", () => selectAsset(card.dataset.assetId));
      }
    }

    async function selectAsset(assetId, selectedBlockId = null) {
      selectedAssetId = assetId;
      const asset = getAsset(assetId);
      const data = state.currentAssetData[assetId];
      const selectedVersion = asset?.current_version || null;
      const firstBlock = selectedBlockId || data?.blocks?.[0]?.block_id || null;
      const context = await api("/api/context", {
        method: "PATCH",
        body: JSON.stringify({
          active_step: asset?.step_id || state.context.active_step,
          selected_asset_id: assetId,
          selected_block_id: firstBlock,
          selected_version: selectedVersion,
          visible_panel: asset?.type ? \`\${asset.type}_preview\` : "dashboard"
        })
      });
      state.context = context.context;
      renderAssets();
      renderContext();
      renderPreview();
      renderProvenance();
    }

    function renderContext() {
      const asset = getAsset(state.context.selected_asset_id || selectedAssetId);
      const data = asset ? state.currentAssetData[asset.asset_id] : null;
      const block = data?.blocks?.find((item) => item.block_id === state.context.selected_block_id);
      const assetLabel = asset?.name || asset?.asset_id || "Project";
      const blockLabel = block?.label || block?.block_id || asset?.type || "";
      const version = state.context.selected_version || asset?.current_version || "";
      byId("context-chip").textContent = \`Ask AI about: \${assetLabel}\${blockLabel ? " / " + blockLabel : ""}\${version ? " / " + version : ""}\`;
    }

    function renderPreview() {
      const asset = getAsset(selectedAssetId);
      const preview = byId("preview");
      if (!asset) {
        byId("preview-title").textContent = "Current Project";
        byId("preview-meta").textContent = "";
        preview.innerHTML = '<div class="empty">Select an asset to preview or edit it.</div>';
        return;
      }

      byId("preview-title").textContent = asset.name || asset.asset_id;
      byId("preview-meta").textContent = \`\${asset.type} · \${asset.role} · \${asset.current_version}\`;

      if (asset.type === "text") {
        const data = state.currentAssetData[asset.asset_id];
        preview.innerHTML = (data?.blocks || []).map((block) => \`
          <div class="block" data-block-id="\${escapeHtml(block.block_id)}">
            <div class="block-head">
              <strong>\${escapeHtml(block.label || block.block_id)}</strong>
              <button class="primary" data-save-block="\${escapeHtml(block.block_id)}">Save</button>
            </div>
            <textarea data-edit-block="\${escapeHtml(block.block_id)}">\${escapeHtml(block.text)}</textarea>
          </div>
        \`).join("") || '<div class="empty">This text asset has no blocks.</div>';

        for (const block of preview.querySelectorAll("[data-block-id]")) {
          block.addEventListener("click", () => updateSelectedBlock(block.dataset.blockId));
        }
        for (const button of preview.querySelectorAll("[data-save-block]")) {
          button.addEventListener("click", () => saveBlock(asset.asset_id, button.dataset.saveBlock));
        }
        return;
      }

      const version = currentVersion(asset);
      const filePath = version?.file_path;
      if (!filePath) {
        preview.innerHTML = '<div class="empty">No preview file for this asset.</div>';
        return;
      }

      const src = "/" + filePath;
      if (asset.type === "image" || asset.type === "reference") {
        preview.innerHTML = \`<img src="\${escapeHtml(src)}" alt="\${escapeHtml(asset.asset_id)}">\`;
      } else if (asset.type === "audio") {
        preview.innerHTML = \`<audio controls src="\${escapeHtml(src)}"></audio>\`;
      } else if (asset.type === "video") {
        preview.innerHTML = \`<video controls src="\${escapeHtml(src)}"></video>\`;
      } else if (asset.type === "html") {
        preview.innerHTML = \`<iframe src="\${escapeHtml(src)}" title="\${escapeHtml(asset.asset_id)}"></iframe>\`;
      } else {
        preview.innerHTML = \`<code>\${escapeHtml(filePath)}</code>\`;
      }
    }

    async function updateSelectedBlock(blockId) {
      const asset = getAsset(selectedAssetId);
      if (!asset) return;
      const context = await api("/api/context", {
        method: "PATCH",
        body: JSON.stringify({
          selected_asset_id: asset.asset_id,
          selected_block_id: blockId,
          selected_version: asset.current_version
        })
      });
      state.context = context.context;
      renderContext();
    }

    async function saveBlock(assetId, blockId) {
      const textarea = document.querySelector(\`[data-edit-block="\${CSS.escape(blockId)}"]\`);
      const button = document.querySelector(\`[data-save-block="\${CSS.escape(blockId)}"]\`);
      button.disabled = true;
      try {
        const payload = await api("/api/text-block", {
          method: "POST",
          body: JSON.stringify({
            asset_id: assetId,
            block_id: blockId,
            text: textarea.value
          })
        });
        upsertAsset(payload.asset, payload.asset.asset_id, payload.currentData || null);
        state.currentAssetData[payload.asset.asset_id] = payload.currentData || state.currentAssetData[payload.asset.asset_id];
        selectedAssetId = payload.asset.asset_id;
        renderAssets();
        renderPreview();
        renderContext();
      } finally {
        button.disabled = false;
      }
    }

    function renderProvenance() {
      const rows = (state.provenance || []).filter((row) => !selectedAssetId || row.asset_id === selectedAssetId).slice(-80).reverse();
      byId("provenance").innerHTML = rows.map((row) => \`
        <div class="provenance-row">
          <strong>\${escapeHtml(row.event)}</strong>
          <div class="asset-meta">\${escapeHtml(row.asset_id || "")} \${escapeHtml(row.version_id || row.to_version || "")}</div>
          <div class="asset-meta">\${escapeHtml(row.created_at)}</div>
        </div>
      \`).join("") || '<div class="empty">No provenance for the selected asset.</div>';
    }

    function renderActivity() {
      byId("activity").innerHTML = (state.activity || []).slice(-80).reverse().map((row) => \`
        <div class="activity-row">
          <strong>\${escapeHtml(row.message)}</strong>
          <div class="asset-meta">\${escapeHtml(row.created_at)}</div>
        </div>
      \`).join("") || '<div class="empty">No activity yet.</div>';
    }

    async function saveHtmlAsset(action) {
      const asset = getAsset(selectedAssetId);
      const previewHtml = byId("preview").innerHTML;
      const payload = await api("/api/html-assets", {
        method: "POST",
        body: JSON.stringify({
          action,
          html: \`<!doctype html><meta charset="utf-8"><main>\${previewHtml}</main>\`,
          source_assets: asset ? [asset.asset_id] : [],
          source_view: asset?.step_id || "dashboard",
          step_id: asset?.step_id || "dashboard"
        })
      });
      upsertAsset(payload.asset, payload.asset.asset_id, null);
      renderAssets();
    }

    function getAsset(assetId) {
      return (state?.manifest?.assets || []).find((asset) => asset.asset_id === assetId) || null;
    }

    function currentVersion(asset) {
      return (asset.versions || []).find((version) => version.version_id === asset.current_version) || asset.versions?.at(-1) || null;
    }

    function upsertAsset(asset, assetId, currentData) {
      const assets = state.manifest.assets || [];
      const index = assets.findIndex((item) => item.asset_id === assetId);
      if (index === -1) {
        assets.push(asset);
      } else {
        assets[index] = asset;
      }
      if (currentData !== undefined) {
        state.currentAssetData[asset.asset_id] = currentData;
      }
    }

    function applyAssetEvent(event) {
      upsertAsset(event.asset, event.asset.asset_id, event.currentData ?? null);
      if (!selectedAssetId) selectedAssetId = event.asset.asset_id;
      renderAssets();
      if (selectedAssetId === event.asset.asset_id) {
        renderPreview();
        renderContext();
        renderProvenance();
      }
    }

    for (const button of document.querySelectorAll("[data-html-action]")) {
      button.addEventListener("click", () => saveHtmlAsset(button.dataset.htmlAction));
    }

    const events = new EventSource("/events");
    events.addEventListener("asset.created", (event) => applyAssetEvent(JSON.parse(event.data)));
    events.addEventListener("asset.updated", (event) => applyAssetEvent(JSON.parse(event.data)));
    events.addEventListener("html.asset.saved", (event) => {
      const payload = JSON.parse(event.data);
      upsertAsset(payload.asset, payload.asset.asset_id, null);
      renderAssets();
    });
    events.addEventListener("pipeline.step.updated", (event) => {
      state.pipeline = JSON.parse(event.data).pipeline;
      renderPipeline();
    });
    events.addEventListener("context.updated", (event) => {
      state.context = JSON.parse(event.data).context;
      selectedAssetId = state.context.selected_asset_id || selectedAssetId;
      renderContext();
    });
    events.addEventListener("provenance.created", (event) => {
      state.provenance.push(JSON.parse(event.data).provenance);
      renderProvenance();
    });
    events.addEventListener("activity.created", (event) => {
      state.activity.push(JSON.parse(event.data).activity);
      renderActivity();
    });

    loadProject().catch((error) => {
      byId("preview").innerHTML = \`<div class="empty">\${escapeHtml(error.message)}</div>\`;
    });
  </script>
</body>
</html>`;
}

function renderFixtureSvg(spec, index) {
  const palettes = {
    blue: ["#dbeafe", "#2563eb", "#93c5fd"],
    gray: ["#f1f5f9", "#475569", "#cbd5e1"],
    green: ["#dcfce7", "#16a34a", "#bbf7d0"],
    purple: ["#ede9fe", "#7c3aed", "#c4b5fd"],
  };
  const [bg, fg, soft] = palettes[spec.tone] ?? palettes.purple;
  const label = escapeSvgText(spec.title ?? spec.name ?? spec.assetId);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="1280" height="720" rx="36" fill="${bg}"/>
  <circle cx="${240 + index * 42}" cy="190" r="112" fill="${soft}" opacity=".68"/>
  <circle cx="${850 - index * 20}" cy="250" r="148" fill="#ffffff" opacity=".42"/>
  <rect x="510" y="190" width="250" height="330" rx="44" fill="#111827" opacity=".56"/>
  <rect x="548" y="246" width="174" height="210" rx="28" fill="#ffffff" opacity=".86"/>
  <circle cx="585" cy="286" r="22" fill="${fg}" opacity=".55"/>
  <circle cx="650" cy="286" r="22" fill="${fg}" opacity=".38"/>
  <rect x="450" y="500" width="370" height="70" rx="35" fill="#ffffff" opacity=".76"/>
  <text x="80" y="640" fill="#111827" font-family="Inter, Arial, sans-serif" font-size="54" font-weight="800">${label}</text>
  <text x="80" y="94" fill="${fg}" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="800">PostPlus fixture ${index}</text>
</svg>
`;
}

function escapeSvgText(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function generateFixtureVideo(outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  try {
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-f",
        "lavfi",
        "-i",
        "testsrc2=duration=5:size=720x1280:rate=24",
        "-pix_fmt",
        "yuv420p",
        outputPath,
      ],
      {
        stdio: "ignore",
      },
    );
  } catch (error) {
    throw new Error(
      `ffmpeg is required to generate the 5s fixture video: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function contentTypeForPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".js") return "text/javascript; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".md") return "text/markdown; charset=utf-8";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".mp3") return "audio/mpeg";
  if (ext === ".wav") return "audio/wav";
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".mov") return "video/quicktime";
  return "application/octet-stream";
}

const IMAGE_UPLOAD_MIME_EXTENSIONS = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/jpg", ".jpg"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/svg+xml", ".svg"],
]);

function normalizeUploadedImage(input = {}) {
  const rawMimeType = String(input.mimeType ?? input.mime_type ?? "").trim().toLowerCase();
  const fileNameInput = String(input.fileName ?? input.file_name ?? "uploaded-image").trim();
  const extensionFromName = path.extname(fileNameInput).toLowerCase();
  const extensionFromMime = IMAGE_UPLOAD_MIME_EXTENSIONS.get(rawMimeType);
  const extension = extensionFromMime ?? extensionFromName;

  if (!IMAGE_UPLOAD_MIME_EXTENSIONS.has(rawMimeType) && ![".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(extension)) {
    throw new Error(`Unsupported uploaded image type: ${rawMimeType || extension || "unknown"}`);
  }

  const base64 = String(input.dataBase64 ?? input.data_base64 ?? "")
    .replace(/^data:image\/[a-z0-9.+-]+;base64,/i, "")
    .trim();
  if (!base64) {
    throw new Error("Uploaded image dataBase64 is required.");
  }

  const bytes = Buffer.from(base64, "base64");
  if (!bytes.length) {
    throw new Error("Uploaded image data is empty.");
  }
  const maxBytes = 25 * 1024 * 1024;
  if (bytes.length > maxBytes) {
    throw new Error("Uploaded image exceeds the 25MB local dashboard limit.");
  }

  const stem = safeFileStem(path.basename(fileNameInput, extensionFromName), "uploaded-image");
  const normalizedExtension = extension === ".jpeg" ? ".jpg" : extension;
  const assetId =
    input.assetId || input.asset_id
      ? safeIdentifier(input.assetId ?? input.asset_id, "asset_id")
      : safeIdentifier(`image_${stem}_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`, "asset_id");

  return {
    assetId,
    bytes,
    extension: normalizedExtension,
    fileName: `${stem}${normalizedExtension}`,
    name: String(input.name ?? titleizeSlug(stem)),
  };
}

function normalizePipelineSteps(steps) {
  const rawSteps =
    Array.isArray(steps) && steps.length
      ? steps
      : typeof steps === "string" && steps.trim()
        ? steps.split(",")
        : ["brief", "script", "storyboard"];

  return rawSteps.map((step) => {
    if (typeof step === "string") {
      const id = safeIdentifier(safeSlug(step).replaceAll("-", "_"), "step_id");
      return {
        id,
        name: titleizeSlug(step),
      };
    }

    const id = safeIdentifier(step.id, "step_id");
    return {
      id,
      name: step.name ?? titleizeSlug(id),
    };
  });
}

function isEmptyFile(filePath) {
  return !fs.existsSync(filePath) || fs.statSync(filePath).size === 0;
}

function titleizeSlug(value) {
  return String(value ?? "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function createEventId(prefix) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

function buildVersionId(assetId, index) {
  return `${safeIdentifier(assetId, "asset_id")}_v${index}`;
}

function validateAssetType(type) {
  if (!ASSET_TYPES.has(type)) {
    throw new Error(`Invalid asset type: ${type}`);
  }
  return type;
}

function validateAssetRole(role) {
  if (!ASSET_ROLES.has(role)) {
    throw new Error(`Invalid asset role: ${role}`);
  }
  return role;
}

function validateAssetStatus(status) {
  if (!ASSET_STATUSES.has(status)) {
    throw new Error(`Invalid asset status: ${status}`);
  }
  return status;
}

export function validateAssetData(type, data) {
  validateAssetType(type);

  if (data === null || data === undefined) {
    return true;
  }

  if (typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Asset data must be an object.");
  }

  if (type !== "text") {
    return true;
  }

  if (!Array.isArray(data.blocks)) {
    throw new Error("Text asset data must include a blocks array.");
  }

  for (const block of data.blocks) {
    if (!block || typeof block !== "object" || Array.isArray(block)) {
      throw new Error("Text asset blocks must be objects.");
    }
    safeIdentifier(block.block_id, "block_id");
    if (block.label !== undefined && typeof block.label !== "string") {
      throw new Error("Text asset block labels must be strings.");
    }
    if (typeof block.text !== "string") {
      throw new Error("Text asset block text must be a string.");
    }
  }

  return true;
}

function normalizeVersionData(type, data, options = {}) {
  if (data === undefined || data === null) {
    if (type === "text") {
      return {
        asset_id: options.assetId,
        blocks: [],
        type: "text",
        updated_at: nowIso(),
        version_id: options.versionId,
      };
    }
    return null;
  }

  if (type !== "text") {
    return data;
  }

  if (typeof data === "string") {
    return {
      asset_id: options.assetId,
      blocks: [
        {
          block_id: "block_001",
          label: "Block 001",
          text: data,
          type: "paragraph",
        },
      ],
      type: "text",
      updated_at: nowIso(),
      version_id: options.versionId,
    };
  }

  const blocks = Array.isArray(data.blocks)
    ? data.blocks.map((block, index) => ({
        block_id: block.block_id ?? `block_${String(index + 1).padStart(3, "0")}`,
        label: block.label ?? titleizeSlug(block.block_id ?? `block ${index + 1}`),
        text: String(block.text ?? ""),
        type: block.type ?? "paragraph",
      }))
    : [
        {
          block_id: "block_001",
          label: "Block 001",
          text: String(data.text ?? ""),
          type: "paragraph",
        },
      ];

  const normalized = {
    ...data,
    asset_id: data.asset_id ?? options.assetId,
    blocks,
    type: data.type ?? "text",
    updated_at: data.updated_at ?? nowIso(),
    version_id: options.versionId,
  };
  validateAssetData("text", normalized);
  return normalized;
}

function renderMarkdownBackup(asset, version, data) {
  const lines = [
    "---",
    `asset_id: ${asset.asset_id}`,
    `version_id: ${version.version_id}`,
  ];
  if (version.data_path) {
    lines.push(`data_path: ${version.data_path}`);
  }
  lines.push("---", "");

  for (const block of data.blocks ?? []) {
    const label = String(block.label ?? "");
    lines.push(
      `<!-- postplus:block ${block.block_id} label="${escapeMarkdownAttribute(label)}" -->`,
    );
    lines.push(String(block.text ?? ""));
    lines.push("<!-- /postplus:block -->", "");
  }

  return `${lines.join("\n").replace(/\n+$/u, "")}\n`;
}

export function parseMarkdownAsset(markdown, options = {}) {
  const body = stripFrontmatter(String(markdown ?? ""));
  const blocks = [];
  const markerPattern =
    /<!--\s*postplus:block\s+([A-Za-z0-9_-]+)(?:\s+label="([^"]*)")?\s*-->\s*([\s\S]*?)\s*<!--\s*\/postplus:block\s*-->/g;

  for (const match of body.matchAll(markerPattern)) {
    blocks.push({
      block_id: safeIdentifier(match[1], "block_id"),
      label: unescapeMarkdownAttribute(match[2] ?? titleizeSlug(match[1])),
      text: match[3].replace(/\n+$/u, ""),
      type: "paragraph",
    });
  }

  if (!blocks.length && body.trim()) {
    blocks.push({
      block_id: "block_001",
      label: "Block 001",
      text: body.trim(),
      type: "paragraph",
    });
  }

  const data = {
    asset_id: options.assetId ?? null,
    blocks,
    type: "text",
    updated_at: nowIso(),
    version_id: options.versionId ?? null,
  };
  validateAssetData("text", data);
  return data;
}

function stripFrontmatter(markdown) {
  if (!markdown.startsWith("---\n")) {
    return markdown;
  }

  const end = markdown.indexOf("\n---\n", 4);
  if (end === -1) {
    return markdown;
  }

  return markdown.slice(end + 5);
}

function escapeMarkdownAttribute(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function unescapeMarkdownAttribute(value) {
  return String(value ?? "").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
}

function findAssetOrThrow(manifest, assetId) {
  const asset = (manifest.assets ?? []).find((item) => item.asset_id === assetId);
  if (!asset) {
    throw new Error(`Asset not found: ${assetId}`);
  }
  return asset;
}

function findCurrentVersion(asset) {
  return (
    (asset.versions ?? []).find(
      (version) => version.version_id === asset.current_version,
    ) ??
    (asset.versions ?? []).at(-1) ??
    null
  );
}

function findAssetByVersionFilePath(manifest, relativePath) {
  const normalized = relativePath.split(path.sep).join("/");
  return (manifest.assets ?? []).find((asset) =>
    (asset.versions ?? []).some((version) => version.file_path === normalized),
  );
}

function actorFromSource(source) {
  if (source === "edited_by_ai") return "ai";
  if (source === "external_file_edit") return "external";
  if (source === "edited_by_user") return "user";
  return source ?? "runtime";
}

function maybeAppendSourceSpecificProvenance(provenance, options) {
  if (options.source === "edited_by_user") {
    return provenance.append("user_edit", {
      asset_id: options.assetId,
      from_version: options.fromVersion,
      reason: options.reason,
      to_version: options.toVersion,
    });
  }

  if (options.source === "edited_by_ai") {
    return provenance.append("ai_edit", {
      actor: options.actor,
      asset_id: options.assetId,
      from_version: options.fromVersion,
      reason: options.reason,
      to_version: options.toVersion,
    });
  }

  if (options.source === "external_file_edit") {
    return provenance.append("external_file_edit", {
      asset_id: options.assetId,
      from_version: options.fromVersion,
      path: options.filePath,
      to_version: options.toVersion,
    });
  }

  return null;
}

function displayAssetName(asset) {
  return asset.name ?? titleizeSlug(asset.asset_id);
}

function inferAssetTypeFromPath(filePath) {
  const ext = path.extname(String(filePath ?? "")).toLowerCase();
  if ([".md", ".txt", ".json"].includes(ext)) return "text";
  if ([".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext)) return "image";
  if ([".mp3", ".wav", ".aac", ".m4a"].includes(ext)) return "audio";
  if ([".mp4", ".mov", ".webm"].includes(ext)) return "video";
  if (ext === ".html" || ext === ".htm") return "html";
  return "reference";
}

function filterContextPatch(patch) {
  const allowed = new Set([
    "active_project",
    "active_pipeline",
    "active_step",
    "selected_asset_id",
    "selected_block_id",
    "selected_version",
    "visible_panel",
    "playhead_time",
    "related_script_block",
  ]);
  const next = {};
  for (const [key, value] of Object.entries(patch ?? {})) {
    if (allowed.has(key)) {
      next[key] = value;
    }
  }
  return next;
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function mergeUnique(values) {
  return [...new Set(normalizeStringArray(values).filter(Boolean))];
}

function nextHtmlAssetId(manifest, sourceView) {
  const base = `html_${safeIdentifier(sourceView, "source_view")}`;
  let index = 1;
  let candidate = `${base}_v${index}`;
  const existing = new Set((manifest.assets ?? []).map((asset) => asset.asset_id));
  while (existing.has(candidate)) {
    index += 1;
    candidate = `${base}_v${index}`;
  }
  return candidate;
}

function nextHtmlFilePath(projectRoot, sourceView, role) {
  const base = `${safeFileStem(sourceView)}-${safeFileStem(role)}`;
  let index = 1;
  let relativePath = `assets/html/${base}-v${index}.html`;
  while (fs.existsSync(resolveProjectPath(projectRoot, relativePath))) {
    index += 1;
    relativePath = `assets/html/${base}-v${index}.html`;
  }
  return relativePath;
}
