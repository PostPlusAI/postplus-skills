# X Audience Voice

Use for public reply language, objections, repeated questions, praise,
comparisons, misconceptions, FAQ, copy phrases, or buyer-language hypotheses.

Apply `shared-contract.md` first.

## Run

1. Use user-supplied public post URLs, or build a bounded `x-posts` shortlist.
2. Select `1-3` threads with relevant replies.
3. Extract each post id and run one `conversation_id:<id>` query per thread.
4. Collect `20` replies per thread; preserve the source thread and query.

Do not treat ordinary keyword posts, quoted posts, captions, or author text as
audience voice unless the user explicitly wants broader discourse analysis.

## Evidence

- Tie each theme to reply text and its source thread.
- Replies represent visible participants in selected threads, not all viewers,
  followers, customers, or X users.
- Separate repeated language from one-off anecdotes and spam.
- Empty, sparse, hostile, bot-like, or off-topic threads are evidence-quality gaps.

## Output

Return source threads, reply count, theme buckets, objections, questions,
representative phrases, dissenting evidence, limits, and copy/FAQ handoff.
