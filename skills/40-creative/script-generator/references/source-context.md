# Source Context

`script-generator` should not behave as if each request starts from an empty prompt.

Prefer stable source context when it exists.

## Input Priority

Normalize source context in this order:

1. explicit current task input
2. campaign or project source files
3. benchmark or research artifacts
4. user freeform text

## Shared Source Files

These files are campaign- or project-level source-of-truth assets, not private `script-generator` internals:

- `brand.md`
- `persona.md`
- `product.md`
- `hooks.md`

## How Each File Helps

### `brand.md`

Use for:

- tone boundaries
- forbidden phrases
- positioning
- voice consistency

### `persona.md`

Use for:

- narrator believability
- relationship to the product
- backstory or authority feel
- behavioral constraints

### `product.md`

Use for:

- claims
- mechanism
- objections
- proof basis
- product-role clarity

### `hooks.md`

Use for:

- hook shell reuse
- tested opener memory
- anti-repetition
- angle expansion

Do not automatically treat `hooks.md` as validated performance truth unless the file itself or surrounding context proves that.

## Missing File Rule

Missing source files do not block script generation by default.

They do reduce consistency confidence.

When files are missing, the skill should:

- note what is missing
- say what quality or consistency risk that creates
- continue with a grounded or provisional draft when possible

## Source Context Output

Final outputs should include:

- `brandContext`
- `personaContext`
- `productContext`
- `hookContext`
- `confidenceLevel`

Recommended confidence levels:

- `grounded`
- `partially_grounded`
- `provisional`
