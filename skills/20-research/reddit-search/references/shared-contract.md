# Reddit Shared Contract

Use public Reddit evidence only. PostPlus owns execution, credit guards, and
async polling.

## Routes

Route names and first-pass bounds are in this skill’s SKILL.md.

Run `postplus research run <route> --help` when needed, then run with `--wait
--output <result.json>`.

## Bounds

- Discovery: 20 posts. A supplied search URL or feed URL may use `--url`.
- Thread: one URL and up to 50 comments; at most three selected threads in a
  guided deep-dive.
- Deep subreddit: ask for a bound; default to 100 posts only when delegated.
- Public profile: 20 posts and 20 comments.
- Multiple terms/entities remain separately attributable.

## Failure And Recovery

Follow the CLI action for execution failures; successful but insufficient evidence follows the quality limits in this skill’s SKILL.md.
Resume a pending checkpoint with `postplus research run --resume-from result.json`; never resubmit work that may have started. Privacy and unavailable-surface limits remain stops.

## Evidence

Preserve raw records, source URLs, record type, creation time, and parent-child
comment relationships. Separate observation from inference. Never treat a
bounded sample as an exhaustive Reddit index, infer real-world identity, recover
deleted/private data, or automate outreach.
