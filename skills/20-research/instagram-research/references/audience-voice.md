# Instagram Audience Voice

Use for real comment pain points, objections, questions, praise, comparison
language, FAQ, and copy insight. Apply [shared contract](shared-contract.md).

## Select sources and collect

Prefer supplied post/video URLs, an existing relevant shortlist, or a supplied
comment dataset. Otherwise build a relevant content set from the user's product,
competitor, account, problem, or hashtag. Do not ask for URLs if a usable research
direction already exists.

Content collection: `instagram-posts --handle <account>` or `--url <post-url>`;
for topic discovery use `instagram-hashtags --query <phrase>` / `--hashtag <tag>`
and verify account identity with `instagram-search` then `instagram-profiles`.

Choose sources spanning the relevant products, use cases, and viewpoints;
3–8 sources can be a starting point, not a fixed cap. Inspect returned dates
when a time window matters. Then collect comments:

```bash
postplus research run instagram-comments --url "<selected-content-url>" --limit 100 --wait --output comments.json
```

Parallelize only independent known source URLs; save outputs separately.
Use `--include-replies` when contextual replies are needed; check route help
for the current limit semantics before combining many sources.
Continue sources when useful grounded coverage gaps remain. Empty, disabled,
unavailable, spam-heavy, or repetitive comments are gaps, not invented themes.

## Interpret and deliver

Each theme needs actual comment evidence, source content, and enough context to
review it. Distinguish observation from inference and questions from proven
purchase behavior. Captions, snippets, and likes are not audience voice. Counts
refer only to collected comments; do not label samples platform-wide sentiment.

Include theme counts, representative actual phrases, source IDs/URLs, research
scope, low-signal gaps, and reported cost in the fixed report and analysis.
When the original goal is a brief/copy/FAQ, continue through the appropriate
skill using these sources; otherwise end with one concrete next action and its
PostPlus skill. Reddit long-form validation is a targeted downstream option,
not an automatic step for every search.
