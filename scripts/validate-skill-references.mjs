#!/usr/bin/env node

import fs from "node:fs";
import { assertNoRetiredPublicSkillReferences } from "./lib/retired-public-skills.mjs";
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

const REMOVED_INDEX_FILE = "INDEX" + ".md";

const SHARED_MARKDOWN_PATH_PATTERN =
  /\$\{CLAUDE_SKILL_DIR\}\/_[^/) \n]*postplus[^/) \n]*shared\/shared-[^`) \n]+\.md/g;
const CLAUDE_SKILL_PATH_PATTERN = /\$\{CLAUDE_SKILL_DIR\}\/([^\s`)]+)/g;
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
    pattern:
      /\bthis skill's local scripts?\b|\brun local scripts?\b|\bcall local scripts?\b|\brun the local\b|\blocal script\b|\bthe script emits\b|\bscript output\b|\bscript contract\b|\binstalled-safe\b|\bembedded .*scripts\b/i,
  },
  {
    label: "hosted script wording",
    pattern: /\bhosted scripts?\b/i,
  },
  {
    label: "private script polling path",
    pattern: /\barchivedRequestPath\b|\bexecutionEnvelopePath\b/,
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

const skillFiles = walkFiles(SKILLS_ROOT, (filePath) =>
  filePath.endsWith("SKILL.md"),
);
const markdownFiles = walkFiles(SKILLS_ROOT, (filePath) =>
  filePath.endsWith(".md"),
);

const indexedBusinessReferences = new Set();
const REFERENCE_LINK_PATTERN = /(?:^|[`(])((?:\.\/)?references\/[^`)\s]+\.md)(?:[`)]|$)/gmu;

for (const skillFile of skillFiles) {
  const text = fs.readFileSync(skillFile, "utf8");
  const skillDir = path.dirname(skillFile);
  const repoPath = toRepoPath(skillFile);

  for (const match of text.matchAll(REFERENCE_LINK_PATTERN)) {
    const reference = normalizeReference(match[1].replace(/^\.\//u, ""));
    const target = path.resolve(skillDir, reference);
    if (!target.startsWith(`${skillDir}${path.sep}`)) {
      report(errors, `${repoPath}: reference ${reference} escapes the skill directory.`);
      continue;
    }
    if (!fs.existsSync(target)) {
      report(errors, `${repoPath}: indexed reference ${reference} is missing.`);
      continue;
    }
    indexedBusinessReferences.add(toSkillsPath(target));
  }
}

for (const markdownFile of markdownFiles) {
  const text = fs.readFileSync(markdownFile, "utf8");
  const repoPath = toRepoPath(markdownFile);
  try {
    assertNoRetiredPublicSkillReferences(text, repoPath);
  } catch (error) {
    report(errors, error.message);
  }

  const sharedMarkdownMatches = text.match(SHARED_MARKDOWN_PATH_PATTERN) || [];
  for (const match of sharedMarkdownMatches) {
    report(
      errors,
      `${repoPath}: uses removed shared markdown path ${match}; use the owning skill or public CLI command.`,
    );
  }
  if (/skills\/shared-[^) \n]+\.md/.test(text)) {
    report(
      errors,
      `${repoPath}: links to removed root shared markdown; use the owning skill or public CLI command.`,
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
    /\bpostplus publish (?!schema\b)[\w-]+/u.test(text)
  ) {
    report(errors, `${repoPath}: research skills must not route through publish operations.`);
  }
  const hostedCommandRules = [
    {
      command: /\bpostplus media (?:create|transcribe|analyze)\b/u,
      schema: /\bpostplus media schema\b/,
      message: "uses a hosted media verb without the public schema discovery command.",
    },
    {
      command: /\bpostplus publish (?!schema\b)[\w-]+/u,
      schema: /\bpostplus publish schema\b/,
      message: "uses a hosted publish operation without the public schema discovery command.",
    },
  ];
  for (const rule of hostedCommandRules) {
    if (rule.command.test(text) && !rule.schema.test(text)) {
      report(errors, `${repoPath}: ${rule.message}`);
    }
  }
  const skillsPath = toSkillsPath(markdownFile);
  if (
    skillsPath.includes("/references/") &&
    !indexedBusinessReferences.has(skillsPath)
  ) {
    report(
      errors,
      `${repoPath}: business skill reference is not indexed by its SKILL.md.`,
    );
  }
}

for (const skillFile of skillFiles) {
  const text = fs.readFileSync(skillFile, "utf8");
  const repoPath = toRepoPath(skillFile);
  const skillDir = path.dirname(skillFile);

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
    `${toRepoPath(filePath)}: vendored shared support is not part of the public contract; use skill-owned references or public CLI commands.`,
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
