# X Creator Discovery

Use for creators, experts, operators, journalists, partners, advocates, or
outreach candidates around a niche, topic, product, account, or campaign.

Apply `shared-contract.md` first.

## Run

| Seed | Recall | Verify |
| --- | --- | --- |
| Topic, hashtag, product, audience, or competitor phrase | `x-posts` | `x-profiles` for selected authors |
| Bio/profession/name keyword | `x-user-search` | `x-profiles` |
| Existing candidate handles | none | `x-profiles` |
| Competitor or known creator | recent `x-posts` authors/interactions only when relevant | `x-profiles` |

Collect one bounded recall lane, extract candidates, then verify `5-15`
profiles through separate one-handle requests. Do not collect follower/following
graphs as a shortcut.

## Evidence

- Search rows and post authors are candidate recall, not verified fit.
- Rank only after profile verification and at least one public fit reason.
- Public counts and verification are context, not influence or conversion proof.
- Geography, language, follower band, and creator type are ranking constraints
  unless directly supported by returned profile evidence.

## Output

Return recall seed, candidate and verified counts, shortlist with handle,
evidence link, fit reason, caution, missing evidence, and next outreach step.
