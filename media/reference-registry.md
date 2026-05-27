# Media Reference Registry

This registry declares how public media generation workflows use references.
It is documentation for routing and handoff decisions, not runtime metadata and
not public skill membership.

## Reference Classes

| Class | Meaning | Default use |
| --- | --- | --- |
| `binding` | Must preserve identity, source facts, timing, voice, product look, or approved continuity. | Product, persona, approved voice, approved first frame, approved storyboard. |
| `inspiration-only` | May learn structure, pacing, composition, camera grammar, or tone without copying identity. | Benchmark clips, competitor ads, mood boards, creator examples, loose style notes. |
| `excluded` | Must not be passed into the next generation request. | Rejected variants, competitor identity, unsafe examples, references outside the current test scope. |

## Task Registry

| Task | Controller | Reference step | Architect | Runner |
| --- | --- | --- | --- | --- |
| Text-to-image | `image-generation` | optional `reference-contract-builder` | controller handoff | `image-batch-runner` |
| Image edit | `image-generation` | source image is `binding` | controller handoff | `image-batch-runner` |
| Product image | `image-generation` | product image and source facts are `binding` | controller handoff | `image-batch-runner` |
| Storyboard image | `image-generation` | storyboard is `binding`; benchmark is inspiration-only | `storyboard-grid-writer` | `image-batch-runner` |
| Simple video clip | `video-generation` | optional reference contract | `video-request-architect` | `seedance-submitter` or `video-batch-runner` |
| Storyboard video | `video-generation` | storyboard is `binding` | `storyboard-grid-writer`, then `video-request-architect` | `seedance-submitter` or `video-batch-runner` |
| UGC video | `ugc-flow` | product/persona are `binding`; benchmarks are inspiration-only | `storyboard-grid-writer`, then `video-request-architect` | `seedance-submitter` or `video-batch-runner` |
| Podcast or voice-led clip | `audio-generation` then `video-generation` | voice/script policy is `binding` | `video-request-architect` when video follows | `voice-batch-runner`, then video runner |
| Reference video | `video-generation` | `reference-decode` plus `reference-contract-builder` | `video-request-architect` | `seedance-submitter` or `video-batch-runner` |
| TTS | `audio-generation` | script and voice policy are `binding` | controller handoff | `voice-batch-runner` |
| Voice change | `audio-generation` | approved voice reference is `binding` | controller handoff | `voice-batch-runner` |
| Translate dub | `audio-generation` | meaning/timing are `binding`; source voice binding only if approved | controller handoff | `voice-batch-runner` |
| Lip-sync handoff | `audio-generation` then `video-generation` | final audio is `binding` for video timing | `video-request-architect` | `video-batch-runner` |

## Image Reference Matrix

| Reference | Binding | Inspiration-only | Excluded |
| --- | --- | --- | --- |
| Product photo | Preserve product identity, proportions, and claims. | Learn display context only when product is not the subject. | Rejected product angles or outdated SKU. |
| Persona image | Preserve approved persona continuity. | Learn broad creator archetype only. | Copied creator identity or non-approved likeness. |
| Benchmark frame | Bind only if explicitly approved as a first frame. | Learn composition, hook grammar, and camera placement. | Competitor logo, face, wardrobe, exact location. |
| Style board | Bind only approved brand constraints. | Learn palette, lighting, texture, or mood. | Off-scope styles and rejected visual directions. |

## Video Reference Matrix

| Reference | Binding | Inspiration-only | Excluded |
| --- | --- | --- | --- |
| Storyboard | Panel sequence, product timing, and viewer question. | Loose pacing if not approved. | Panels rejected during QA. |
| Reference video | Bind only approved motion or timing windows. | Learn hook rhythm, camera grammar, and beat order. | Exact creator identity, location, logo, wardrobe. |
| First frame | Bind visual start state when image-to-video requires continuity. | Learn opening composition only. | Non-approved first-frame candidates. |
| Script or beat sheet | Spoken lines, duration, and claim boundaries. | Tone notes when script is not final. | Unapproved claims and deprecated beats. |

## Audio Reference Matrix

| Reference | Binding | Inspiration-only | Excluded |
| --- | --- | --- | --- |
| Approved voice reference | Timbre, accent, pacing, and speaker continuity. | Delivery energy only when no clone is approved. | Unlicensed or rejected voice. |
| Source audio for translation | Meaning and timing. | Voice style only with explicit approval. | Source background noise or off-scope speaker identity. |
| Music or SFX | Timing and placement only when approved. | Mood, genre, or energy. | Copyrighted or rejected tracks. |
| Final generated audio | Timing source for lip-sync or talking-head video. | Not applicable. | Draft takes rejected by QA. |

## Boundary Rules

- Controllers classify and hand off. They do not submit jobs.
- Architects build provider-agnostic request structure. They do not call
  providers.
- Runners validate and execute normalized requests. They do not make creative
  judgment.
- If a reference cannot be classified as `binding`, `inspiration-only`, or
  `excluded`, stop before generation.
