# TikTok Creator Discovery

Use for creator/influencer/UGC-maker/affiliate discovery, candidate validation,
or a collaboration shortlist. Apply [shared contract](shared-contract.md).

## Understand and discover

A product, niche, customer, competitor, account, or content URL is sufficient.
Separate discovery clues from conditions used to evaluate creators. Ask about
the product/niche only if none exists; do not make users choose search batches.

Expand product use cases, problem terms, relevant brands, and tags. Keep user
requirements distinct from inferred directions. Do not impose an unstated
follower floor, country, or creator style.

Use `tiktok-videos --query <phrase>` or `--hashtag <tag>` to discover relevant
content. Extract authors, then run `tiktok-profiles --handle <author>` for facts
and `tiktok-videos --handle <author>` for other works. Use `tiktok-users --query
<name>` for name lookup, not proof of creator fit. After selecting a strong
seed video, `tiktok-related-videos --url <video-url>` can expand related content.

Run independent discovery requests concurrently; author enrichment depends on
actual discovered handles. Continue promising directions until the requested
shortlist is supported or the shared stopping condition applies. Do not rank a
whole account from one viral post.

## Validate and deliver

For each recommended creator, retain profile/source IDs, representative content,
fit reasons, explicit criterion judgments, and unknowns. Conditions can be met,
not met, partially evidenced, or unknown; use the report schema's actual enums.
Check follower range from returned snapshots, language from inspected content,
and consistent subject fit from multiple works where available. Neither content
language nor collection location proves audience country. Public data cannot
confirm collaboration budget, availability, conversion, or audience authenticity.

Exclude brand stores/agencies only when required by the user's creator goal;
retain evidence for that classification. Keep rejected/uncertain candidates
inspectable, separate from the recommended set.

Generate the fixed report's creator view with all batches and evidence-linked
analysis. Public contact enrichment is optional after narrowing the shortlist:
the current public surface does not provide hidden contact enrichment.
Do not contact anyone automatically. End with one specific next action and
its corresponding PostPlus skill, within the shared downstream rule.
