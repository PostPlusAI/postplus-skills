# X Candidate Mapping

Use this file to map X normalized datasets into the shared candidate schema.

Read with:

- `/references/x-normalized-schema.md`
- `/references/candidate-schema.md`

## Typical Inputs

- normalized profile dataset
- optional tweet dataset
- optional relationship dataset:
  - followers
  - following
  - retweeters

## Core Mapping

### Profile -> Candidate

| X field | Candidate field | Notes |
|---|---|---|
| `platform` | `platform` | fixed as `x` |
| `username` | `username` | direct |
| `displayName` | `displayName` | direct |
| `profileUrl` | `profileUrl` | direct |
| `followersCount` | `followersCount` | direct |
| derived `accountType` | `creatorType` | map to shared creator type taxonomy |
| route metadata | `route` | `content-first`, `graph-first`, etc. |
| derived topic score | `topicFit` | from profile + tweets |
| derived audience score | `audienceFit` | from graph + language + repeated themes |
| `website` | `contactSignals.website` | direct |
| `website` | `contactSignals.bioLink` | mirror if needed |
| extracted email from `description` | `contactSignals.email` | only if explicit |
| `canDm` | `contactSignals.dmOpen` | direct when available |

## Creator Type Mapping

Suggested mapping:

- X `creator` -> `individual_creator`
- X `founder` -> usually `individual_creator`
- X `brand` -> `brand_product_account`
- X `agency` -> `educator_consultant` or separate exclude rule
- X `operator` -> usually `individual_creator`
- X `media` or meme-like account -> `media_meme`

## Topic Fit Heuristics

Use:

- profile description
- recent tweet text
- repeated keywords
- repeated thread themes

For example, for AI workflow discovery:

- positive: `ai`, `workflow`, `productivity`, `research`, `writing`, `tools`
- negative: generic growth spam, unrelated politics, finance-only content

## Audience Fit Heuristics

Use:

- who the account speaks to
- graph signals:
  - who follows whom
  - who amplifies whom
  - overlap with target seed accounts
- repeated audience wording:
  - `founders`
  - `students`
  - `creators`
  - `researchers`

## Graph-First Benefit On X

X is especially strong for graph-based evidence.

When available, use:

- overlap with target audiences
- repeated retweeter patterns
- following/follower proximity to known seeds

These can feed:

- `audienceFit`
- `sourceEvidence.notes`

## Example

```json
{
  "platform": "x",
  "username": "creator_handle",
  "displayName": "Creator Handle",
  "profileUrl": "https://x.com/creator_handle",
  "followersCount": 7300,
  "creatorType": "individual_creator",
  "route": "graph-first",
  "topicFit": 0.74,
  "audienceFit": 0.71,
  "contactSignals": {
    "email": null,
    "website": "https://creator-site.com",
    "bioLink": "https://creator-site.com",
    "dmOpen": true
  },
  "sourceEvidence": {
    "matchedContentCount": 6,
    "topMatchedThemes": ["ai workflow", "research writing"],
    "notes": ["surfaced from audience overlap with seed creators"]
  },
  "platformMetrics": {
    "statusesCount": 2410,
    "engagementRateApprox": 0.022
  }
}
```
