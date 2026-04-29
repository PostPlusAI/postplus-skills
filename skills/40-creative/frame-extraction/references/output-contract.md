# Output Contract

Each extraction run should produce a compact, traceable package.

## Minimum metadata per frame

- `sourceVideoPath`
- `sourceId` when available
- `timestampSeconds`
- `timestampLabel`
- `framePath`
- `extractionMode`
- `selectionReason`

## Common package shapes

### 1. Frame folder

Use when:

- the user mainly needs image assets

Expected contents:

- extracted frame files
- manifest JSON or CSV

### 2. Contact sheet

Use when:

- the user wants a quick visual browse

Expected contents:

- one image sheet
- manifest linking tiles to timestamps

### 3. Summary markdown

Use when:

- the frames support a decision task

Expected contents:

- what mode was used
- what was selected
- what patterns were observed
- what the frames are good for downstream

## Selection reason examples

- `clear face visibility`
- `best product close-up`
- `readable UI state`
- `opening hook frame`
- `ending CTA frame`
- `strong environment reference`
- `useful before state`
- `useful after state`

## Suggested downstream links

Where relevant, link the output back to:

- persona packs
- benchmark briefs
- creative QA
- video render planning
