---
name: audio-generation
description: Plan TTS, voice cloning, voice change, translated dub, or lip-sync audio. Resolve voice and reference policy before handing a ready request to voice-batch-runner.
metadata:
  postplus:
    familyId: routing-contracts
    familyName: Routing & Contracts
---

# Audio Generation

## Use When
- The desired final asset is generated audio or audio prepared for a video
  render.
- The request includes TTS, voice design, voice cloning, voice change,
  translated dub, podcast audio, or lip-sync handoff.
- The next decision is audio task class, reference policy, and runner handoff.

## Do Not Use When
- The user needs speech-to-text from existing audio. Use `audio-transcription`;
  use its local subtitle reference when an existing timed transcript needs subtitle files.
- The voice request is already normalized for execution. Use
  `voice-batch-runner`.
- The final work is a full video production pipeline. Use `video-batch-runner` after the audio handoff is clear.

## Core Boundary
This is the audio generation controller. It does not submit jobs.

It must classify the task and hand off execution. It must not let a runner
invent voice strategy, translation policy, or lip-sync intent.

## Task Classes

| Task class | Use when | Handoff |
| --- | --- | --- |
| `tts` | new spoken audio from script | `voice-batch-runner` with voice design rules |
| `change_voice` | preserve script, alter voice identity or delivery | reference contract, then `voice-batch-runner` |
| `translate_dub` | translate and dub source audio | require language, meaning-preservation, and timing policy |
| `voice_clone_take` | approved reference voice should preserve timbre | bind reference audio, then `voice-batch-runner` |
| `podcast_audio` | speaker-led or conversational audio | create voice/script handoff before video assembly |
| `lip_sync_handoff` | audio drives talking-head or UGC render | `voice-batch-runner`, then `video-batch-runner` |

## Reference Rules
- Approved voice reference audio is `binding`.
- Accent, energy, cadence, or genre examples are inspiration-only unless the
  user explicitly binds them.
- Source audio used only for translation meaning is not a voice identity
  binding unless stated.
- Excluded voices, music, or effects must not enter the runner request.

## Routing Table

| If not audio-generation | Send to |
| --- | --- |
| Transcribe existing audio | `audio-transcription` |
| Need generated image/video around audio | `video-batch-runner` |
| Need normalized hosted voice execution | `voice-batch-runner` |
| Need lip-sync video after audio | `video-batch-runner` |

## Output Shape
Return:

- `taskClass`
- `scriptPolicy`
- `voicePolicy`
- `referencePolicy`
- `runnerHandoff`
- `nextVideoHandoff` when lip-sync or video assembly follows
- `mustNotDo`

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- Do not ask `voice-batch-runner` to decide the creative role of the voice.


## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.

- This public skill is instruction-driven. Produce the controller handoff
  artifact directly from the available evidence.
- Do not call private provider/runtime paths or unpublished local tools.
- If the CLI returns a quote-confirmation challenge, obtain user approval for its scope and cost before running `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
