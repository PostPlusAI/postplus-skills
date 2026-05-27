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

## Execution Boundary
- Separate the workflow into voice profile, optional voice identity, and concrete
  voice take. The script text can change; persona voice continuity should not.
- Voice design is for an initial persona-aligned sound from `text`,
  `voiceDescription`, and `language`.
- Voice clone is for new script takes when approved reference audio or an
  uploaded reference URL should preserve timbre and speaking style.
- Keep `provider: "hosted-media"` and persist request, response, manifest,
  review stub, source basis, and downloaded audio.

## Source And Path
- Ground requests in the active project persona registry, voice baseline, script
  text, and video purpose/lane.
- Use the active project/client folder first; do not assume one client directory
  is the source base for all voice work.
- Keep internal request/response/run state under `.postplus` when it is not the
  user-facing handoff. Keep final audio and review files in the active voice
  asset folder, or state the chosen workspace path.

## Request Boundary
- Hosted media requests require a capability request JSON with explicit
  `capability`, `operation`, `operationId`, and normalized `input`.
- Design requires `jobId`, `text`, `voiceDescription`, and `localOutputDir`.
- Clone requires `jobId`, `text`, `localOutputDir`, and either
  `referenceAudioUrl` or `referenceAudioPath`; local reference audio is uploaded

## Review And Handoff
- Before generation, verify persona registry, voice baseline, script stability,
  route (`voice_design` or `voice_clone_take`), source basis, and output path.
- After generation, review realism, persona fit, pacing, ad-like delivery,
  reuse potential, and for cloned output, timbre/accent drift from the reference.
- If pending, return the saved request path, manifest path, generation handle or
  command. Do not keep polling in the conversation.

## Fail Fast
- Missing hosted capability request, persona registry, voice baseline, text,
  voiceDescription for design, reference audio for clone, source basis, output
  path, auth, hosted capability, or provider network access.
- Do not solve missing voice strategy by randomly changing the TTS description.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill voice-batch-runner`.
- Request schema: `postplus media schema --json`; add `--endpoint <endpoint-key>` for media-generation examples.
- Hosted media capability: `postplus media capability --request <hosted-capability-request.json> --output <result.json>`.
- Use the capability request shape required by the selected workflow; do not call provider APIs directly.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
