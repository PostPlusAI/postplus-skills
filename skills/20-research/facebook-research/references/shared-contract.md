# Facebook Shared Contract

Read this only for platform-specific scope or evidence questions not covered by SKILL.md. Keep research public, bounded, attributable, and
useful to the user's decision. PostPlus owns execution, credit guards, and
polling.

## Routes

Route names and first-pass bounds are in this skill’s SKILL.md.

Run:

```bash
postplus research run <route> --<semantic flags> --wait --output result.json
```

Use `postplus research run <route> --help` only when the flags are unclear.

Private profiles, hidden groups, member lists, Page Insights, account metrics,
targeting, spend, and ROAS are outside this public surface. Say so and stop.

## Human Alignment

Infer whether the user wants diagnosis, comparison, discovery, extraction,
planning, or verification. Ask one question only when it changes the route,
privacy boundary, sample, or deliverable. Do not ask for implementation details.

## Bounds And Recovery

- Start with one route and the smallest useful sample.
- Keep independent sources separately attributable.
- Follow the CLI action for execution failures; successful but insufficient evidence follows the quality limits in this skill’s SKILL.md.
- Resume a pending checkpoint with
  `postplus research run --resume-from result.json`; never resubmit it.

## Evidence

Keep the complete JSON result. Preserve source URLs and observed dates. Separate
observations from inference, deduplicate repeated records, and never turn a
bounded sample into a platform-wide claim. For item-level work, also produce a
compact HTML artifact with scope, count, strongest examples, gaps, and next
action.
