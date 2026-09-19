---
name: image-generation
description: Plan image creation or edits from prompts, products, or references. Resolve task type, model, and reference rules before handing ready requests to image-batch-runner.
metadata:
  postplus:
    familyId: routing-contracts
    familyName: Routing & Contracts
---

# Image Generation

## Use When
- The desired final asset is an image or image batch.
- The request may include text prompts, uploaded images, previous outputs,
  product URLs, research handoffs, product images, persona images, banners,
  thumbnails, storyboard panels, or batch variants.
- The next decision is task class, model/reference policy, and runner handoff.

## Do Not Use When
- The final asset is video, audio, subtitles, transcripts, or an edit plan.
- The image request is already normalized and ready to execute. Use
  `image-batch-runner`.
- The user needs hook or benchmark decoding first. Use `reference-decode`.

## Core Boundary
This is the image generation controller. It does not submit jobs.

It must:

1. identify the input type,
2. classify the image task,
3. select model and reference rules,
4. create the handoff for `image-batch-runner`.

## Task Classes

| Task class | Typical input | Handoff |
| --- | --- | --- |
| `text_to_image` | prompt only | write normalized image brief for `image-batch-runner` |
| `image_edit` | uploaded image plus change request | bind edit image and preserve/alter rules |
| `reference_image` | benchmark frame or style board | state its intended influence in the runner handoff |
| `product_image` | product photo, URL, or product facts | bind product identity and forbid invented claims |
| `banner_thumbnail` | offer, hook, platform | require aspect ratio and text/UI policy |
| `storyboard_image` | panel plan or board spec | hand storyboard panels to `image-batch-runner` |
| `batch_variant` | many variants or personas | preserve shared rules and vary only declared fields |

## Model And Reference Rules
- Text-only drafts may use a text-to-image endpoint.
- Edits require a bound source image and an edit-capable endpoint.
- Persona, product, and brand identity are `binding` references unless the user
  explicitly marks them inspiration-only.
- Benchmark clips, mood boards, and competitor references are inspiration-only
  unless the contract says otherwise.
- Excluded references must not enter the runner request.

## Routing Table

| If not image-generation | Send to |
| --- | --- |
| Needs media understanding first | `media-analysis` |
| Needs reference meaning decoded | `reference-decode` |
| Needs storyboard panels | Prepare the panel plan here before `image-batch-runner` |
| Needs execution with normalized request | `image-batch-runner` |
| Final output is video | `video-batch-runner` |
| Final output is audio | `audio-generation` |

## Output Shape
Return:

- `taskClass`
- `inputType`
- `modelRule`
- `referencePolicy`
- `requiredRunnerInputs`
- `handoffSkill`
- `mustNotDo`

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- Do not let `image-batch-runner` make creative classification decisions.


## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.

- This public skill is instruction-driven. Produce the controller handoff
  artifact directly from the available evidence.
- Do not call private provider/runtime paths or unpublished local tools.
- If the CLI returns a quote-confirmation challenge, obtain user approval for its scope and cost before running `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
