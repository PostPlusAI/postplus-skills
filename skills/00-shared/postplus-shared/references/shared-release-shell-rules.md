# Shared Release-Shell Rules

Shared execution rules for released PostPlus skills running inside a product
shell.

Use this rulebook when a skill needs hosted capability access, temporary local
artifacts, or a compile step before provider execution.

## Hosted Capability Rule

- Treat host-managed adapters, auth, and billing boundaries as the source of
  truth for provider-backed execution.
- Do not probe local secret env vars or ask the user to paste provider tokens
  into the chat just to see whether a capability exists.
- If the hosted boundary reports that a capability is unavailable, unauthorized,
  or not configured, fail fast and report that directly to the user.
- On that capability-missing path, do not switch into a “we can collect later”
  discovery flow.

## Supported Script Rule

- Use PostPlus-supported scripts and hosted boundaries as the supported
  execution path.
- Do not replace PostPlus-supported scripts with ad hoc `curl`, `fetch`,
  `node -e`, heredoc, or exploratory shell glue.
- If a supported script returns a stable proxy, DNS, network, or
  infrastructure error, stop immediately and report that failure directly.

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

## Compile-Step Rule

- For complex collection families, compile the user brief into provider-ready
  input before the expensive execution step.
- Inspect or adjust the compiled input when the request is high-cost, ambiguous,
  or unusually broad.

## Local Dependency Bootstrap Rule

- For approved local media dependencies in the current CLI-first release, the
  user's agent should proactively install the missing dependency in the user's
  local environment before running the supported script that needs it.
- Current approved local media dependencies are:
  - `python3`
  - `yt_dlp`
  - `ffmpeg`
  - `ffprobe`
- `PostPlus CLI` itself is not the installer for those tools.
- Use the smallest direct install path already supported by the host
  environment.
- After installation, rerun a direct verification command before continuing.
- If installation or verification fails, stop immediately and report that
  failure directly instead of inventing fallback glue.

## Cost Discipline

- Default to a bounded first pass before a broader second pass.
- Treat the first pass as evidence gathering for inspection and iteration, not
  as the full-market scrape.
