# Shared Public Skill Rules

Shared execution rules for released PostPlus skills running inside the PostPlus runtime.

Use this rulebook when a skill needs PostPlus Cloud service access, temporary local
artifacts, or a compile step before hosted execution.

## PostPlus Cloud Rule

- Treat PostPlus Cloud auth, usage approval, and execution as the source of
  truth for hosted work.
- Do not probe local secret env vars or ask the user to paste service tokens
  into the chat just to see whether a capability exists.
- If the PostPlus Cloud boundary reports that a capability is unavailable, unauthorized,
  or not configured, fail fast and report that directly to the user.
- On that capability-missing path, do not switch into a “we can collect later”
  discovery flow.

## Client Update Rule

- A client compatibility failure is an update precondition, not a capability
  failure. PostPlus Cloud returns it when the installed PostPlus CLI or the
  installed PostPlus skills are older than the current release; it surfaces as
  `postplus_client_upgrade_required`, as HTTP 426, or as a message saying the
  PostPlus CLI or PostPlus skills are out of date.
- This is the one failure class the agent recovers from on its own. Every other
  boundary failure still follows the PostPlus Cloud Rule above: fail fast and
  report it to the user.
- Nothing updates automatically. The installed CLI does not self-upgrade during
  ordinary commands; it only updates when the update command is actually run.
- Recovery is exactly one command: `postplus update`. It is auth-independent and
  it updates a stale CLI and the installed skills in the same invocation. Do not
  run `postplus auth login` for this failure, and do not run a separate
  package-manager install or skills-install command first.
- After it succeeds, run `postplus status` to confirm the CLI and installed
  skills are current, then retry the original command once.
- If `postplus update` itself fails on permissions, network, DNS, proxy, or
  registry errors, stop and report that update failure. Do not fall back to other
  install commands, edit installed skill files, or work around the compatibility
  check.
- If the response asks for a restarted agent session, say so plainly and stop.
  Updated skill instructions only load into a new session, so retrying in a loop
  in the current session cannot pick them up.

## Supported Script Rule

- Use PostPlus-supported scripts and PostPlus Cloud services as the supported
  execution path.
- Do not replace PostPlus-supported scripts with ad hoc `curl`, `fetch`,
  `node -e`, heredoc, or exploratory shell glue.
- If a supported script returns a stable proxy, DNS, network, or
  infrastructure error, stop immediately and report that failure directly.

## Parallel Request Rule

- When multiple tool calls, file reads, script requests, hosted submissions,
  or data-collection requests are independent, prepare their inputs first and
  dispatch them as a bounded parallel batch instead of running them one by one.
- Do not serialize independent requests just because they target different
  files, accounts, URLs, keywords, assets, platforms, or scripts.
- Keep steps serial only when a later request depends on an earlier result, a
  skill explicitly requires a serial queue, approval or quote confirmation is
  still missing, or the skill's own cost/rate-limit boundary requires smaller
  batches.
- For approved side-effecting or hosted work, submit approved
  independent items concurrently within the skill's stated batch or concurrency
  limit. Do not create duplicate requests to mask slow or failing services.

## Async Task Rule

- When a supported command returns `pending`, `processing`, a run handle, or a
  durable result file, treat that as a real resumable checkpoint.
- Do not block the user's conversation by looping on status checks when the
  next useful action does not depend on the finished artifact.
- Tell the user the job is still running, name the durable checkpoint in
  business terms, and continue with independent planning, review, or prep work
  when useful.
- Poll again only when the next step truly needs the finished result or when
  the user explicitly asks to wait for completion.
- If there is no useful parallel work, run one bounded poll pass, report the
  current status, and keep the resume command or checkpoint available. The
  resume command for a hosted media job is `postplus media poll --handle
  <output.data.id>`. Research resumes only from the result file with
  `postplus research run --resume-from <result.json>`. Never extract, paste,
  or rewrite `runHandle`; the CLI reads it byte-for-byte and updates the same
  checkpoint file. A hosted runtime without a shared local filesystem follows
  its own structured polling contract instead of emulating the local command.

## Work Folder Rule

- Temporary request files, actor-input files, raw datasets, index files, and
  cache-like intermediates belong under the current work folder's `.postplus/`
  directory.
- Keep final user-facing deliverables outside `.postplus/`.
- Treat `.postplus/` as internal implementation state and do not explain its
  management steps to the user unless the user explicitly asks for internals.
- Do not write runtime temp artifacts into installed skill directories.

## Real File Rule

- When a tool or script expects `--input <file.json>` or a comparable file
  argument, provide a real file path.
- If the input must be synthesized first, write it as a real file under
  `.postplus/` instead of passing inline JSON text.

## Hosted Request Shape Rule

- Hosted skills run the converged verb grammar. The agent supplies only the
  skill-specific input; the closed-source CLI runner translates it into the
  hosted request and owns execution metadata.
- Research and media accept product intent directly as semantic flags:
  `postplus research run <route> --<semantic-flags>` and
  `postplus media <verb> <endpoint-key> --<role-or-intent-flags>`. Local media
  paths are valid role values; the CLI handles durable staging internally.
- When the Skill does not already make a flag clear, inspect the exact public
  surface with
  `postplus research schema --route <route> --json`,
  `postplus media schema --endpoint <endpoint-key> --json`, or the target's
  `--help`. Do not create JSON request envelopes for Research or media.
- Publishing intentionally retains an opaque product request:
  `postplus publish <operation> --request <input.json>`. Read
  `postplus publish schema --json` before writing it.
- Do not hand-write runner-managed fields such as ids, tokens, service routing,
  or storage handoffs; the CLI and Web own them.
- Pass shared execution fields as command-supported flags
  (`--quote-confirmation-token` or `--hosted-operation-id`), not inside the
  skill-specific input. Research resume state stays in the `--output` result
  file and is consumed through `--resume-from`; never copy its opaque handle
  into a command or request body.
- If a hosted command prints `Quote confirmation challenge: <path>`, run the
  exact `postplus quote confirm --json --challenge-file <path>` command, then
  rerun the same hosted command with `--quote-confirmation-token <token>`.

## Conversation Media Rule

- When the user shares images, videos, or other media inside a local AI agent
  conversation, only save or upload the media if the agent can access a real
  local file path, attachment handle, clipboard bytes, or other actual binary
  source exposed by the host runtime.
- If the agent can only see the media as model context and cannot access the
  original bytes, do not recreate, screenshot, summarize, or generate a
  substitute file and present it as the original asset.
- On that path, stop and tell the user the honest unblocker: provide a local
  path, attach the file through a host mode that exposes a path, or save the
  media to disk before continuing.
- Do not send conversation media to PostPlus Cloud through inline base64 in the
  hosted JSON request. Use the supported local file upload path when a real
  file or binary source exists.

## Compile-Step Rule

- For complex research routes, compile the user brief into semantic flags
  before the hosted execution step.
- Inspect or adjust the compiled input when the request is high-cost, ambiguous,
  or unusually broad.

## Local Dependency Bootstrap Rule

- For approved local media dependencies in the current CLI-first release, the
  user's agent must proactively install the missing dependency in the user's
  local environment before running the supported script that needs it.
- Current approved local media dependencies are:
  - `python3`
  - `yt_dlp`
  - `ffmpeg`
  - `ffprobe`
- Skill scripts must call the PostPlus CLI local dependency checks for
  these dependencies. Individual skills must not hard-code OS-specific binary
  names, shell syntax, or install paths.
- The resolver owns platform command selection. It keeps macOS/Linux on the
  canonical `python3` path and uses the Windows Python launcher / Python 3
  command candidates when the host platform is Windows.
- `PostPlus CLI` itself is not the installer for those tools.
- Do not ask a non-technical end user to install those tools manually or to
  interpret tool names such as `ffprobe`.
- Use the smallest direct install path already supported by the host
  environment.
- After installation, rerun a direct verification command before continuing.
- If installation or verification fails, stop immediately and report that
  failure directly instead of inventing fallback glue.

## Cost Discipline

- Default to a bounded first pass before a broader second pass.
- Treat the first pass as evidence gathering for inspection and iteration, not
  as the full-market scrape.
