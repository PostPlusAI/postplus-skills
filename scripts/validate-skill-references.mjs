#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const SKILLS_ROOT = path.join(REPO_ROOT, "skills");

const SHARED_MARKDOWN_PATH_PATTERN =
  /\$\{CLAUDE_SKILL_DIR\}\/_postplus_shared\/shared-[^`) \n]+\.md/g;
const CLAUDE_SKILL_PATH_PATTERN = /\$\{CLAUDE_SKILL_DIR\}\/([^\s`)]+)/g;
const SHARED_PRINCIPLE_PATTERN =
  /public skill rules|research preferences|product-selection preferences|TikTok music workflow|ads workflow/i;

function walkFiles(root, predicate) {
  const files = [];

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath, predicate));
      continue;
    }
    if (!predicate || predicate(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

function toRepoPath(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join("/");
}

function normalizeReference(rawReference) {
  return rawReference.replace(/[.,:;]+$/g, "");
}

function report(errors, message) {
  errors.push(message);
}

const errors = [];
const skillFiles = walkFiles(SKILLS_ROOT, (filePath) =>
  filePath.endsWith("SKILL.md"),
);
const markdownFiles = walkFiles(SKILLS_ROOT, (filePath) =>
  filePath.endsWith(".md"),
);

for (const markdownFile of markdownFiles) {
  const text = fs.readFileSync(markdownFile, "utf8");
  const repoPath = toRepoPath(markdownFile);
  const sharedMarkdownMatches = text.match(SHARED_MARKDOWN_PATH_PATTERN) || [];
  for (const match of sharedMarkdownMatches) {
    report(
      errors,
      `${repoPath}: uses removed shared markdown path ${match}; use postplus-shared instead.`,
    );
  }
  if (/skills\/shared-[^) \n]+\.md/.test(text)) {
    report(
      errors,
      `${repoPath}: links to removed root shared markdown; use postplus-shared references instead.`,
    );
  }
}

for (const skillFile of skillFiles) {
  const text = fs.readFileSync(skillFile, "utf8");
  const repoPath = toRepoPath(skillFile);
  const skillDir = path.dirname(skillFile);

  if (
    !repoPath.endsWith("00-shared/postplus-shared/SKILL.md") &&
    SHARED_PRINCIPLE_PATTERN.test(text) &&
    !text.includes("postplus-shared")
  ) {
    report(
      errors,
      `${repoPath}: mentions shared principles but does not declare postplus-shared.`,
    );
  }

  for (const match of text.matchAll(CLAUDE_SKILL_PATH_PATTERN)) {
    const reference = normalizeReference(match[1]);
    const target = path.resolve(skillDir, reference);
    if (!fs.existsSync(target)) {
      report(
        errors,
        `${repoPath}: missing ${reference} referenced through \${CLAUDE_SKILL_DIR}.`,
      );
    }
  }
}

const vendoredSharedMarkdown = walkFiles(SKILLS_ROOT, (filePath) =>
  /[/\\]_postplus_shared[/\\]shared-[^/\\]+\.md$/.test(filePath),
);

for (const filePath of vendoredSharedMarkdown) {
  report(
    errors,
    `${toRepoPath(filePath)}: shared principle markdown must live in postplus-shared, not vendored _postplus_shared.`,
  );
}

const requiredSharedReferences = [
  "shared-public-skill-rules.md",
  "shared-research-preferences.md",
  "shared-product-selection-preferences.md",
  "shared-tiktok-music-workflow.md",
  "shared-ads-workflow.md",
];

for (const fileName of requiredSharedReferences) {
  const referencePath = path.join(
    SKILLS_ROOT,
    "00-shared",
    "postplus-shared",
    "references",
    fileName,
  );
  if (!fs.existsSync(referencePath)) {
    report(errors, `postplus-shared is missing references/${fileName}.`);
  }
}

if (errors.length > 0) {
  console.error("Skill reference validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Skill reference validation passed for ${skillFiles.length} skills.`);
