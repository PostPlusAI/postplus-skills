#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import {
  initializeProject,
  PostPlusWorkspaceRuntime,
  resolveProjectRoot,
  startDashboardServer,
} from "./lib/postplus_workspace_runtime.mjs";
import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "./lib/local_skill_cli.mjs";

function usage() {
  return `Usage:
  node postplus_workspace.mjs init --project-slug <slug> --name <name> --goal <goal> [--projects-root <dir>] [--studio-root <dir>] [--workdir <dir>] [--steps brief,script,storyboard]
  node postplus_workspace.mjs serve [--project <slug-or-path>] [--projects-root <dir>] [--studio-root <dir>] [--host 127.0.0.1] [--port 3978] [--dashboard-dist <dir>] [--enable-fixture-launch]
  node postplus_workspace.mjs import-asset --project <slug-or-path> --asset-id <id> --source-file <path> [--type text|image|audio|video|reference] [--step-id <id>] [--role <role>]
  node postplus_workspace.mjs create-version --project <slug-or-path> --asset-id <id> --input <data.json> [--source edited_by_user|edited_by_ai|external_file_edit]
  node postplus_workspace.mjs register-large-file --project <slug-or-path> --asset-id <id> --source-file <path> --type image|audio|video|reference [--step-id <id>] [--role <role>] [--source-assets a,b] [--pipeline-command <text>] [--pipeline-run-title <text>]
  node postplus_workspace.mjs mark-step-running --project <slug-or-path> --step-id <id>
  node postplus_workspace.mjs mark-step-done --project <slug-or-path> --step-id <id>
  node postplus_workspace.mjs mark-step-failed --project <slug-or-path> --step-id <id> [--error <message>]
  node postplus_workspace.mjs save-html-asset --project <slug-or-path> --source-view <view> --html-file <path> [--source-assets a,b] [--action save_as_asset|pin_to_assets|export_html|use_in_next_step] [--step-id <id>]
`;
}

export async function runPostPlusWorkspaceCli(argv = process.argv.slice(2)) {
  const [command, ...rest] = argv;
  const args = parseArgs(rest);

  if (!command || args.help) {
    console.log(usage());
    return;
  }

  if (command === "init") {
    const result = initializeProject({
      goal: args.goal ?? "",
      name: args.name,
      pipelineId: args["pipeline-id"],
      projectSlug: args["project-slug"] ?? args.project,
      projectRoot: args["studio-root"],
      projectsRoot: args["projects-root"],
      workdir: args.workdir,
      steps: args.steps,
    });
    const runtime = new PostPlusWorkspaceRuntime(result.projectRoot);
    printOrWriteJson(args.output, {
      ok: true,
      projectRoot: result.projectRoot,
      project: runtime.readProject(),
      pipeline: runtime.readPipeline(),
    });
    return;
  }

  if (command === "serve") {
    const server = await startDashboardServer({
      host: args.host ?? "127.0.0.1",
      dashboardDist: args["dashboard-dist"],
      enableFixtureLaunch: Boolean(args["enable-fixture-launch"]),
      port: args.port ? Number(args.port) : 3978,
      project: args.project,
      projectRoot: args["studio-root"],
      projectsRoot: args["projects-root"],
    });
    console.log(`PostPlus workspace dashboard: ${server.url}`);
    return new Promise((resolve) => {
      const close = async () => {
        await server.close();
        resolve();
      };
      process.once("SIGINT", close);
      process.once("SIGTERM", close);
    });
  }

  const runtime = runtimeFromArgs(args);

  if (command === "import-asset") {
    const result = runtime.importAsset({
      activityMessage: args["activity-message"],
      assetId: args["asset-id"],
      createdBy: args["created-by"],
      inputAssets: splitList(args["input-assets"]),
      name: args.name,
      pipelineCommand: args["pipeline-command"],
      pipelineRunTitle: args["pipeline-run-title"],
      role: args.role,
      source: args.source,
      sourceAssets: splitList(args["source-assets"]),
      sourceFile: args["source-file"],
      status: args.status,
      stepId: args["step-id"],
      type: args.type,
    });
    printOrWriteJson(args.output, { ok: true, ...result });
    return;
  }

  if (command === "create-version") {
    const data = readJson(required(args.input, "--input is required"));
    const result = runtime.createVersion({
      actor: args.actor,
      assetId: args["asset-id"],
      data,
      reason: args.reason,
      source: args.source ?? "edited_by_user",
    });
    printOrWriteJson(args.output, {
      currentData: runtime.readCurrentAssetData(result.asset),
      ok: true,
      ...result,
    });
    return;
  }

  if (command === "register-large-file") {
    const result = runtime.registerLargeFile({
      assetId: args["asset-id"],
      fileName: args["file-name"],
      name: args.name,
      role: args.role,
      source: args.source,
      sourceFile: args["source-file"],
      status: args.status,
      stepId: args["step-id"],
      type: args.type,
    });
    printOrWriteJson(args.output, { ok: true, ...result });
    return;
  }

  if (command === "mark-step-running") {
    const pipeline = runtime.pipeline.markStepRunning(args["step-id"]);
    printOrWriteJson(args.output, { ok: true, pipeline });
    return;
  }

  if (command === "mark-step-done") {
    const pipeline = runtime.pipeline.markStepDone(args["step-id"]);
    printOrWriteJson(args.output, { ok: true, pipeline });
    return;
  }

  if (command === "mark-step-failed") {
    const pipeline = runtime.pipeline.markStepFailed(args["step-id"], args.error);
    printOrWriteJson(args.output, { ok: true, pipeline });
    return;
  }

  if (command === "save-html-asset") {
    const htmlFile = required(args["html-file"], "--html-file is required");
    const result = runtime.saveHtmlAssetFromView({
      action: args.action ?? "save_as_asset",
      html: fs.readFileSync(path.resolve(htmlFile), "utf8"),
      sourceAssets: splitList(args["source-assets"]),
      sourceView: args["source-view"],
      stepId: args["step-id"],
    });
    printOrWriteJson(args.output, { ok: true, ...result });
    return;
  }

  throw new Error(`Unknown command: ${command}\n${usage()}`);
}

function runtimeFromArgs(args) {
  return new PostPlusWorkspaceRuntime(
    resolveProjectRoot(required(args.project, "--project is required"), {
      projectsRoot: args["projects-root"],
    }),
  );
}

function required(value, message) {
  if (value === undefined || value === null || value === true || value === "") {
    throw new Error(message);
  }
  return value;
}

function splitList(value) {
  if (!value || value === true) {
    return [];
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

if (isMainModule(import.meta.url)) {
  runPostPlusWorkspaceCli().catch((error) => {
    console.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exit(1);
  });
}
