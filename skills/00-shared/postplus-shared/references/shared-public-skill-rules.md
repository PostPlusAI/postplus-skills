# Shared Public Skill Rules

Shared execution rules for released PostPlus skills running inside the PostPlus runtime.

Use this rulebook when a skill needs PostPlus Cloud service access, temporary local
artifacts, or a compile step before provider execution.

## PostPlus Cloud Rule

- Treat host-managed adapters, auth, and billing boundaries as the source of
  truth for provider-backed execution.
- Do not probe local secret env vars or ask the user to paste provider tokens
  into the chat just to see whether a capability exists.
- If the PostPlus Cloud boundary reports that a capability is unavailable, unauthorized,
  or not configured, fail fast and report that directly to the user.
- On that capability-missing path, do not switch into a “we can collect later”
  discovery flow.

## Supported Script Rule

- Use PostPlus-supported scripts and PostPlus Cloud services as the supported
  execution path.
- Do not replace PostPlus-supported scripts with ad hoc `curl`, `fetch`,
  `node -e`, heredoc, or exploratory shell glue.
- If a supported script returns a stable proxy, DNS, network, or
  infrastructure error, stop immediately and report that failure directly.

## Parallel Request Rule

- When multiple tool calls, file reads, script requests, provider submissions,
  or data-collection requests are independent, prepare their inputs first and
  dispatch them as a bounded parallel batch instead of running them one by one.
- Do not serialize independent requests just because they target different
  files, accounts, URLs, keywords, assets, platforms, or scripts.
- Keep steps serial only when a later request depends on an earlier result, a
  skill explicitly requires a serial queue, approval or quote confirmation is
  still missing, or the skill's own cost/rate-limit boundary requires smaller
  batches.
- For approved side-effecting or provider-backed work, submit approved
  independent items concurrently within the skill's stated batch or concurrency
  limit. Do not create duplicate requests to mask slow or failing providers.

## Async Provider Task Rule

- When a supported script returns `pending`, `processing`, `generationHandle`,
  `runHandle`, `providerUrls.get`, or a `collection-report.json`, treat that as
  a real resumable checkpoint.
- Do not block the user's conversation by looping on provider polling when the
  next useful action does not depend on the finished artifact.
- Tell the user the job is still running, name the durable checkpoint in
  business terms, and continue with independent planning, review, or prep work
  when useful.
- Poll again only when the next step truly needs the finished result or when
  the user explicitly asks to wait for completion.
- If there is no useful parallel work, run one bounded poll pass, report the
  current status, and keep the resume command or checkpoint available.

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

- `postplus research collect --input` receives a `schemaVersion: 1` envelope.
- `postplus media|publish|mobile capability --request` receives a hosted
  capability request with explicit `capability`, `operation`, `operationId`,
  and the domain payload fields required by that operation.
- Before writing a hosted request file, read the public schema with
  `postplus research schema --collection-key <key> --json`,
  `postplus media schema --endpoint <endpoint-key> --json`,
  `postplus publish schema --json`, or `postplus mobile schema --json`.
- The skill-specific normalized/domain request belongs under `input` when the
  selected hosted route expects an input object. Do not pass a bare normalized
  request when the command asks for an envelope or capability request.
- Minimum research collection input:

```json
{
  "schemaVersion": 1,
  "input": {}
}
```

- When quote confirmation, hosted operation id, or resume state is needed, keep
  those shared execution fields at the command-supported top level, not inside
  the skill-specific `input` object.
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

- For complex collection families, compile the user brief into provider-ready
  input before the expensive execution step.
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
