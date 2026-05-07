# Creator Outreach Routing

Use the platform skill family first, then convert the outputs into outreach leads.

Do not assume one default discovery path. Pick the route that matches the job.

## Discovery Route Selection

Choose among:

- official pool route
- keyword search route
- competitor backtracking route
- content-first route
- known-handle enrichment route

Use multiple routes when the user wants a stronger candidate pool.

### Official pool route

Use when:

- the user has a TikTok Shop Seller Center or creator marketplace export
- the user has manually assembled a list from platform-native marketplaces

Current handling:

- normalize the export if needed
- enrich handles with the platform profile route
- then send into creator lead building

This route is currently ingest-and-enrich, not UI automation.

### Keyword search route

Use when:

- the user wants broad discovery
- there is no seed list yet

Search using:

- product terms
- use-case terms
- content-expression terms such as `review`, `unboxing`, `haul`, `routine`
- shopping tags when relevant, such as `TikTokMadeMeBuyIt` or `TikTokShop`

Do not rely only on category nouns.

### Competitor backtracking route

Use when:

- the user has known competitors
- the user wants creators with already-proven commercial behavior

Start from:

- competitor brand accounts
- competitor videos
- competitor creator posts
- competitor comment sections

Collect:

- known collaborator handles
- likely KOC or small creator handles from active comments
- usernames worth profile enrichment

### Content-first route

Use when:

- the user wants creators who are demonstrably posting relevant content
- the content angle matters more than account naming

Collect post results first, then author handles, then enrich profiles.

### Known-handle enrichment route

Use when:

- the user already has handles
- the user needs profile stats, contact signals, or outreach prep

## TikTok

Use:

- `skills/20-research/tiktok-research`

Preferred actor routes:

- creator discovery by keyword -> `clockworks/tiktok-user-search-scraper`
- profile enrichment -> `clockworks/tiktok-profile-scraper`
- bulk profile enrichment fallback -> `apidojo/tiktok-profile-scraper`
- content-first creator discovery -> `clockworks/tiktok-scraper`
- TikTok Shop creator scouting -> `lemur/tiktok-shop-creators`

Use for:

- shortlisting creators from topic keywords
- content-first author discovery from video search results
- extracting email and bio-link signals from creator bios

## Instagram

Use:

- `skills/20-research/instagram-account-research`
- `skills/20-research/instagram-tools`

Preferred actor routes:

- account snapshot -> `instagram-profiles`
- mention scouting -> `instagram-search`

Use for:

- creator shortlist building
- competitor mention and tagged-post expansion
- profile enrichment
- website and business-profile signal extraction

## X

Use:

- `skills/20-research/x-research`
- `skills/20-research/x-tools`

Preferred actor routes:

- account snapshot -> `apidojo/twitter-user-scraper`
- follower enrichment -> `kaitoeasyapi/premium-x-follower-scraper-following-data`
- deep fallback -> `epctex/twitter-profile-scraper`

Use for:

- founder / creator / operator scouting
- public email or website signal extraction
- DM-capable account prioritization

## Routing by User Intent

If the user wants:

- "I have an official platform pool or marketplace export" -> ingest export, enrich handles, then lead build
- "Find a creator shortlist for a niche" -> keyword route or content-first route first, then lead build
- "Find people currently posting this kind of content" -> content-first route first, then profile enrichment
- "Mine creators/KOCs from competitors" -> competitor backtracking route first, then profile enrichment
- "I already have handles; enrich contact paths" -> profile actor first, then contact extraction
- "Help me prepare outreach copy" -> build leads first, then draft outreach
- "Find TikTok Shop affiliate creators" -> TikTok Shop route, not generic creator route
