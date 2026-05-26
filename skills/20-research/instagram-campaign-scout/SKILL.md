---
name: instagram-campaign-scout
description: Scout Instagram hashtag opportunities, branded mentions, and campaign spread to monitor public UGC and creator participation.
metadata:
  postplus:
    familyId: instagram
    familyName: Instagram
---

# Instagram Campaign Scout

Use this skill to scout Instagram hashtag opportunities, branded mentions, UGC,
and campaign spread from public content.

Apply shared rulebook and user-guidance rules from `postplus-shared`.

## Task Shapes

Use this skill when the user wants to:

- monitor a branded hashtag,
- find UGC or creator posts tagging a brand,
- inspect campaign spread on Instagram,
- map related hashtags around a topic or campaign.

## Collection Key Routing

Released hosted collection keys:

- `instagram-hashtags`: hashtag post collection.
- `instagram-search`: branded keyword, account, or topic discovery.
- `instagram-posts`: post sampling from known URLs or accounts.

Use installed-safe embedded Instagram support scripts:

## Default Workflow

1. Choose the campaign object: hashtag, target username, or brand keyword.
2. Compile a small hashtag, search, or post request.
3. Wrap hosted collection input under `schemaVersion: 1` + `input`.
4. Collect hashtag, search, or post data.
5. Normalize outputs into comparable datasets.
6. Identify volume signals, related hashtags, top tagged creators, and UGC
   examples.
7. Build a watchlist when repeated monitoring is needed.

## First-Pass Bounds

- 1-3 branded hashtags.
- 1-5 target usernames.
- A small tagged-post sample.
- No full social-listening crawl on the first pass.

## Good Output

Return a branded hashtag opportunity map, top tagged or mentioning posts,
likely creators driving visibility, related hashtag clusters, and a recommended
watchlist of usernames, hashtags, and tagged mentions.

## Failure Modes

- Stop if the request cannot be answered from public Instagram campaign
  surfaces.
- Stop on unsupported keys, missing auth, unavailable hosted service, or stable
  network failure.
- Do not inflate campaign spread from a small public sample; label the sample
  scope.

## Handoff

- Tagged creators needing partnership evaluation -> `instagram-account-research`.
- Hashtag or tagged surfaces becoming a broader creator pool ->
  `instagram-creator-discovery`.
- Tagged posts needing deeper benchmark analysis -> `instagram-content-benchmark`.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill instagram-campaign-scout`.
- Hosted collection: `postplus research collect --skill instagram-campaign-scout --collection-key instagram-hashtags --input <hosted-envelope.json> --output <collection-result.json>`.
- Resume a pending collection: `postplus research collect --run-handle <runHandle> --output <collection-result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
