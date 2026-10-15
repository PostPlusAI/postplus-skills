# Media Skill View

The public tree keeps category directories for discovery. Runtime ownership is
simpler:

- Discover the concrete image, audio, video, or workflow skill directly.
- Creative and ad-format skills may produce a brief, script, or storyboard.
- `image-batch-runner` and `video-batch-runner` interpret
  the approved context, choose from current PostPlus schema, and execute.
- Each creative skill checks its own result against the approved brief; use
  `media-analysis` when deeper visual or audio inspection is needed.

For video, `video-batch-runner` is the single generation entrypoint. It owns
model selection, final per-clip prompts, media-role decisions, local upload,
submit, poll, download, and result handoff across the six Seedance 2.5 generation modes.

Do not insert architecture JSON, prompt-preflight reports, reference-contract
files, or service-specific submitters between approved creative context and
execution. They duplicate reasoning the agent can perform directly and can be
mistaken for evidence that a hosted run occurred.

See [`reference-registry.md`](reference-registry.md) for compact reference-role
guidance. Endpoint fields, media roles, enums, and defaults come from
`postplus media schema --json`, not this documentation.
