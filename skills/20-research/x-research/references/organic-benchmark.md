# X Organic Benchmark

Use for public posts, hooks, formats, topics, competitors, hashtags, mentions,
media patterns, or reusable organic content ideas.


## Run

| Seed | Route |
| --- | --- |
| Keyword, topic, hashtag, mention, account, or advanced query | `x-posts` search query |
| Known profile timeline | `x-posts` with one handle or `from:<handle>` query |
| Direct post, article, profile, or list URL | `x-posts` with one URL |
| Known account facts only | `x-profiles` |

Before running, turn the user's goal into a search plan: target topic or named
account, language/market and time window when relevant, and the evidence needed.
Use known handles directly; for keyword discovery choose a specific product,
competitor or audience phrase instead of a broad category. For account content,
use `from:<handle> -filter:retweets`. Do not ask the user to supply CLI parameters.

Run the main query first. Inspect whether the returned text and sources answer
the goal before expanding; change one query constraint if recall misses, rather
than rerunning the same phrase. Keep raw source links and report the actual query.

Run one seed per request and collect `20` posts. Inspect before expanding to
`40`. Use separate labeled requests for up to three independent seeds.

## Evidence

- Posts support text/opening patterns, themes, media presence, source links,
  timestamps, and visible engagement fields when returned.
- Do not infer platform-wide ranking, causal performance, reach, or conversion.
- `Top` surfaces visible engagement examples; it does not prove business impact.
- A profile snapshot provides context, not content-performance proof.

## Output

Return the decision, exact seeds, sample size, post evidence table, recurring
hooks/topics/formats, counterexamples, weak evidence, and next action.
