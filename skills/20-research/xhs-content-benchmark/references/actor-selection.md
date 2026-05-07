# Actor Selection

Use the narrowest actor that matches the requested surface.

## 1. Account benchmark

Use when the user provides:

- `profileUrls`
- `profileIds`

Default actor:

- `easyapi/rednote-xiaohongshu-user-posts-scraper`

Why it is the default:

- returned real post rows on the public skill surface
- returned stable note URLs and note ids
- returned enough benchmark fields for first-version ranking and analysis

Observed useful fields:

- `postData.postUrl`
- `postData.noteId`
- `postData.displayTitle`
- `postData.type`
- `postData.interactInfo.likedCount`
- `postData.user.*`
- `postData.cover.*`

## 2. Keyword benchmark

Use when the user explicitly asks for:

- keywords
- themes
- topics

Experimental actor:

- `easyapi/rednote-xiaohongshu-search-scraper`

Observed current constraints:

- rejects low `maxItems`
- can return an empty dataset even when the request itself is valid

Operational rule:

- do not use this as the default first path
- do not hide empty results behind another actor

## Rejected as defaults

Do not use these as the default route for this skill:

- `easyapi/all-in-one-rednote-xiaohongshu-scraper`
  - current search-mode validation returned zero items on the public skill surface
- `easyapi/rednote-xiaohongshu-profile-scraper`
  - current validation returned empty `profileData`
- rented actors that are not already enabled on the public skill surface

## Design rule

This skill should not optimize for actor breadth.
It should optimize for:

1. real output on the public skill surface
2. stable note URL recovery
3. enough post metadata for ranking and synthesis
