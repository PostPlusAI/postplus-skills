---
name: voice-batch-runner
description: Generate and manage persona-aware voice assets for short-form video production, including voice design, script-specific audio takes, and future reusable voice identities. Use this when persona registries and scripts already exist and you need local audio assets, voice manifests, and reviewable voice iterations without losing continuity across many videos.
---

# Voice Batch Runner

Follow shared release-shell rules in:

- `postplus-shared` release-shell rules

Use this skill after persona, concept, and script work already exists.

This skill is for:

- designing an initial voice from persona traits
- generating script-specific audio takes
- storing reusable voice profiles for later videos
- preparing for future voice-identity capture or timbre-preserving generation

This skill is not for unconstrained voice casting.

## Core Idea

Voice should be treated as a first-class persona asset, not a one-off byproduct of one script.

That means the system should separate:

- `voice profile`
  - how this persona should sound
- `voice identity`
  - the reusable voice source or captured timbre, if available
- `voice take`
  - one concrete audio file generated for one script

The script can change every time. The persona voice should remain stable.

## Hosted Boundary Rule

- keep request files, raw provider responses, and run manifests under
  `<work-folder>/.postplus/voice-batch-runner/` when they are internal
  execution state
- keep only final user-facing audio exports outside `.postplus/`
- if hosted voice capability is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue

## Skill Family Direction

This skill is the first member of a future voice skill family.

The family can naturally expand into:

- `voice-batch-runner`
  - current skill; orchestrates voice generation and persistence
- `voice-identity-capture`
  - future skill; captures or normalizes a reusable voice identity from approved reference audio
- `voice-review`
  - future skill; audits realism, pacing, and persona fit

For now, keep everything in `voice-batch-runner`, but design the data model so these can split later.

## Fact Rule

Voice generation should be grounded in persona and content evidence.

Required upstream inputs:

- approved persona registry
- script text
- persona voice baseline
- video purpose or lane if it changes delivery style

Do not let the TTS model invent:

- a totally different age or authority level
- ad-like delivery when the persona is a work-friend creator
- high-drama acting not supported by benchmark tone

## Source Selection Rule

Use persona and script inputs from the active project context.

If the task clearly belongs to one client or campaign folder, read from that context first.

Do not assume one client directory is the default source base for all voice work.


## Voice Objects

This workflow should distinguish three object types.

### 1. Voice Profile

The durable description of how the persona should sound.

Should include:

- `voiceProfileId`
- `personaId`
- `style`
- `pace`
- `tone`
- `language`
- `forbiddenTraits`
- `sourceBasis`

### 2. Voice Identity

An optional reusable voice source.

This may later point to:

- a provider voice id
- a designed seed voice
- a captured timbre from approved reference audio

Should include:

- `voiceIdentityId`
- `voiceProfileId`
- `provider`
- `providerVoiceId` or equivalent
- `referenceAudioPaths`
- `status`

### 3. Voice Take

One concrete generated audio output for one script.

Should include:

- `voiceTakeId`
- `voiceProfileId`
- `voiceIdentityId` if used
- `scriptId` or source path
- `audioPath`
- `requestPath`
- `responsePath`
- `manifestPath`
- `reviewStatus`

## Default Workflow

### 1. Start from persona registry

Before generating audio, confirm the persona registry contains:

- voice baseline
- approved image anchor
- intended use cases

If voice baseline is missing, write it first.

### 2. Create or refine the voice profile

Translate persona traits into a provider-ready voice description.

Example dimensions:

- calm vs energetic
- practical vs polished
- lightly nerdy vs polished professional
- medium pace vs brisk pace
- friendly and efficient vs authoritative

### 3. Generate an initial voice design

Use a voice-design model to generate a reference voice or first take from:

- `text`
- `voice_description`
- `language`

This first result should be reviewed before being treated as reusable.

### 4. Generate script-specific voice takes

Once a voice profile or voice identity exists:

- keep the voice stable
- swap in a new script text
- generate a new take for each new video

The text changes. The voice continuity should not.

### 5. Review and iterate

Voice assets need structured review, not vague opinions.

Common review categories:

- `voice_too_salesy`
- `voice_too_slow`
- `voice_too_fast`
- `voice_not_young_enough`
- `voice_not_professional_enough`
- `voice_too_flat`
- `voice_too_broadcast`
- `voice_persona_drift`

## Path Selection Rule

Store outputs under the active project's voice asset structure when one already exists.

If no such structure exists yet, use a clear workspace output path and state where files were written.

If the output will become a durable client asset, prefer confirming the destination with the user.

## Example Persistence Convention

One possible project-local layout is:

```text
voices/<voice-take-id>/
  request.json
  response.json
  manifest.json
  audio/
  review.json
```

Keep internal request files, raw provider responses, and run manifests under
`<work-folder>/.postplus/voice-batch-runner/` when they are execution
artifacts rather than the final handoff.

## Tool Contract

This skill expects these tool adapters:

- `design_voice`
- `clone_voice_take`

`clone_voice_take` accepts `referenceAudioPath` for local files and uploads it
inside the script before calling the hosted clone endpoint.

Future extension:

- `capture_voice_identity`

See [`references/tool-contracts.md`](references/tool-contracts.md).

## Core Scripts

- `scripts/design_voice.mjs`
- `scripts/clone_voice_take.mjs`

These scripts take normalized request JSON files and write:

- `request.json`
- `response.json`
- `manifest.json`
- `review.json`
- downloaded audio under `audio/`

## Current Provider Direction

First likely provider path:

- hosted voice design capability

Use it for initial voice design or first-pass takes.

Also relevant:

- hosted voice clone capability

Use voice clone when:

- you already have an approved reference audio for a persona
- later scripts need new text but should preserve the same timbre and speaking style
- you can provide the reference transcript for better matching

This fits the future requirement of "script changes, persona voice stays stable" better than voice-design alone.

Read the provider notes before implementing:

- [`references/hosted-tts-voice-design.md`](references/hosted-tts-voice-design.md)
- [`references/hosted-tts-voice-clone.md`](references/hosted-tts-voice-clone.md)

Future provider path:

- a second model that preserves an approved voice timbre while reading new text

That future step should not change the outer workflow. It should only swap the tool adapter or voice identity backend.

## Review Rule

Before generating a take, verify:

- persona registry exists
- voice baseline exists
- script text is finalized enough for review
- output path is explicit

After generating a take, review:

- realism
- persona fit
- pacing
- whether it sounds too much like an ad
- whether it is reusable across many scripts

When reviewing cloned voice output, also check:

- how well it preserves the target timbre
- whether accent and speaking style drift from the reference
- whether the reference audio quality is limiting the result

## Example Commands

Design an initial persona-aligned voice:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/design_voice.mjs \
  --request /path/to/request.json
```

Generate a new take from approved reference audio:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/clone_voice_take.mjs \
  --request /path/to/request.json
```

## Failure Mode

Stop and state the gap if:

- no persona registry exists
- no voice baseline exists
- the script is still too unstable
- the request does not specify whether this is voice design or a script-specific take

Do not solve missing voice strategy by randomly changing the TTS description.
