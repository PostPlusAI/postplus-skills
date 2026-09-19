---
name: reddit-search
description: Research public Reddit posts, comments, communities, and explicitly requested profiles for pain points, product opinions, and discussion evidence.
metadata:
  postplus:
    familyId: reddit
    familyName: Reddit
---

# Reddit Search

Use this skill for bounded public Reddit research.

## Experience Rules

1. Speak in the user's business language, not collection terminology.
2. Ask at most one question, and only when it changes the route or credit bound.
3. Start with the smallest useful sample and expand only after review.
4. Keep implementation, delivery, and network controls out of the conversation.
5. Fail fast on hard command, contract, auth, or private-surface failures. When
   a supported run completes with empty, sparse, noisy, or off-topic evidence,
   apply the quality rules below before concluding
   that the evidence is exhausted.

## Route Index

Read only the matching route reference before execution. Read result-shape
details only when transforming completed records; they are not a preflight.

| User asks for | Route references | Default first pass |
| --- | --- | --- |
| Keyword posts, communities, or a Reddit search URL | `references/search.md` | 20 posts or 10 communities |
| Keyword comment evidence | `references/search.md`; read `references/post-comments.md` only after selecting threads | 20 discovery posts, then up to 3 relevant threads |
| One supplied post URL's comments | `references/post-comments.md` | 1 post and up to 50 comments |
| A guided pain-point or product-opinion deep-dive | `references/search.md`; read `references/post-comments.md` only after selecting threads | 20 discovery posts, then 3 suggested threads |
| A subreddit search, feed, metadata, or deep collection | `references/community.md` | 20 feed posts; deep scope is bounded separately |
| An explicitly named public Reddit profile and its activity | `references/profile.md` | 20 posts and 20 comments |
| Result transformation needs fields beyond the summary below | `references/result-shapes.md` | Preserve the raw result file |

## First Question

Do not ask when the user supplied a keyword, URL, subreddit, or profile and a
safe default applies. Otherwise ask only the highest-information question:

| Missing decision | Ask |
| --- | --- |
| No research target | `What Reddit topic, URL, subreddit, or public profile should I research?` |
| A deep subreddit request has no bound | `What date range or maximum post count should bound the deep collection?` |
| Multiple expensive directions compete | `Which one should I run first: discovery, a thread deep-dive, a subreddit, or a public profile?` |

Never ask for credentials, schema fields, implementation
choice, delivery settings, or retry strategy.

## Run Protocol

1. Select one route and apply its references.
2. Run the narrowest semantic route that answers the first pass.
3. Keep the JSON result under `.postplus/` as durable evidence.
4. Inspect record types and relevance. If the evidence is not useful, apply the
   quality rules below without repeating an
   identical request or exceeding the approved PostPlus credit bound.
5. Keep the complete raw records in the result file; normalize only the
   user-facing evidence; read `references/result-shapes.md` only if more field
   interpretation is needed.
6. Report scope, counts by result type, representative evidence, limits, and
   one useful next action. Do not imply a bounded pass is exhaustive.

Multiple keywords are separate, attributable requests. They may run in
parallel, but their result sets remain separate until presentation.

## Public Command Boundary

- Readiness: `postplus doctor --skill reddit-search`.
- Inspect route flags only when needed with `postplus research run <route>
  --help`.
- Select the route:
  - `reddit-search` for keyword discovery, public search URLs, community search,
    and ordinary subreddit feeds;
  - `reddit-post-comments` for one or more selected post threads;
  - `reddit-subreddit-posts` for bounded deep subreddit collection;
  - `reddit-user-activity` for an explicitly named public profile.
- Run `postplus research run <route> --<query/url/subreddit/handle flags>
  --limit <n> --wait --output <result.json>`.
- Use only the semantic flags shown by the selected route.
- If a run returns a saved async checkpoint, resume it with
  `postplus research run --resume-from <result.json>` rather than starting
  a duplicate run.
- If a quote-confirmation challenge appears, show its scope and PostPlus credits. Only
  after the user confirms, run
  `postplus quote confirm --json --challenge-file <challenge.json>` and retry
  with the returned token.


## Scope Boundary

Supported: public keyword discovery, public search URLs, public post threads,
public subreddit content and metadata, and explicitly requested public profile
activity.

Excluded: login or account access, posting or messaging, private/deleted
content recovery, real-identity inference, private-data enrichment, automated
sentiment analysis, media download, external delivery, and network tuning.

## Command Selection

| Need | Route | Flags |
| --- | --- | --- |
| Keyword/search URL/feed discovery | `reddit-search` | repeat `--query` or `--url`, plus sort/time-range/limit |
| Selected thread comments | `reddit-post-comments` | repeat `--url`, plus limit |
| Deep subreddit pass | `reddit-subreddit-posts` | repeat `--subreddit`, optional `--posted-after`, plus limit |
| Named public profile | `reddit-user-activity` | repeat `--handle`, post-limit, comment-limit |

Only if platform scope or evidence interpretation remains unclear, consult
[platform contract](references/shared-contract.md); it is not a preflight.

## Evidence Quality

1. Classify records before drawing conclusions: discovery posts identify threads; comment claims require actual comments.
2. For keyword comment research, discover posts first, then inspect up to three relevant threads; change a poor discovery query before expanding.
3. Allow at most two changed follow-up passes after successful but insufficient results, within approved scope and budget; do not repeat an identical request or hide a failed/pending operation.
4. Stop when sufficient, at the bound, or when another pass would not help. Report useful evidence and uncertainty; preserve raw results and source links.

Use dataType + id for deduplication; preserve comment parent IDs and depth. Missing values are unknown, not zero.
Full machine fields belong to `postplus research schema --route <route> --json`;
consult it only when required for processing, not before every request.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research run reddit-search \
  --wait \
  --output ./result.json
```

Follow the CLI's structured result and reported next action; do not infer recovery from free-text messages.
Wait for explicit user approval when requested; an action does not authorize spending, publishing, or overwriting.
Resume the same operation through its returned checkpoint or action; never resubmit uncertain work, repeat exhausted recovery, or switch providers to bypass failure.
<!-- END GENERATED EXECUTION EXAMPLE -->
