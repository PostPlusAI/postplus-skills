#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../_postplus_shared/00-core/shared-runtime/scripts/lib/local_skill_cli.mjs";

function readRequiredString(input, fieldName) {
  const value = input?.[fieldName];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`persona-pack requires ${fieldName}.`);
  }
  return value.trim();
}

function readRequiredStringArray(input, fieldName) {
  const value = input?.[fieldName];
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`persona-pack requires non-empty ${fieldName}.`);
  }

  const strings = value.filter(
    (item) => typeof item === "string" && item.trim(),
  );
  if (strings.length === 0) {
    throw new Error(`persona-pack requires non-empty ${fieldName}.`);
  }

  return strings;
}

function normalizePersona(persona, index) {
  return {
    personaId:
      typeof persona?.personaId === "string" && persona.personaId.trim()
        ? persona.personaId.trim()
        : `persona-${String(index + 1).padStart(2, "0")}`,
    name: readRequiredString(persona, "name"),
    keyPain: readRequiredString(persona, "keyPain"),
    proofNeed: readRequiredString(persona, "proofNeed"),
    sourceBasis: readRequiredStringArray(persona, "sourceBasis"),
  };
}

export function buildPersonaPack(input) {
  const personas = Array.isArray(input?.personas)
    ? input.personas
    : input
      ? [input]
      : [];

  if (personas.length === 0) {
    throw new Error("persona-pack requires non-empty personas.");
  }

  return {
    personas: personas.map(normalizePersona),
  };
}

function usage() {
  console.error(
    "Usage: node build_persona_pack.mjs --input <input.json> [--output <personas.json>]",
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    usage();
    process.exitCode = 0;
    return;
  }

  if (!args.input) {
    usage();
    process.exitCode = 1;
    return;
  }

  const input = readJson(args.input);
  const payload = buildPersonaPack(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
