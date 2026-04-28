# Decode Output Shape

Use this output shape before writing any storyboard or provider request.

## Required Fields

```text
Reference type:
Observed source:
Segment type:
Hook essence:
Viewer question:
Opening mechanism:
Must-copy visual grammar:
- ...
- ...
- ...
Forbidden drift:
- ...
- ...
- ...
Identity elements to change:
- ...
- ...
Reference confidence:
Notes for next skill:
```

## Field Rules

### `Hook essence`

One sentence.
Describe the real opening job, not the aesthetics.

Good:

- `finished date payoff appears before setup`
- `viewer is placed inside the POV before the list reveal begins`
- `problem is framed as the reason the demo matters`

Weak:

- `cool summer vibe`
- `great chemistry`
- `beautiful lighting`

### `Viewer question`

One concrete sentence in quotes.
This is the scroll-stopping question.

Examples:

- `"How are they having a whole date out there?"`
- `"What exactly is on that board?"`
- `"Can this really replace the harder setup?"`

### `Must-copy visual grammar`

These are structural anchors.

Write only what the later prompt must preserve, such as:

- first frame already in the payoff
- body plus environment readable together
- food visible early
- off-axis gaze instead of mutual posing
- board-level wobble or handheld drift

### `Forbidden drift`

These are the most common ways the model will ruin the pattern.

Write them as explicit no-go items:

- do not open on trunk or setup
- do not turn this into a couple portrait
- do not let the product dominate frame one
- do not create readable on-screen text

### `Identity elements to change`

Always separate structural imitation from identity copying.

Typical items:

- faces
- wardrobe
- board graphics
- exact location
- creator identity
- exact caption shell

## Proxy Mode for No Reference

If there is no real source, replace `Observed source` with:

```text
Observed source: none; decode derived from brief constraints and chosen pattern family
```

Then keep the rest of the output shape unchanged.

## Print Rule

Always print the decode block before writing the final prompt.
This is a key diagnostic checkpoint.
