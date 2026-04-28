# Voice Architecture Notes

This file explains how to think about reusable voice assets over time.

## 1. Why Voice Needs Its Own Layer

If a persona will speak in many videos, the system must keep the voice stable while scripts change.

That means:

- script text is not the same thing as voice identity
- one good take is not enough
- the workflow should remember how the persona should sound

## 2. Three Layers

### Voice Profile

Human-readable description of the voice.

Examples:

- calm practical creator
- medium pace
- friendly and efficient
- not salesy

### Voice Identity

A reusable source of timbre continuity.

Examples:

- provider voice id
- approved seed voice
- captured voice identity from reference audio

### Voice Take

One rendered output for one script.

## 3. Why This Becomes a Skill Family

Voice workflows naturally split into at least three jobs:

1. design the voice
2. preserve the voice while changing scripts
3. review and refine the voice over time

That is why it is better to think in terms of a voice skill family than one monolithic TTS skill.

## 4. What To Persist

For a persona-level voice setup, persist:

- `profile.json`
- approved reference audio
- future identity captures
- notes about what sounds wrong

For each script-level take, persist:

- request
- response
- manifest
- final audio
- review

## 6. Where Voice Clone Fits

Voice clone is the bridge between:

- early voice design
- long-term persona voice continuity

Recommended progression:

1. use `voice-design` to find a persona-aligned voice direction
2. approve one or more reference takes
3. treat those approved takes as reference audio
4. use `voice-clone` to generate future scripts while preserving timbre and style

This is often enough for MVP continuity even before a deeper voice-identity system exists.

## 5. Feedback Loop

Bad voice outputs should not just be rerun blindly.

Record:

- what was wrong
- whether the problem came from:
  - script wording
  - voice description
  - provider behavior
  - pacing
- what should change next time
