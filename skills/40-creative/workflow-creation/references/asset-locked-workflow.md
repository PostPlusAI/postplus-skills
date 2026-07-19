# Asset-Locked Workflow Reference

Use this reference only when the workflow needs script-first planning, locked creator/product assets, per-clip scene references, or image nodes before the generation video nodes.

## Pattern

Preferred graph on the workflow canvas:

```text
creator identity image node
  -> per-clip scene image node
      -> per-clip generation video node
          -> assembly node (ordered clip slots)
```

Use this when:

- creator identity must stay consistent across clips
- user mentions 人物图, 产品图, reference image, or per-clip references
- product placement or stylized animation needs stable still references

## Asset Rules

Bind passive reference material as labeled workflow assets and reference them from prompts by `<<<label>>>`:

- `creator_identity`: if the user provides an image, bind it. If not, add an identity image node when the brief gives enough persona/style information. Ask only when identity details affect the concept.
- `product_reference`: if the product appears and no product image is provided, ask by default. Generate a product image only when the user explicitly allows product design.
- `voice_reference`: if absent, keep the generation node's audio generation on; ask only when a fixed voice is required.
- `style_reference`: infer from the brief when obvious.

Do not bind or mention product references in clips where the product should not appear.

## Clip Plan

Lock the script first, then plan clips. Each clip needs:

- duration inside the generation capability's supported range (typically `4-15` seconds)
- whether the product appears
- a scene image prompt when a per-clip still reference is needed
- the generation video prompt

## Prompt Split

Scene image prompt:

- locks still composition, identity, setting, product placement, frame role, and hard visual boundaries
- should not include video timing or spoken dialogue unless needed as visual context

Video prompt:

- binds the connected scene image as the strict reference for identity, setting, lighting, framing, and physical setup
- binds product reference only if product appears
- includes cuts, VO/on-camera lines, audio rules, and visual constraints; duration/aspect/resolution/audio stay in node config

## Build

Build the graph through `workflow_author` propose operations, in this order:

1. `add_node` for the identity image node and any per-clip scene image nodes, with their prompts in config.
2. `add_node` for each generation video node with its prompt and duration / aspect ratio / resolution / audio knobs in config.
3. `add_node` for the assembly node when a single assembled video is wanted.
4. `connect_nodes` from identity image to scene images, scene images to their generation video nodes, and every generation video node into the assembly node's ordered clip slots.

Fix any validation errors the propose result reports, then hand the proposal to the human `save_workflow_version` step.
