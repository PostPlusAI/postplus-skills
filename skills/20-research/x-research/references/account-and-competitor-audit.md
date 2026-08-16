# X Account And Competitor Audit

Use for known brand, competitor, creator, expert, or partner accounts.

Apply `shared-contract.md` for scope, keys, bounds, and evidence rules.

## Run

1. Normalize handles or public profile URLs.
2. Collect `x-profiles` with one handle per request for up to `15` known accounts.
3. Add one `x-posts` query per account only when voice, cadence, topics, hooks,
   or recent content are part of the decision.
4. Keep profile snapshots and post samples separate.

If the user gives only a brand name, use `x-user-search` for recall and ask for
confirmation when multiple plausible accounts remain.

## Evidence

- Profile rows support identity, bio, public counts, verification, links, and availability.
- Post evidence is required for content strategy, voice, cadence, and visible engagement.
- A current follower count is not follower growth or audience quality.
- Protected, deleted, suspended, or unavailable accounts stop at availability status.

## Output

Return the decision, accounts, profile comparison, recent-post evidence when
collected, strongest differences, gaps, and the next collection or strategy action.
