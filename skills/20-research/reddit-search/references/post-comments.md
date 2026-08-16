# Post Comments

Use this reference for one public post URL or a guided discovery-to-comments
deep-dive.

## Direct post deep-dive

For a supplied post URL, use `reddit-post-comments` with `postUrls` and keep the
first pass to 50 comments:

```json
{
  "postUrls": [{ "url": "https://www.reddit.com/r/example/comments/id/title/" }],
  "maxCommentsPerPost": 50,
  "includeNSFW": false
}
```

Preserve each comment's post context, parent identifier, depth, author, score,
creation time, and whether it came from the original poster. Do not flatten a
thread in a way that loses parent-child relationships.

## Guided two-stage deep-dive

For pain-point, product-opinion, or audience-language research without a post
URL:

1. Discover 20 relevant posts without crawling their comments.
2. Summarize the themes and recommend 3 threads for deeper collection.
3. Choose the 3 using topical relevance, comment richness, and community
   diversity together; do not rank only by score.
4. Keep the chosen URLs and reasons in the evidence record.
5. When the current provider-spend approval covers the next pass, collect the
   selected threads without pausing. Otherwise show the proposed URLs, why each
   adds evidence, and the next-pass bound, then wait for approval.
6. Use one `reddit-post-comments` request containing at most three `postUrls`,
   with at most 50 comments per post.

Keep each thread attributable. Synthesize across threads only after preserving
the source URL and comment hierarchy in the result file.

If the post is deleted, private, unavailable, or returns no comments, report
that evidence gap and stop for that thread. Do not replace it silently.
