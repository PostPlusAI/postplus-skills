# Hosted TTS Voice Clone Notes

## Why It Matters

This hosted capability is useful when a persona already has an approved reference audio and later scripts need to preserve the same voice more closely than a text-only voice description can.

That makes it important for:

- persona voice continuity
- multi-video campaigns
- keeping timbre stable while text changes

## Documented Inputs

- `audio` required
- `text` required
- `reference_text` optional but recommended
- `language` optional, default `auto`

The `audio` field expects:

- URL of the reference audio to clone the voice from

Language options currently documented:

- `auto`
- `Chinese`
- `English`
- `German`
- `Italian`
- `Portuguese`
- `Spanish`
- `Japanese`
- `Korean`
- `French`
- `Russian`

## Documented Output

The response schema documents:

- `outputs`
- `status`
- `urls`
- `created_at`
- `has_nsfw_contents`
- `id`
- `model`

Interpretation for the adapter:

- submit the clone job
- preserve `id`
- if status is not `completed`, poll via `urls.get`
- use `outputs` as the downloadable audio URL list

## Practical Role In This Workspace

Treat `voice-clone` as:

- stronger than `voice-design` for preserving a chosen voice
- dependent on having approved reference audio first
- suitable once the team likes a persona's voice and wants to reuse it across many scripts

## Recommended Usage Pattern

1. create initial voice candidates with `voice-design`
2. approve one reference take
3. store that take under the persona voice folder
4. generate future script takes with `voice-clone`
5. persist review feedback about timbre drift or mismatch

## Operational Notes

- clean reference audio matters a lot
- `reference_text` should be stored whenever available
- 3-15 seconds of clear speech is the documented sweet spot
- matching the target language to the reference audio language should improve results
