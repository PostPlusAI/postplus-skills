#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { formatCliError } from "./lib/network_runtime.mjs";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (!current.startsWith("--")) continue;
    const key = current.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
}

function runCommand(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (error) => {
      resolve({
        code: null,
        errorCode: error.code || null,
        stdout,
        stderr: error.message || String(error),
      });
    });
    child.on("close", (code) => {
      resolve({ code, errorCode: null, stdout, stderr });
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function classifyDownloadFailure(result) {
  const stderr = String(result?.stderr || "");
  if (stderr.includes("Your IP address is blocked from accessing this post")) {
    return {
      agentAction: "report_blocker",
      failureCode: "tiktok_ip_blocked",
      failureMessage:
        "TikTok blocked this post for the current local IP/browser access path. Report the blocker with the preserved sourceUrl and stop the archive/audio-extraction chain until the URL is reachable from the user's local browser/IP or an approved access path exists.",
      retryable: false,
    };
  }
  return null;
}

async function findDownloadedPath(outputTemplate) {
  const dir = path.dirname(outputTemplate);
  const stem = path.basename(outputTemplate, path.extname(outputTemplate));
  if (!fs.existsSync(dir)) return null;
  const entries = fs.readdirSync(dir);
  const found = entries.find((name) => name === `${stem}.mp4` || name.startsWith(`${stem}.`));
  return found ? path.join(dir, found) : null;
}

async function downloadOne(item, outputTemplate, attempts) {
  let lastResult = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const result = await runCommand("python3", [
      "-m",
      "yt_dlp",
      "--no-playlist",
      "--format",
      "mp4/bv*+ba/b",
      "--merge-output-format",
      "mp4",
      "--output",
      outputTemplate,
      item.sourceUrl
    ]);
    lastResult = { ...result, attempt };

    if (result.errorCode === "ENOENT") {
      const error = new Error("python3 with yt_dlp is required in the environment.");
      error.code = "video_downloader_unavailable";
      throw error;
    }
    if (String(result.stderr).includes("No module named yt_dlp")) {
      const error = new Error("python3 module yt_dlp is required in the environment.");
      error.code = "video_downloader_unavailable";
      throw error;
    }

    const filePath = await findDownloadedPath(outputTemplate);
    if (result.code === 0 && filePath && fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
      return { success: true, filePath, ...lastResult };
    }

    const failure = classifyDownloadFailure(result);
    if (failure?.retryable === false) {
      return {
        success: false,
        filePath: null,
        ...lastResult,
        failure,
      };
    }

    await sleep(Math.min(5000, attempt * 1000));
  }

  const failure = classifyDownloadFailure(lastResult);
  return {
    success: false,
    filePath: null,
    ...(failure ? { failure } : {}),
    ...(lastResult || { code: 1, stdout: "", stderr: "download did not run", attempt: 0 })
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.manifest || !args["output-dir"]) {
    console.error("Usage: node download_videos_from_manifest_with_ytdlp.mjs --manifest <manifest.json> --output-dir <dir> [--report <json>] [--concurrency 2] [--attempts 3]");
    process.exitCode = 1;
    return;
  }

  const manifest = readJson(args.manifest).items || [];
  const outputDir = path.resolve(args["output-dir"]);
  const reportPath = path.resolve(args.report || path.join(outputDir, "_download-report.json"));
  const concurrency = Math.max(1, Number(args.concurrency || 2));
  const attempts = Math.max(1, Number(args.attempts || 3));

  fs.mkdirSync(outputDir, { recursive: true });

  const queue = [...manifest];
  const results = [];

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;

      const outputTemplate = path.join(outputDir, `${item.sourceId}.%(ext)s`);
      const existingFile = await findDownloadedPath(outputTemplate);

      if (existingFile && fs.statSync(existingFile).size > 0) {
        results.push({
          sourceId: item.sourceId,
          sourceUrl: item.sourceUrl,
          filePath: existingFile,
          success: true,
          skipped: true,
          attempts: 0,
          stderr: ""
        });
        continue;
      }

      const run = await downloadOne(item, outputTemplate, attempts);
      results.push({
        ...(run.failure
          ? {
              agentAction: run.failure.agentAction,
              failureCode: run.failure.failureCode,
              failureMessage: run.failure.failureMessage,
              retryable: run.failure.retryable,
            }
          : {}),
        sourceId: item.sourceId,
        sourceUrl: item.sourceUrl,
        filePath: run.filePath,
        success: run.success,
        skipped: false,
        attempts: run.attempt,
        stderr: String(run.stderr || "").trim()
      });
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        itemCount: results.length,
        successCount: results.filter((item) => item.success).length,
        failureCount: results.filter((item) => !item.success).length,
        results
      },
      null,
      2
    )
  );

  console.log(`Saved download report to ${reportPath}`);
}

main().catch((error) => {
  console.error(formatCliError(error));
  process.exitCode = 1;
});
