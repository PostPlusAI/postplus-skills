# Voice Tool Contracts

> All `jobId`, `campaignId`, `personaId`, `voiceProfileId`, path values, and
> filenames in the examples below are structural placeholders. They illustrate
> the expected shape; no real customer or campaign data appears here.

This file defines the normalized tool-layer contracts for voice generation.

The goal is to keep the voice workflow stable even if providers change.

The normalized request objects below are domain payloads. Hosted voice scripts
do not execute these objects directly. The executable file passed to `--request`
must wrap the normalized request in the hosted execution envelope:

```json
{
  "schemaVersion": 1,
  "input": {
    "...": "normalized voice request"
  }
}
```

## 1. `design_voice`

Purpose:

- generate an initial persona-aligned voice from description, before long-term voice identity is locked

Normalized request shape:

```json
{
  "jobId": "example-co-2026-Q1-voice-design-a-v1",
  "campaignId": "example-co-2026-Q1-persona-test",
  "personaId": "example-persona-a-v1",
  "voiceProfileId": "voice-profile-example-persona-a-v1",
  "provider": "hosted-media",
  "model": "voice-qwen3-design",
  "mode": "voice_design",
  "text": "Stop switching tabs to reply to emails.",
  "voiceDescription": "young adult male, calm and practical, creator-style but not salesy, medium pace, friendly and efficient, lightly nerdy work-friend energy",
  "language": "en",
  "localOutputDir": "customers/example-co/campaigns/example-campaign-2026-Q1/voices/example-co-2026-Q1-voice-design-a-v1",
  "sourceBasis": [
    "customers/example-co/assets/personas/example-persona-a-v1/registry.json"
  ]
}
```

This object is the executable envelope's `input` value.

Normalized response shape:

```json
{
  "jobId": "example-co-2026-Q1-voice-design-a-v1",
  "provider": "hosted-media",
  "model": "voice-qwen3-design",
  "mode": "voice_design",
  "requestPath": "customers/example-co/campaigns/example-campaign-2026-Q1/voices/example-co-2026-Q1-voice-design-a-v1/request.json",
  "responsePath": "customers/example-co/campaigns/example-campaign-2026-Q1/voices/example-co-2026-Q1-voice-design-a-v1/response.json",
  "audioPath": "customers/example-co/campaigns/example-campaign-2026-Q1/voices/example-co-2026-Q1-voice-design-a-v1/audio/take-001.wav",
  "voiceProfileId": "voice-profile-example-persona-a-v1"
}
```

Hosted execution mapping:

- The CLI skill calls the PostPlus Cloud hosted voice capability endpoint.
- The server selects the underlying provider and model.
- Request body minimum:

```json
{
  "text": "",
  "voice_description": ""
}
```

- optional request field:
  - `language`
- response fields to preserve raw:
  - `id`
  - `model`
  - `outputs`
  - `status`
  - `urls`
  - `created_at`
  - `has_nsfw_contents`

## 2. Script-Specific `design_voice` Take

Purpose:

- generate a script-specific take while keeping a stable persona voice profile or identity

Normalized request shape:

```json
{
  "jobId": "example-co-2026-Q1-th-001-voice-a-v1",
  "campaignId": "example-co-2026-Q1-th-test",
  "personaId": "example-persona-a-v1",
  "voiceProfileId": "voice-profile-example-persona-a-v1",
  "voiceIdentityId": null,
  "provider": "hosted-media",
  "model": "voice-qwen3-design",
  "mode": "voice_take",
  "text": "The annoying part isn't writing the email. It's all the extra steps.",
  "voiceDescription": "reuse the approved persona voice profile: calm practical creator, medium pace, friendly and efficient",
  "language": "en",
  "scriptSourcePath": "customers/example-co/reports/example-talking-head-concepts-and-scripts-2026-Q1.md",
  "localOutputDir": "customers/<customer-id>/campaigns/example-co-2026-Q1-th-test/voices/example-co-2026-Q1-th-001-voice-a-v1",
  "sourceBasis": [
    "customers/example-co/assets/personas/example-persona-a-v1/registry.json"
  ]
}
```

This object is the executable envelope's `input` value.

Normalized response shape:

```json
{
  "jobId": "example-co-2026-Q1-th-001-voice-a-v1",
  "provider": "hosted-media",
  "model": "voice-qwen3-design",
  "mode": "voice_take",
  "requestPath": "customers/<customer-id>/campaigns/example-co-2026-Q1-th-test/voices/example-co-2026-Q1-th-001-voice-a-v1/request.json",
  "responsePath": "customers/<customer-id>/campaigns/example-co-2026-Q1-th-test/voices/example-co-2026-Q1-th-001-voice-a-v1/response.json",
  "manifestPath": "customers/<customer-id>/campaigns/example-co-2026-Q1-th-test/voices/example-co-2026-Q1-th-001-voice-a-v1/manifest.json",
  "audioPath": "customers/<customer-id>/campaigns/example-co-2026-Q1-th-test/voices/example-co-2026-Q1-th-001-voice-a-v1/audio/take-001.wav",
  "voiceProfileId": "voice-profile-example-persona-a-v1",
  "voiceIdentityId": null,
  "reviewStatus": "pending_review"
}
```

Run this shape through `scripts/design_voice.mjs`. The script calls the hosted
voice-design endpoint and preserves the outer `voice_take` object shape.

## 3. Future `capture_voice_identity`

Purpose:

- create a reusable voice identity from approved reference audio so future scripts can preserve timbre more tightly

This is not implemented yet, but the normalized request should later support:

```json
{
  "jobId": "capture-voice-id-a-v1",
  "personaId": "example-persona-a-v1",
  "voiceProfileId": "voice-profile-example-persona-a-v1",
  "referenceAudioPaths": [
    "customers/<customer-id>/campaigns/<campaign-id>/voices/.../audio/take-001.wav"
  ],
  "localOutputDir": "customers/example-co/assets/personas/example-persona-a-v1/voice/identities/capture-voice-id-a-v1"
}
```

## 4. `clone_voice_take`

Purpose:

- generate a new script-specific take from approved reference audio while preserving voice identity more tightly than voice-design

Normalized request shape:

```json
{
  "jobId": "example-co-2026-Q1-th-001-voice-clone-a-v1",
  "campaignId": "example-co-2026-Q1-th-test",
  "personaId": "example-persona-a-v1",
  "voiceProfileId": "voice-profile-example-persona-a-v1",
  "voiceIdentityId": "voice-identity-example-persona-a-v1",
  "provider": "hosted-media",
  "model": "voice-qwen3-clone",
  "mode": "voice_clone_take",
  "referenceAudioPath": "customers/example-co/assets/personas/example-persona-a-v1/voice/approved/reference-001.wav",
  "referenceAudioUrl": null,
  "referenceText": "Stop switching tabs to reply to emails.",
  "text": "The annoying part isn't writing the email. It's all the extra steps.",
  "language": "English",
  "scriptSourcePath": "customers/example-co/reports/example-talking-head-concepts-and-scripts-2026-Q1.md",
  "localOutputDir": "customers/<customer-id>/campaigns/example-co-2026-Q1-th-test/voices/example-co-2026-Q1-th-001-voice-clone-a-v1",
  "sourceBasis": [
    "customers/example-co/assets/personas/example-persona-a-v1/registry.json"
  ]
}
```

This object is the executable envelope's `input` value.

Normalized response shape:

```json
{
  "jobId": "example-co-2026-Q1-th-001-voice-clone-a-v1",
  "provider": "hosted-media",
  "model": "voice-qwen3-clone",
  "mode": "voice_clone_take",
  "requestPath": "customers/<customer-id>/campaigns/example-co-2026-Q1-th-test/voices/example-co-2026-Q1-th-001-voice-clone-a-v1/request.json",
  "responsePath": "customers/<customer-id>/campaigns/example-co-2026-Q1-th-test/voices/example-co-2026-Q1-th-001-voice-clone-a-v1/response.json",
  "manifestPath": "customers/<customer-id>/campaigns/example-co-2026-Q1-th-test/voices/example-co-2026-Q1-th-001-voice-clone-a-v1/manifest.json",
  "audioPath": "customers/<customer-id>/campaigns/example-co-2026-Q1-th-test/voices/example-co-2026-Q1-th-001-voice-clone-a-v1/audio/take-001.wav",
  "voiceProfileId": "voice-profile-example-persona-a-v1",
  "voiceIdentityId": "voice-identity-example-persona-a-v1",
  "reviewStatus": "pending_review"
}
```

Hosted execution mapping:

- The CLI skill calls the PostPlus Cloud hosted voice clone capability endpoint.
- The server selects the underlying provider and model.
- The clone adapter uploads reference audio if the workflow starts from a local file.
- Request body minimum:

```json
{
  "audio": "",
  "text": ""
}
```

- optional request fields:
  - `reference_text`
  - `language`
- response fields to preserve raw:
  - `id`
  - `model`
  - `outputs`
  - `status`
  - `urls`
  - `created_at`
  - `has_nsfw_contents`

## Review Object

Every generated take should be reviewable with a small structured object:

```json
{
  "status": "needs_edit",
  "issues": [
    {
      "category": "voice_too_salesy",
      "severity": "major",
      "note": "sounds too ad-like",
      "suggestedAction": "rerun_voice_take"
    }
  ]
}
```
