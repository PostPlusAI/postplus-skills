---
name: creator-outreach
description: Build creator lead lists for TikTok, Instagram, and X by turning normalized platform datasets into outreach-ready leads with contact signals, shortlist logic, and draft outreach messages. Use this when the user wants creator discovery, contact extraction, shortlist building, or outreach prep.
metadata:
  postplus:
    familyId: routing-contracts
    familyName: Routing & Contracts
---

# Creator Outreach

Use this skill to turn normalized platform datasets into outreach-ready creator
leads, contact-signal summaries, shortlist logic, and draft outreach messages.

Apply shared rulebook and user-guidance rules from `postplus-shared`.

## Ownership Boundary

This skill owns lead normalization, public contact-signal extraction, scoring,
shortlisting, and draft preparation. Platform data collection belongs to
platform skills such as `tiktok-research`, `instagram-creator-discovery`, or
`instagram-account-research`.

Gmail, CRM, or message sending is a separate delivery step. Default to drafting
and human review, not sending.

## Required Input

- Normalized creator/profile datasets or manually structured creator exports.
- Platform, username or profile URL, source evidence, and fit reasons.
- Public contact fields that are visible in collected platform data.
- A brand or campaign brief before scoring or drafting.

Do not guess email addresses or invent contact channels.

## Discovery Routes

Choose one route before lead building:

- Official pool route: seller-center, creator-marketplace, or user-provided
  export already exists.
- Keyword search route: broad market discovery around product terms, reviews,
  unboxing, routines, commerce tags, or use cases.
- Competitor backtracking route: competitor brands, collab posts, shopping
  posts, or comment sections are the seed.
- Content-first route: find relevant posts first, pull authors, then enrich
  profiles.
- Known-handle enrichment route: the user already has handles and needs
  profile enrichment, contact extraction, or outreach prep.

If the user gives no special constraints, use the lightest route likely to
produce a usable shortlist. Do not stack competitor, comments, official-pool,
and commerce evidence into the first pass unless the request needs it.

## Screening Dimensions

Always consider:

- account type,
- content fit,
- audience fit,
- market and language relevance,
- style fit,
- engagement quality,
- outreach readiness,
- public contact-signal provenance.

Follower count is not the only priority. Head, mid-tier, and small creators or
KOCs can all be valid depending on the campaign.

## Default Workflow

1. Choose the discovery route.
2. Collect platform data through the relevant platform skill when data is not
   already provided.
3. Build a unified lead table:

```bash
  --inputs <normalized-inputs> \
  --output <work-folder>/.postplus/creator-leads.json
```

4. Extract only public contact signals:

```bash
  --input <work-folder>/.postplus/creator-leads.json \
  --output <work-folder>/.postplus/creator-leads-enriched.json
```

5. Score and shortlist when the user wants a ranked subset:

```bash
  --input <work-folder>/.postplus/creator-leads-enriched.json \
  --brief <work-folder>/.postplus/brand-brief.json \
  --platforms tiktok,instagram,x \
  --output <work-folder>/.postplus/creator-leads-scored.json

  --input <work-folder>/.postplus/creator-leads-scored.json \
  --min-score 45 \
  --top 20 \
  --output <work-folder>/.postplus/creator-leads-shortlist.json
```

6. Generate outreach drafts only after a reviewable shortlist and brand brief
   exist.

## User-Facing Blockers

Stop and explain when:

- no normalized platform dataset or structured creator export exists,
- creator identity or source URL is missing,
- public contact signals are absent and the user asked for contactable leads,
- market, audience, or style fit cannot be verified from the available data,
- the user asks this skill to send messages directly,
- the request depends on private fields or hidden backend data.

## Output Expectations

Return shortlist rows, fit scores and reasons, public contact signals with
provenance, missing-evidence notes, outreach-readiness risks, and drafts ready
for human review or a separate delivery tool.

## Handoff

- Need more platform data -> the relevant platform research skill.
- Ready Gmail drafting or sending -> Gmail/manual outreach tooling after human
  approval.
- Need campaign strategy before outreach -> campaign or offer strategy skills.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill creator-outreach`.
- Request schema: `postplus publish schema --json`.
- Hosted publishing capability: `postplus publish capability --request <hosted-capability-request.json> --output <result.json>`.
- Preview and approval boundaries stay explicit; do not execute irreversible publishing without the required approval artifact.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
