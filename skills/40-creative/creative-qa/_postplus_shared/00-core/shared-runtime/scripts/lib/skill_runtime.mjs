#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

function resolveRuntimeRoot() {
  return path.resolve(process.cwd(), ".postplus", "skill-runtime");
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function appendJsonLine(filePath, payload) {
  ensureDirectory(path.dirname(filePath));
  fs.appendFileSync(filePath, `${JSON.stringify(payload)}\n`);
}

export function createSkillBoundary(input) {
  const startedAt = new Date().toISOString();
  const runtimeRoot = resolveRuntimeRoot();

  ensureDirectory(runtimeRoot);

  return {
    runId: randomUUID(),
    startedAt,
    runtimeRoot,
    ...input,
  };
}

export function logSkillEvent(boundary, event) {
  const eventPath = path.join(boundary.runtimeRoot, "events.jsonl");
  appendJsonLine(eventPath, {
    timestamp: new Date().toISOString(),
    runId: boundary.runId,
    skillName: boundary.skillName,
    actionName: boundary.actionName,
    provider: boundary.provider ?? null,
    ...event,
  });
}
