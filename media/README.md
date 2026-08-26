# Media Skill View

The public tree keeps category directories for discovery. Runtime ownership is
simpler:

- `generation-router` makes only the first image/video/audio/workflow split.
- Creative and ad-format skills may produce a brief, script, or storyboard.
- `image-batch-runner`, `video-batch-runner`, and `voice-batch-runner` interpret
  the approved context, choose from current PostPlus schema, and execute.
- `creative-qa` judges returned media when QA is requested.

For video, `video-batch-runner` is the single generation entrypoint. It owns
model selection, final per-clip prompts, media-role decisions, local upload,
submit, poll, download, and result handoff across all released video models. A
new model extends capability schema and the same runner; it does not create a
new submitter skill.

Do not insert architecture JSON, prompt-preflight reports, reference-contract
files, or provider-specific submitters between approved creative context and
execution. They duplicate reasoning the agent can perform directly and can be
mistaken for evidence that a Provider request ran.

See [`reference-registry.md`](reference-registry.md) for compact reference-role
guidance. Endpoint fields, media slots, enums, defaults, and billing dimensions
come from `postplus media schema --json`, not this documentation.
