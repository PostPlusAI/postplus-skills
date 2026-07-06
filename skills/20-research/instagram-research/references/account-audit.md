# Instagram Account Audit

Use when the user gives known Instagram accounts and wants account health,
competitor comparison, known creator fit, or a post shortlist for later comment
or outreach work.

Apply `shared-contract.md` for public surface, collection key semantics, bounds,
evidence labeling, and output discipline.

## User Jobs

- Diagnose brand account health, positioning, bio clarity, links, and public
  availability.
- Compare competitors by profile positioning and recent public content.
- Judge whether a known creator or partner account fits a collaboration.
- Build a post shortlist for comment analysis, content benchmark, or outreach.
- Find account-level risks, weak signals, and missing public evidence.

## Alignment

Infer whether the user needs brand health, competitor comparison, creator fit,
content strategy, or a downstream shortlist. Ask only when the output would
change.

Use this question when needed:

`Should I focus the audit on brand health, competitor comparison, creator fit, content strategy, or a shortlist for the next step?`

## Inputs

Minimum: one handle/profile URL, a user-confirmed brand account, or `2-15`
competitor handles.

Ask once only when needed:

| Missing / ambiguous | Ask |
| --- | --- |
| Brand name only | `Do you have the official Instagram handle, or should I first run search recall for candidate accounts?` |
| Post/Reel URL used as account seed | `Do you want account audit? If yes, send the profile URL or handle; otherwise I will analyze this content only.` |
| `16+` accounts | `Which first batch should I audit: closest competitors, largest accounts, market/language, or creator-fit?` |

## Run

1. Normalize handles/profile URLs.
2. Collect `instagram-profiles`.
3. Collect `instagram-posts` only when content strategy, cadence, partnership
   fit, or engagement proxy is needed.
4. Keep profile facts and post evidence separate.

## Route-Specific Evidence

- Profile facts can support identity, bio positioning, public counts, links, and
  account availability.
- Post evidence is required before judging hooks, format mix, cadence, content
  quality, or creative strategy.
- Current public follower count is not follower growth.
- Private, deleted, suspended, login-gated, or unavailable accounts stop at
  availability status.

If the user asks for similar creators, route to `creator-discovery.md`. If they
ask for comment language, create a post shortlist and route to
`audience-voice.md`.

## Output Focus

Return the decision supported, accounts, profile snapshot, recent-post evidence
when collected, supported engagement proxy, risks/gaps, and the next action.

## HTML Artifact Focus

Make the HTML easy to audit by account:

- account comparison table with handle, bio position, public counts, links, and
  availability
- recent-post section only when post evidence was collected
- risks and gaps tied to accounts or posts
- next-step shortlist for comment analysis, benchmark, or creator discovery
