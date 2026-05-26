#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const PUBLIC_SKILLS_ROOT = path.join(
  REPO_ROOT,
  "opensource",
  "postplus-skills",
  "skills",
);
const SKILLS_ROOT = fs.existsSync(PUBLIC_SKILLS_ROOT)
  ? PUBLIC_SKILLS_ROOT
  : path.join(REPO_ROOT, "skills");
const VENDORED_SUPPORT_DIR = "_" + "postplus_shared";

const REQUIRED_SHARED_RULEBOOK_FILES = [
  "shared-ads-workflow.md",
  "shared-product-selection-preferences.md",
  "shared-public-skill-rules.md",
  "shared-research-preferences.md",
  "shared-source-of-truth-files.md",
  "shared-tiktok-music-workflow.md",
  "shared-user-guidance.md",
];
const REMOVED_INDEX_FILE = "INDEX" + ".md";

const SHARED_MARKDOWN_PATH_PATTERN =
  /\$\{CLAUDE_SKILL_DIR\}\/_[^/) \n]*postplus[^/) \n]*shared\/shared-[^`) \n]+\.md/g;
const CLAUDE_SKILL_PATH_PATTERN = /\$\{CLAUDE_SKILL_DIR\}\/([^\s`)]+)/g;
const SHARED_PRINCIPLE_PATTERN =
  /public skill rules|research preferences|product-selection preferences|source-of-truth files|TikTok music workflow|ads workflow|user guidance/i;
const PRIVATE_RUNTIME_PATTERN = new RegExp(
  [
    "postplus_workspace" + "_runtime",
    "postplus_cloud" + "_client",
    "hosted_collection" + "_bridge",
    "shared" + "-runtime",
    "shared" + "-collection",
    "skills/00" + "-core",
  ].join("|"),
  "i",
);
const PUBLIC_SKILL_FORBIDDEN_PATTERNS = [
  {
    label: "removed --skill-name CLI flag",
    pattern: /--skill-name\b/,
  },
  {
    label: "unpublished local script dependency",
    pattern: /\bthis skill's local scripts?\b|\brun local scripts?\b|\bcall local scripts?\b/i,
  },
  {
    label: "hosted script wording",
    pattern: /\bhosted scripts?\b/i,
  },
];

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

function toSkillsPath(filePath) {
  return path.relative(SKILLS_ROOT, filePath).split(path.sep).join("/");
}

function normalizeReference(rawReference) {
  return rawReference.replace(/[.,:;]+$/g, "");
}

function report(errors, message) {
  errors.push(message);
}

const errors = [];
if (fs.existsSync(path.join(SKILLS_ROOT, REMOVED_INDEX_FILE))) {
  report(errors, `${toRepoPath(path.join(SKILLS_ROOT, REMOVED_INDEX_FILE))}: removed navigation index is not part of the public skill contract.`);
}

const sharedRulebookRoot = path.join(
  SKILLS_ROOT,
  "00-shared",
  "postplus-shared",
  "references",
);
for (const fileName of REQUIRED_SHARED_RULEBOOK_FILES) {
  const requiredPath = path.join(sharedRulebookRoot, fileName);
  if (!fs.existsSync(requiredPath)) {
    report(errors, `${toRepoPath(requiredPath)}: required shared rulebook is missing.`);
  }
}

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
      `${repoPath}: links to removed root shared markdown; use postplus-shared instead.`,
    );
  }
  const removedIndexPattern = new RegExp(
    `skills/${REMOVED_INDEX_FILE.replace(".", "\\\\.")}|${REMOVED_INDEX_FILE.replace(".", "\\\\.")}`,
  );
  if (removedIndexPattern.test(text)) {
    report(
      errors,
      `${repoPath}: references removed navigation index; use catalog.json or a target SKILL.md instead.`,
    );
  }
  if (PRIVATE_RUNTIME_PATTERN.test(text)) {
    report(
      errors,
      `${repoPath}: references private runtime or authoring-only core paths.`,
    );
  }
  for (const { label, pattern } of PUBLIC_SKILL_FORBIDDEN_PATTERNS) {
    if (pattern.test(text)) {
      report(errors, `${repoPath}: contains ${label}.`);
    }
  }
  if (
    toSkillsPath(markdownFile).startsWith("20-research/") &&
    /\bpostplus publish capability\b/.test(text)
  ) {
    report(errors, `${repoPath}: research skills must not route through publish capability.`);
  }
  const skillsPath = toSkillsPath(markdownFile);
  if (
    skillsPath.includes("/references/") &&
    !skillsPath.startsWith("00-shared/postplus-shared/references/")
  ) {
    report(
      errors,
      `${repoPath}: business skill references are not part of the public contract.`,
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
  filePath.split(path.sep).includes(VENDORED_SUPPORT_DIR),
);

for (const filePath of vendoredSharedMarkdown) {
  report(
    errors,
    `${toRepoPath(filePath)}: vendored shared support is not part of the public contract; use postplus-shared references or public CLI commands.`,
  );
}

if (errors.length > 0) {
  console.error("Skill reference validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Skill reference validation passed for ${skillFiles.length} skills under ${toRepoPath(SKILLS_ROOT)}.`,
);
