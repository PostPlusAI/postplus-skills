# Instagram Organic Benchmark

Use when the user wants public Instagram organic content examples, hooks,
formats, captions, content pillars, competitor posts, hashtag samples, or
category/topic creative patterns.

Apply `shared-contract.md` for public surface, collection key semantics, bounds,
evidence labeling, and output discipline.

## User Jobs

- Find public organic examples for a category, topic, account, hashtag, or
  competitor set.
- Understand hooks, formats, captions, content pillars, and reusable patterns.
- Compare competitor organic content strategy.
- Build a creative brief or inspiration board from public examples.
- Shortlist posts for later comment analysis or campaign scouting.

## Alignment

Infer whether the user wants examples, competitor readout, strategy patterns,
or a creative handoff. Ask only when the output would change.

Use this question when needed:

`Should I return a content example table, competitor readout, pattern summary, or creative brief?`

## Inputs

Minimum: account handle/profile URL, post/Reel/carousel URL, hashtag, brand,
product category, competitor name, campaign term, topic, or query phrase.

Ask once only when needed:

| Situation | Ask |
| --- | --- |
| No seed | `Send one Instagram account, post/Reel URL, hashtag, or category phrase to start the benchmark.` |
| Brand without handle | `Do you have the official handle, or should I first run search recall?` |
| Many accounts/hashtags | `Which 3-8 seeds should I compare first?` |
| Paid/organic ambiguity | `Do you want organic Instagram examples, paid ad examples, or a separated paid-vs-organic report?` |
| Reels ambiguity | `Do you want public Reel-like examples, or private Reels analytics such as reach/saves/retention?` |

## Run

| Seed | Key | Rule |
| --- | --- | --- |
| Direct post/Reel/carousel URLs | `instagram-posts` | Analyze supplied content. |
| Account handles | `instagram-posts` | Sample recent public posts. |
| Explicit hashtags | `instagram-hashtags` | Sample hashtag content; enrich selected URLs only if needed. |
| Category/product/topic/competitor name | `instagram-search` | Recall candidates first; verify selected posts/accounts later. |

## Route-Specific Evidence

- Organic conclusions come only from public organic post evidence.
- Search results are candidates until collected as post/profile evidence.
- Hashtag samples do not prove total hashtag volume or related hashtag graph.
- Reel-like URLs may be analyzed as post-level evidence only. Stop if the user
  needs Reels-specific analytics or audio trends.

If the user asks for comment language, create a post shortlist and route to
`audience-voice.md`.

## Output Focus

Return the decision supported, sampled scope, seeds, content table with
URL/account/format/caption signal, hooks, formats, topics, reusable patterns,
weak evidence or missing fields, and suggested next collection or creative
handoff.

## HTML Artifact Focus

Make the HTML easy to browse as an inspiration and evidence board:

- content table with URL, account, format, caption signal, topic, and source type
- filters or grouped sections for hook, format, account, hashtag, and theme
- reusable patterns linked back to supporting posts
- weak evidence and missing fields kept visible near the relevant samples
