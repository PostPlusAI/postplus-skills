# Research Quality Recovery

Use this rule for public research after a command completes successfully but the
evidence is empty, sparse, noisy, off-topic, or too indirect to support the
user's decision.

## Separate execution failure from evidence quality

| State | Meaning | Action |
| --- | --- | --- |
| Hard execution failure | Invalid contract, auth/readiness failure, typed provider error, network failure, corrupt checkpoint, or incompatible client | Fail fast, report the exact failure, and do not hide it with another route or provider. |
| Evidence-quality gap | The supported command completed, but useful direct evidence is missing or weak | Run the bounded quality-recovery loop below. This is research work, not a program retry. |
| Unsupported/private surface | The requested fact requires private data, login, hidden analytics, or an unreleased capability | Stop and name the unsupported boundary. |

## Evidence acceptance

Before treating a pass as useful, inspect the records rather than only the exit
code or item count. A useful pass has:

- at least one record of the route's intended type;
- enough text, identity, URL, date, or public metric fields to inspect it;
- at least one direct or relevant item for the user's question; and
- source attribution that survives normalization and synthesis.

Adjacent evidence may suggest the next query, but it cannot be the sole basis of
the main conclusion. Empty or irrelevant output is not success merely because a
provider reported `SUCCEEDED`.

## Bounded quality-recovery loop

The first pass includes the initial collection plus at most two recovery passes:

1. Inspect the actual records and state the quality gap: empty, sparse, noisy,
   off-topic, wrong record type, stale, or too indirect.
2. Form one concrete explanation for the gap.
3. Change exactly one declared search axis:
   - query: shorten, use native audience wording, add a synonym, alias, problem,
     offer, or product term;
   - entity: move from a category to verified brands, products, domains, pages,
     handles, communities, or posts;
   - route: use discovery to find inspectable objects, then collect the dependent
     evidence from those objects;
   - scope: adjust one community, geography, language, sort, or time window; or
   - source: use a different released platform lane only when the user goal is
     genuinely cross-source and provenance remains separate.
4. Run the smallest changed request and keep its result set attributable to the
   exact query, entity, route, and scope.
5. Stop when the evidence acceptance rule passes, or after the second recovery
   pass. If it still fails, report the attempted scopes and the honest evidence
   gap instead of manufacturing an insight.

Never submit the same canonical request twice. Never call an undeclared provider
or rewrite an owned request contract as a recovery technique.

## Cost and approval

An additional provider-backed pass is a new paid request. Run it only when it is
inside the user's already approved total budget and any per-run quote. If it
would exceed either bound, show the smallest proposed follow-up scope and wait
for confirmation. A content-quality loop never expands spending silently.

## Output

Report the initial scope, each changed axis, accepted evidence, discarded noise,
and remaining gaps. Call the outcome `evidence accepted` only when the acceptance
rule passes; otherwise call it `evidence exhausted within the approved bound`.
