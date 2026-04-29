# Instagram Candidate Mapping

Use this file to map Instagram normalized datasets into the shared candidate schema.

Read with:

- `skills/20-research/instagram-references/normalized-schema.md`
- `skills/10-routing/creator-discovery-router/references/candidate-schema.md`

## Typical Inputs

- normalized profile dataset
- optional normalized posts or reels dataset
- optional follower snapshot dataset

## Core Mapping

### Profile -> Candidate

| Instagram field | Candidate field | Notes |
|---|---|---|
| `platform` | `platform` | fixed as `instagram` |
| `username` | `username` | direct |
| `fullName` | `displayName` | direct |
| `profileUrl` | `profileUrl` | direct |
| `followersCount` | `followersCount` | direct |
| derived `creatorType` | `creatorType` | classify from biography/category/posts |
| route metadata | `route` | `handle-first`, `content-first`, etc. |
| derived topical score | `topicFit` | from biography + post captions + hashtags |
| derived audience score | `audienceFit` | from language, repeated framing, post topics |
| `website` | `contactSignals.website` | direct |
| `website` | `contactSignals.bioLink` | can mirror if no dedicated bio-link split |
| extracted email from `biography` | `contactSignals.email` | only if public and explicit |

## Creator Type Heuristics

Suggested defaults:

- `individual_creator`
  - first-person biography
  - creator-style posting cadence
  - personal face or point of view across posts
- `brand_product_account`
  - product name as identity
  - strong app/store CTA
  - business-style category signals
- `educator_consultant`
  - coach / mentor / consultant / educator signals
  - teaching or service-led language
- `aggregator`
  - mostly reposting, compiling, or generic recommendation format

## Topic Fit Heuristics

Use signals from:

- biography
- recent post captions
- hashtags
- repeated content pillars

For example, for an AI tools search:

- positive: `ai`, `tools`, `workflow`, `productivity`, `notes`, `study`
- negative: broad promo, generic meme, unrelated lifestyle-only signals

## Audience Fit Heuristics

Use:

- explicit audience language:
  - `students`
  - `founders`
  - `creators`
  - `marketers`
- education or campus framing
- language and geography cues
- repeated use-case framing in captions

## Example

```json
{
  "platform": "instagram",
  "username": "creator_name",
  "displayName": "Creator Name",
  "profileUrl": "https://www.instagram.com/creator_name/",
  "followersCount": 9100,
  "creatorType": "individual_creator",
  "route": "content-first",
  "topicFit": 0.78,
  "audienceFit": 0.69,
  "contactSignals": {
    "email": "hello@example.com",
    "website": "https://example.com",
    "bioLink": "https://example.com",
    "dmOpen": null
  },
  "sourceEvidence": {
    "matchedContentCount": 4,
    "topMatchedThemes": ["study apps", "productivity", "ai tools"],
    "notes": []
  },
  "platformMetrics": {
    "postsCount": 182,
    "engagementRateApprox": 0.031
  }
}
```
