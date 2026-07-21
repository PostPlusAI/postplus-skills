---
name: voice-batch-runner
description: Generate and manage persona-aware voice assets for short-form video production, including voice design, script-specific audio takes, and future reusable voice identities. Use this when persona registries and scripts already exist and you need local audio assets, voice manifests, and reviewable voice iterations without losing continuity across many videos.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Voice Batch Runner

## Use When
- Persona, concept, and script inputs already exist and the next step is hosted
  voice design, cloned voice take generation, or polling.
- The voice should remain a durable persona asset across scripts, not a one-off
  audio byproduct.

## Do Not Use When
- The task belongs to ideation, QA, or another released skill listed in the handoff section.
- Required inputs are missing and guessing would change the result.
- Voice strategy, task class, translation policy, or lip-sync intent is still
  unresolved. Use `audio-generation` first.

## Execution Boundary
- This runner validates and executes normalized voice requests. It must not make
  creative strategy, voice-policy, or reference-policy decisions.
- Separate the workflow into voice profile, optional voice identity, and concrete
  voice take. The script text can change; persona voice continuity should not.
- Voice design is for an initial persona-aligned sound from `text`,
  `voice_description`, and `language`.
- Voice clone is for new script takes when approved reference `audio` and an
  optional `reference_text` should preserve timbre and speaking style.

## Source And Path
- Ground requests in the active project persona registry, voice baseline, script
  text, and video purpose/lane.
- Use the active project/client folder first; do not assume one client directory
  is the source base for all voice work.
- Keep internal request/response/run state under `.postplus` when it is not the
  user-facing handoff. Keep final audio and review files in the active voice
  asset folder, or state the chosen workspace path.

## Request Boundary
- Voice design synthesizes a persona voice from spoken `text`, a free-text
  `voice_description`, and an optional `language` (defaults to auto).
- Voice clone reproduces an approved voice from spoken `text`, an `audio`
  reference, an optional `reference_text` transcript, and optional `language`.
  Upload a local reference with
  `postplus media-file upload --skill voice-batch-runner --input-file <file> --mime <audio/mpeg|audio/wav> --output <upload.json>`,
  then pass the persistent `output.mediaReference` as `--audio`; a remote HTTPS
  URL also works, but must remain reachable through submission.
- Exact field names, requiredness, and defaults are discovered from
  `postplus media schema --json` and the generated example below; do not hard-code
  a private request envelope here.

## Review And Handoff
- Before generation, verify persona registry, voice baseline, script stability,
  route (`voice_design` or `voice_clone_take`), source basis, and output path.
- After generation, review realism, persona fit, pacing, ad-like delivery,
  reuse potential, and for cloned output, timbre/accent drift from the reference.
- If pending, return the manifest path, the `output.data.id`
  generation handle, and the poll command
  `postplus media poll --handle <output.data.id>`. The poll waits in-command
  (up to 45s per invocation, checking every 8s); rerun it while pending
  instead of writing a tighter retry loop.
- Save a finished take with
  `postplus media-file download --url <fresh-output-url> --output-file <path>`
  (or `--reference <postplus-media://...>` for hosted storage); provider output
  URLs are temporary, so download while fresh.

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Batch isolation: when producing a batch of independent items, a per-item
  provider content/safety rejection is isolated to that item. It is identified
  only by the typed code `postplus_cli_hosted_media_content_policy_blocked`,
  never by provider prose, and it surfaces at either boundary: a failed
  `postplus media create` whose typed error `code` is that code, or a
  submitted run whose poll result carries `output.data.status: failed` and
  `output.data.error.code` set to that code. On either, record which item was
  blocked and its exact reason, skip it, and continue submitting and polling
  the remaining items, then report the incomplete set at the end. Do not retry,
  soften, or re-submit the blocked item — that is a forbidden payload rewrite.
  Every other failure (a failed owned CLI/script command whose typed `code` is
  not that content-policy code, or a run whose `error.code` is not that
  content-policy code — auth, transport, quota, malformed request, provider
  outage) is systemic: stop per the rule above.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill voice-batch-runner`.
- Poll a pending voice take: `postplus media poll --handle <output.data.id>`
  (waits in-command up to 45s per invocation; rerun while pending).
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Use `postplus media schema --json` only when constructing or repairing an unknown request shape.
- Run the hosted submit with the generated command below; do not call provider APIs directly.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus media create voice-design \
  --text <text> \
  --voice-description <voice-description> \
  --output <result.json>
```
<!-- END GENERATED EXECUTION EXAMPLE -->

- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
