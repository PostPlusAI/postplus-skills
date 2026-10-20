# Instagram Campaign Scout

Use for campaign hashtags, launch phrases, branded content, creator leads, and
public campaign watchlists. Apply [shared contract](shared-contract.md).

A campaign name/tag, brand, known post, or product plus campaign goal is enough.
If a generic campaign name could identify unrelated campaigns, ask for the brand;
otherwise derive the phrases and tags rather than requiring the user to supply
search batches.

Use `instagram-hashtags --hashtag <tag>` for a tag, or `--query <phrase>` for
topic content; do not mix modes. Use `instagram-search --query <brand> --kind
user`, then `instagram-profiles --handle <candidate>` to verify unknown brand
accounts. Use `instagram-posts --handle <brand>` for owned posts and `--url
<post-url>` for known content. Tagged-tab coverage is not supported; hashtag
samples must not be labeled the complete tagged tab.

Keep owned posts, hashtag/search samples, third-party content, and visibly
disclosed collaborations distinct. A brand mention is not proof of sponsorship;
a hashtag sample is not full campaign spread. Verify selected authors with
`instagram-profiles --handle <author>` before recommending them as creator
leads. Use actual comments for audience reactions.

Expand grounded phrases, tags, brands, and authors when completed results are
sparse/noisy. Keep scope and changed searches attributable; do not fabricate a
trend, reach, or complete campaign graph. Deliver the standard report with
source-linked patterns, authors, useful watchlist terms, coverage gaps, and cost.
A watchlist document is not an automatically scheduled monitor. End with one
concrete next action and its corresponding PostPlus skill.
