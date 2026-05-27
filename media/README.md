# Media Skill View

The public skill tree still uses stage directories such as `10-routing` and
`40-creative`. This media view groups those same skills by production role so
agents can route generation work without treating execution runners as strategy
owners.

## Layers

### Base Capability

Base capability skills do one bounded job and produce a reusable artifact.

- `media-router`: routes transcription, subtitles, video analysis, and edit
  understanding work.
- `generation-router`: routes generated media requests into image, video,
  audio, workflow, or understanding-first generation.
- `reference-decode`: extracts hook structure and visual grammar from
  references.
- `reference-contract-builder`: turns references into binding,
  inspiration-only, and excluded policies.
- `storyboard-grid-writer`: turns approved hook logic into panel grids.
- `video-request-architect`: converts approved scene structure into
  provider-agnostic video request architecture.
- `prompt-preflight-qa`: reviews risky generation prompts before execution.

### Workflow

Workflow skills chain base capabilities into a production line and own the
human-readable checkpoints.

- `ugc-flow`: product analysis -> creator logic -> board -> image/audio/video
  handoffs -> montage -> QA.
- Future workflow skills should follow the same rule: coordinate public skills,
  write checkpoints, and stop before provider submission.

### Execution

Execution skills run or prepare normalized provider-facing work. They must not
invent creative strategy.

- `image-batch-runner`: executes normalized image requests.
- `voice-batch-runner`: executes normalized voice or audio requests.
- `seedance-submitter`: validates, submits, and polls Seedance video requests.
- `video-batch-runner`: executes normalized video render requests.
- `creative-qa`: reviews generated assets and records verdicts.

## Three-Layer Boundary

| Layer | Owns | Must not do |
| --- | --- | --- |
| Controller | input recognition, task class, reference/model rule, handoff | submit jobs |
| Architect | provider-agnostic scene/request structure | call providers |
| Runner | validate and execute normalized requests | make creative strategy decisions |

Controllers include `image-generation`, `video-generation`, and
`audio-generation`. `video-request-architect` is the current video architect.
Runners include `image-batch-runner`, `voice-batch-runner`,
`seedance-submitter`, and `video-batch-runner`.

## Reference Policy

Use [`reference-registry.md`](reference-registry.md) as the public media
reference registry and matrix. Every generation handoff should say which
references are `binding`, `inspiration-only`, or `excluded`.
