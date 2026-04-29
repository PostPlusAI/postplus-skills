# Creative QA Schema Notes

This file defines the intended structure for human review records in the first version.

## 1. QA report

```json
{
  "qaReportId": "qa-example-co-2026-03-render-001-v1",
  "targetObjectType": "video_render",
  "targetObjectId": "example-co-2026-03-render-001",
  "targetVersion": "v1",
  "campaignId": "example-co-2026-03-persona-test",
  "personaId": "example-persona-d-v1",
  "conceptId": "gmail-reply-friction-v1",
  "reviewer": "human",
  "reviewedAt": "2026-03-13T00:00:00.000Z",
  "verdict": "revise",
  "goodReasons": [
    "visual shell feels believable"
  ],
  "badReasons": [
    "mouth motion looks slightly detached from the audio",
    "delivery still feels a bit ad-like"
  ],
  "issueCategories": [
    "lip_sync",
    "audio_style"
  ],
  "blameStage": [
    "voice",
    "render"
  ],
  "scores": {
    "personaConsistency": 4,
    "audioVisualMatch": 2,
    "ugcNativeFeel": 3,
    "hookClarity": 4
  },
  "proposedAction": "rerun voice and render with less polished delivery",
  "status": "final"
}
```

## 2. Feedback handoff

```json
{
  "feedbackId": "feedback-example-co-2026-03-render-001-v1",
  "qaReportId": "qa-example-co-2026-03-render-001-v1",
  "targetObjectType": "video_render",
  "targetObjectId": "example-co-2026-03-render-001",
  "feedbackCategory": "dependency_feedback",
  "feedbackText": "Voice feels too polished, so rerun voice before rerendering.",
  "dependencyImpact": [
    "voice",
    "render"
  ],
  "rerunTarget": "voice"
}
```

## 3. Important rules

- `reviewer` should name the human role or reviewer when possible
- `verdict` should be one of `approved`, `revise`, `reject`
- `status` should distinguish draft notes from final confirmed review if needed
- `scores` are optional and should never replace `goodReasons` and `badReasons`
- if no person has reviewed the asset yet, do not fabricate a completed QA report

## 4. Rerun priority for realism issues

When human feedback says the talking-head person looks fake:

- do not default to rerunning image, voice, and video together
- first separate:
  - `image_realism`
  - `render_realism`
  - `quality_setting`

Recommended first move:

- keep the current audio take
- rerun the image first
- rerender video against the same audio

Reason:

- this isolates whether the fake feeling is already baked into the source image
- it avoids changing too many variables at once

Only prioritize voice reruns when the human feedback explicitly points to:

- `audio_style`
- `audio_pacing`
- `voice_persona_drift`

If the complaint is visual fake-ness, prefer:

- `blameStage`: `image` or `render`
- `proposedAction`: `rerun image first while keeping audio fixed`
