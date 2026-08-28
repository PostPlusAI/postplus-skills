# Reddit Shared Contract

Use public Reddit evidence only. PostPlus owns execution, credit guards, and
async polling.

## Routes

| Need | Route | Flags |
| --- | --- | --- |
| Keyword/search URL/feed discovery | `reddit-search` | repeat `--query` or `--url`, plus sort/time-range/limit |
| Selected thread comments | `reddit-post-comments` | repeat `--url`, plus limit |
| Deep subreddit pass | `reddit-subreddit-posts` | repeat `--subreddit`, optional `--posted-after`, plus limit |
| Named public profile | `reddit-user-activity` | repeat `--handle`, post-limit, comment-limit |

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

Hard command, auth, network, contract, unavailable, or privacy errors stop the
route. Resume a checkpoint with `postplus research run --resume-from
result.json`; never resubmit. For a successful but sparse/noisy result, apply
the shared bounded recovery rule once, changing one semantic axis at a time and
remaining inside the approved PostPlus credit scope.

## Evidence

Preserve raw records, source URLs, record type, creation time, and parent-child
comment relationships. Separate observation from inference. Never treat a
bounded sample as an exhaustive Reddit index, infer real-world identity, recover
deleted/private data, or automate outreach.
