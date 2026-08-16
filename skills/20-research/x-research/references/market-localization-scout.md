# X Market Localization Scout

Use for language, region, market, cross-border, local-angle, or localized
creator/content comparisons.

Apply `shared-contract.md` first.

## Run

1. Define `2-4` explicit market or language lanes.
2. Build one X search query per lane using language, location terms, local
   vocabulary, accounts, or hashtags that the user accepts.
3. Collect `10-20` posts per lane and keep the lane label on every evidence set.
4. Verify selected local accounts with `x-profiles` only after recall.

Do not merge markets into one unlabeled query or infer user location from weak
text alone.

## Evidence

- Language and local terms support observable phrasing and content-angle differences.
- Search location syntax and profile location are imperfect public signals.
- A bounded lane does not represent a whole country, language community, or market.
- Report sparse, mixed-language, or location-ambiguous output as a gap.

## Output

Return lane definitions, seeds, counts, local phrases/topics/formats, verified
accounts when used, cross-market contrasts, confidence limits, and next test.
