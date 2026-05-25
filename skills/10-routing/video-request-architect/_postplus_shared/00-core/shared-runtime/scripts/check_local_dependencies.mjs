#!/usr/bin/env node

import { formatCliError } from "./lib/network_runtime.mjs";
import { resolveLocalDependencyCommand } from "./lib/local_dependencies.mjs";

function parseArgs(argv) {
  const args = { dependency: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (current !== "--dependency") {
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      throw new Error("--dependency requires a value.");
    }

    args.dependency.push(next);
    index += 1;
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.dependency.length === 0) {
    console.error(
      "Usage: node check_local_dependencies.mjs --dependency <dependency> [--dependency <dependency>...]",
    );
    process.exitCode = 1;
    return;
  }

  const resolved = [];
  for (const dependency of args.dependency) {
    const command = await resolveLocalDependencyCommand(dependency, {
      missingMessage: `${dependency} is required.`,
    });
    resolved.push({
      command: command.displayName,
      dependency,
    });
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        resolved,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(formatCliError(error));
  process.exitCode = 1;
});
