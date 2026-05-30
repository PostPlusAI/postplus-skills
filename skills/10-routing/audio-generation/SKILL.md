---
name: audio-generation
description: Control audio generation requests before execution. Use this when the user asks for TTS, persona voice, voice change, translated dub, cloned voice take, podcast audio, or lip-sync audio handoff and the skill must classify the request before handing execution to voice-batch-runner or a video workflow.
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
- The user only needs transcription, subtitles, or audio analysis. Use
  `media-router`.
- The voice request is already normalized for execution. Use
  `voice-batch-runner`.
- The final work is a full video production pipeline. Use `video-generation` or
  `ugc-flow` after the audio handoff is clear.

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
| `lip_sync_handoff` | audio drives talking-head or UGC render | `voice-batch-runner`, then `video-generation` |

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
| Transcribe or analyze existing audio | `media-router` |
| Need generated image/video around audio | `video-generation` |
| Need normalized hosted voice execution | `voice-batch-runner` |
| Need lip-sync video after audio | `video-generation` |

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
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- This public skill is instruction-driven. Produce the controller handoff
  artifact directly from the available evidence.
- Do not call private provider/runtime paths or unpublished local tools.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
