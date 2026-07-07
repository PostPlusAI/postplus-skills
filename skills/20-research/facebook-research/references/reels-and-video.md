# Reels And Video

Use for Facebook reels, short-form video examples, play-count clues, video
creative patterns, and media-led organic benchmarking.

## Align

Likely user needs:

- "What reels are competitors posting?"
- "Which video hooks or formats appear?"
- "What can we adapt for short-form creative?"
- "Is this page using video seriously?"

Ask only if no page, profile, or reel URL exists:

`Which public Facebook page, profile, or reel should I inspect first?`

## Run

| Evidence need | Collection key | First pass |
| --- | --- | --- |
| Reels from a page/profile | `facebook-reels` | `1-5` page/profile URLs, small reel bound |
| Page/profile posts for a mixed benchmark | `facebook-posts` | `1-5` page/profile URLs, up to `10` posts each |

For a mixed video and post benchmark, run reels and posts in parallel and keep
them in separate lanes.

## Read Fields

Use the fields present in the result: source and shareable URL, text or caption,
date, public play-count clue, media and playback fields, owner or page name, and
any sound or track field. Do not treat play count as reach or conversion. Do not
invent fields the result does not contain.

## Analyze

Extract:

- opening text or visual promise
- repeated format
- owner or page
- public play-count clue when present
- media availability and sound clue
- source URL

## Output

Create `result.json` and `evidence.html`. Show video cards with media fields when
available, source URL, text, play clue, owner, and date.

Chat format:

- page/profile and reel or post count
- strongest video patterns
- examples worth saving
- missing media or low-signal gaps
- artifact paths

## Stop

Stop for private video, login-only content, rights-violating downloads, backend
video analytics, retention, exact reach, or conversion.
