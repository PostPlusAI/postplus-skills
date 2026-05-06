# Reference Contract Template

Use this template when prompts depend on reference media.

```text
Reference set:
- ...

Test purpose:
...

Binding references:
- [ref]: character identity / product identity / voice identity / exact material or shape consistency

Inspiration-only references:
- [ref]: motion rhythm / camera language / framing logic / pacing / spatial feel

Do not copy from inspiration-only references:
- faces
- wardrobe
- creator identity
- exact location
- exact text overlays
- logos
- exact product arrangement if not needed

Intentionally not using yet:
- ...

Why those references are excluded:
- ...
```

## Contract Rule

`Binding references` should describe what must stay consistent in the output.

`Inspiration-only references` should describe structural lessons.

Good:

- `[图1]: main character identity, hair, face, and overall appearance should stay consistent`
- `[图2]: product shape, color, and material should stay consistent`
- `[音频1]: female voice identity and speaking tone should stay consistent`
- `handheld selfie rhythm`
- `payoff-first cadence`
- `board-level wobble and water drift`

Weak:

- `kind of looks like this girl`
- `roughly this product vibe`
- `the hot couple look`
- `the exact summer vibe`

## Default Binding Rule

Unless the user explicitly says otherwise:

- persona images are binding
- product images are binding
- audio references are binding

Do not downgrade those into loose style inspiration by default.

## Exclusion Rule

If the current test is only about hook replication or camera realism, do not automatically include:

- product images
- full style boards
- extra persona references

Those should be added later only if the first pass proves under-constrained.
