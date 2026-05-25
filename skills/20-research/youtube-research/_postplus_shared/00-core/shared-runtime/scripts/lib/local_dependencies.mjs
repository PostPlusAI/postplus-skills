import { spawn, spawnSync } from "node:child_process";

const LOCAL_DEPENDENCY_SPECS = new Set([
  "ffmpeg",
  "ffprobe",
  "python3",
  "python3:PIL",
  "python3:yt_dlp",
]);

function normalizeDependencySpec(spec) {
  const value = String(spec ?? "").trim();
  if (!LOCAL_DEPENDENCY_SPECS.has(value)) {
    throw new Error(`Unsupported local dependency spec: ${value || "<empty>"}`);
  }
  return value;
}

function pythonCandidates(platform) {
  if (platform === "win32") {
    return [
      { args: ["-3"], command: "py", displayName: "py -3" },
      { args: [], command: "python", displayName: "python" },
      { args: [], command: "python3", displayName: "python3" },
    ];
  }

  return [{ args: [], command: "python3", displayName: "python3" }];
}

export function getLocalDependencyCommandCandidates(
  spec,
  { platform = process.platform } = {},
) {
  const normalized = normalizeDependencySpec(spec);

  if (normalized.startsWith("python3")) {
    return pythonCandidates(platform).map((candidate) => ({
      ...candidate,
      dependency: normalized,
    }));
  }

  return [
    {
      args: [],
      command: normalized,
      dependency: normalized,
      displayName: normalized,
    },
  ];
}

function getLocalDependencyProbeArgs(spec) {
  switch (normalizeDependencySpec(spec)) {
    case "ffmpeg":
    case "ffprobe":
      return ["-version"];
    case "python3":
      return [
        "-c",
        "import sys; raise SystemExit(0 if sys.version_info[0] == 3 else 1)",
      ];
    case "python3:PIL":
      return ["-c", "from PIL import Image, ImageDraw, ImageFont"];
    case "python3:yt_dlp":
      return ["-c", "import yt_dlp"];
    default:
      throw new Error(`Unsupported local dependency spec: ${spec}`);
  }
}

function createLocalDependencyMissingError(spec, message, attempts) {
  const detail = message || `${normalizeDependencySpec(spec)} is required.`;
  const error = new Error(
    [
      `local_dependency_missing: ${detail}`,
      "Follow the postplus-shared Local Dependency Bootstrap Rule, then rerun this script.",
    ].join(" "),
  );
  error.dependency = normalizeDependencySpec(spec);
  error.probeAttempts = attempts;
  return error;
}

function probeLocalDependencySync(candidate, probeArgs, options) {
  const result = spawnSync(candidate.command, [...candidate.args, ...probeArgs], {
    cwd: options.cwd,
    encoding: "utf8",
    env: options.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  return {
    command: candidate.displayName,
    errorCode: result.error?.code ?? null,
    status: result.status,
    stderr: result.stderr ?? "",
    stdout: result.stdout ?? "",
  };
}

async function probeLocalDependency(candidate, probeArgs, options) {
  return await new Promise((resolve) => {
    const child = spawn(candidate.command, [...candidate.args, ...probeArgs], {
      cwd: options.cwd,
      env: options.env,
      stdio: ["ignore", "pipe", "pipe"],
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
        command: candidate.displayName,
        errorCode: error.code ?? null,
        status: null,
        stderr: error.message || String(error),
        stdout,
      });
    });
    child.on("close", (status) => {
      resolve({
        command: candidate.displayName,
        errorCode: null,
        status,
        stderr,
        stdout,
      });
    });
  });
}

export function resolveLocalDependencyCommandSync(spec, options = {}) {
  const normalized = normalizeDependencySpec(spec);
  const {
    env = process.env,
    missingMessage,
    platform = process.platform,
    probeSync = probeLocalDependencySync,
    cwd,
  } = options;
  const probeArgs = getLocalDependencyProbeArgs(normalized);
  const attempts = [];

  for (const candidate of getLocalDependencyCommandCandidates(normalized, {
    platform,
  })) {
    const attempt = probeSync(candidate, probeArgs, { cwd, env });
    attempts.push(attempt);

    if (attempt.status === 0) {
      return candidate;
    }
  }

  throw createLocalDependencyMissingError(normalized, missingMessage, attempts);
}

export async function resolveLocalDependencyCommand(spec, options = {}) {
  const normalized = normalizeDependencySpec(spec);
  const {
    env = process.env,
    missingMessage,
    platform = process.platform,
    probe = probeLocalDependency,
    cwd,
  } = options;
  const probeArgs = getLocalDependencyProbeArgs(normalized);
  const attempts = [];

  for (const candidate of getLocalDependencyCommandCandidates(normalized, {
    platform,
  })) {
    const attempt = await probe(candidate, probeArgs, { cwd, env });
    attempts.push(attempt);

    if (attempt.status === 0) {
      return candidate;
    }
  }

  throw createLocalDependencyMissingError(normalized, missingMessage, attempts);
}

export function runResolvedLocalDependencyCommandSync(
  resolved,
  args,
  options = {},
) {
  const { cwd, env = process.env, ...spawnOptions } = options;
  return spawnSync(resolved.command, [...resolved.args, ...args], {
    cwd,
    env,
    ...spawnOptions,
  });
}

export function runLocalDependencyCommandSync(spec, args, options = {}) {
  const resolved = resolveLocalDependencyCommandSync(spec, options);
  const { cwd, env = process.env, missingMessage } = options;
  const spawnOptions = { ...options };
  delete spawnOptions.cwd;
  delete spawnOptions.env;
  delete spawnOptions.missingMessage;
  delete spawnOptions.platform;
  delete spawnOptions.probeSync;
  const result = runResolvedLocalDependencyCommandSync(resolved, args, {
    cwd,
    env,
    ...spawnOptions,
  });

  if (result.error?.code === "ENOENT") {
    throw createLocalDependencyMissingError(
      spec,
      missingMessage,
      [
        {
          command: resolved.displayName,
          errorCode: result.error.code,
          status: null,
          stderr: result.error.message,
          stdout: "",
        },
      ],
    );
  }

  return result;
}

export async function runResolvedLocalDependencyCommand(
  resolved,
  args,
  options = {},
) {
  const { cwd, env = process.env } = options;

  return await new Promise((resolve) => {
    const child = spawn(resolved.command, [...resolved.args, ...args], {
      cwd,
      env,
      stdio: ["ignore", "pipe", "pipe"],
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
        command: resolved.displayName,
        errorCode: error.code ?? null,
        stderr: error.message || String(error),
        stdout,
      });
    });
    child.on("close", (code) => {
      resolve({
        code,
        command: resolved.displayName,
        errorCode: null,
        stderr,
        stdout,
      });
    });
  });
}

export async function runLocalDependencyCommand(spec, args, options = {}) {
  const resolved = await resolveLocalDependencyCommand(spec, options);
  const { cwd, env = process.env } = options;
  const result = await runResolvedLocalDependencyCommand(resolved, args, {
    cwd,
    env,
  });

  if (result.errorCode === "ENOENT") {
    throw createLocalDependencyMissingError(
      spec,
      options.missingMessage,
      [
        {
          command: resolved.displayName,
          errorCode: result.errorCode,
          status: null,
          stderr: result.stderr,
          stdout: result.stdout,
        },
      ],
    );
  }

  return result;
}
