---
name: instagram-research
description: Research public Instagram accounts, posts, Reels, comments, hashtags, and creators for audits, benchmarks, audience voice, or collaboration shortlists.
metadata:
  postplus:
    familyId: instagram
    familyName: Instagram
---

# Instagram Research

Research public Instagram evidence for the user's marketing decision. A product,
category, problem, competitor, account, or content URL is enough to start.
Use the task reference below and [shared contract](references/shared-contract.md)
for research completion, reporting, and downstream handoffs.

## Reference Index

| User asks for | Apply |
| --- | --- |
| Known account, handle, profile URL, competitor account | `references/account-audit.md` |
| Organic examples, hooks, formats, "what works", competitor content | `references/organic-benchmark.md` |
| Comments, audience voice, objections, FAQ, consumer language | `references/audience-voice.md` |
| Creators, influencers, KOL/KOC, UGC makers, affiliates, contacts | `references/creator-discovery.md` |
| Campaign, hashtag, branded UGC sample, watchlist, competitor campaign | `references/campaign-scout.md` |
| Paid ads, Stories, Shop, LIVE, private data, backend analytics, broad social listening | Stop or ask for a supported public Instagram scope |
| Cross-platform request | Run only the Instagram lane here; hand off other platforms |

## Understand the request

Infer the intended decision and useful deliverable from the request. Read an
unfamiliar product's official page before deriving brands, use cases, problem
phrases, and hashtags. Verify brand/account identity instead of guessing from a
name. Do not ask the user to supply competitor lists or choose search batches.

Ask one focused question only when missing product identity, subject, market,
or a public/private boundary would materially change the work. If the user has
provided a usable product/category/account/URL, start; do not ask for another
seed or an output-format choice. Preserve all platforms the user requested.

Keep explicit requirements, inferred search directions, and unknown conditions
separate. Inferred directions are not hidden exclusion rules. Unsupported
private metrics remain unknown; use the available public evidence only when it
can still answer the requested decision.

## Public Command Boundary

Run the selected route with its declared semantic flags:

```bash
postplus research run <route> --<semantic flags> --limit <n> --wait --output result.json
```

| Evidence need | Route | Inputs |
| --- | --- | --- |
| Profile facts | `instagram-profiles` | repeat `--handle` |
| Account posts or known posts | `instagram-posts` | repeat `--handle` or repeat `--url`, never both |
| Topic or hashtag content | `instagram-hashtags` | repeat `--query` or repeat `--hashtag`, never both; `--kind posts\|reels` |
| Account/tag discovery | `instagram-search` | repeat `--query`; `--kind user\|hashtag\|popular` |
| Actual comments | `instagram-comments` | repeat `--url`; `--include-replies` when needed |
| Public contact signals | `instagram-email-search` | repeat `--handle`, only shortlisted creators |

Use `postplus research run <route> --help` when flags, enums, or bounds are
unclear; inspect `postplus research schema --route <route> --json` only when
processing needs exact result fields. `postplus doctor --skill instagram-research`
is a diagnostic, not a compulsory preflight. Never use private supplier inputs.
Save independent batches separately; run them concurrently only after their
inputs are known. Follow the returned structured action for pending/failed
operations; resume the same operation, not a replacement submission.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research run instagram-comments \
  --url "https://example.com/source" \
  --wait \
  --output ./result.json
```

Follow the CLI's structured result and reported next action; do not infer recovery from free-text messages.
Reuse explicit user approval that already covers the requested scope and maximum cost; otherwise obtain approval before confirming a quote. Never infer spending authorization from a task alone.
Resume the same operation through its returned checkpoint or action; never resubmit uncertain work, repeat exhausted recovery, or switch providers to bypass failure.
<!-- END GENERATED EXECUTION EXAMPLE -->
