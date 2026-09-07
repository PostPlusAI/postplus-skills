---
name: reddit-search
description: Research public Reddit posts, comments, communities, post threads, and user profiles with bounded collection. Use for audience voice, pain points, product opinions, subreddit discovery or feeds, comment deep-dives, and explicitly requested public profile activity.
metadata:
  postplus:
    familyId: reddit
    familyName: Reddit
---

# Reddit Search

Use this skill for bounded public Reddit research. Apply the shared rulebook
and user-guidance rules from `postplus-shared`.
When a supported command completes but evidence is empty, sparse, noisy,
off-topic, or the wrong record type, apply the `postplus-shared` reference
`research-quality-recovery.md`; hard execution errors still fail fast.

## Experience Rules

1. Speak in the user's business language, not collection terminology.
2. Ask at most one question, and only when it changes the route or credit bound.
3. Start with the smallest useful sample and expand only after review.
4. Keep implementation, delivery, and network controls out of the conversation.
5. Fail fast on hard command, contract, auth, or private-surface failures. When
   a supported run completes with empty, sparse, noisy, or off-topic evidence,
   apply the shared bounded research-quality recovery rule before concluding
   that the evidence is exhausted.

## Route Index

Read `references/shared-contract.md` for every route, then the route reference
and `references/result-shapes.md`. All references are direct from this file.

| User asks for | Route references | Default first pass |
| --- | --- | --- |
| Keyword posts, communities, or a Reddit search URL | `references/search.md` | 20 posts or 10 communities |
| Keyword comment evidence | `references/search.md`, then `references/post-comments.md` | 20 discovery posts, then up to 3 relevant threads |
| One supplied post URL's comments | `references/post-comments.md` | 1 post and up to 50 comments |
| A guided pain-point or product-opinion deep-dive | `references/search.md`, then `references/post-comments.md` | 20 discovery posts, then 3 suggested threads |
| A subreddit search, feed, metadata, or deep collection | `references/community.md` | 20 feed posts; deep scope is bounded separately |
| An explicitly named public Reddit profile and its activity | `references/profile.md` | 20 posts and 20 comments |
| Normalizing, deduplicating, or presenting any result | `references/result-shapes.md` | Preserve the raw result file |

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
   recovery flow in `references/shared-contract.md` without repeating an
   identical request or exceeding the approved PostPlus credit bound.
5. Keep the complete raw records in the result file; normalize only the
   user-facing evidence according to `references/result-shapes.md`.
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
- If an owned CLI command still fails after any bounded recovery allowed by the executing PostPlus skill, report the exact error and stop. Do not use
  unpublished tools, payload rewrites, or another service as a fallback.

## Scope Boundary

Supported: public keyword discovery, public search URLs, public post threads,
public subreddit content and metadata, and explicitly requested public profile
activity.

Excluded: login or account access, posting or messaging, private/deleted
content recovery, real-identity inference, private-data enrichment, automated
sentiment analysis, media download, external delivery, and network tuning.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research run reddit-search \
  --wait \
  --output ./result.json
```

**Bounded recovery:** Current PostPlus CLIs handle a compatible update and retry the command once when no agent-session restart is required. If an older CLI only reports that an update is required, run `postplus update` and retry once under the same condition. For a missing or invalid CLI session, run `postplus auth login` yourself; it opens the browser by default. Immediately share its exact URL as a clickable link for the user to **Connect**, then retry the original command once only after the CLI confirms success. Never ask the user to run the command or enter/compare a code, approve the connection for them, or automatically restart a cancelled/expired login. For a local usage rejection before remote work starts, use that command's `--help` to make one unambiguous correction from existing user input and retry once.

If PostPlus returns `postplus_cli_balance_required` with an `open_url` user action, give the user its exact label and URL and stop for account action. Do not invent a checkout link, claim whether provider work or charging occurred, or blindly resubmit after payment; continue from the command's documented status or checkpoint once the user confirms credits are available.

Otherwise stop and report the exact error. Never expose login polling secrets, retry after remote work may have started, change user intent, bypass approval, switch providers, rewrite payloads, or make a second recovery attempt. After success, briefly say that PostPlus updated, using only the official update details PostPlus reported.
<!-- END GENERATED EXECUTION EXAMPLE -->
