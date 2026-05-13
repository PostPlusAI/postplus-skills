---
name: narrative-design
description: Structure the body and close of a short-form video into a reusable Narrative Brief with explicit arc choice, beat sequence, product integration timing, emotional arc, and CTA design. Use after the hook mechanism and viewer question are locked and before storyboard or prompt writing starts.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Narrative Design

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill after the opening hook mechanism and viewer question are locked and before storyboard or prompt writing begins.

This skill is for:

- choosing the right narrative arc for the body of the video
- making product integration timing and depth explicit
- mapping the emotional beat sequence across the full video
- defining the CTA mechanism and placement
- giving downstream prompt work a clean narrative logic handoff

This skill is not for:

- choosing the hook opening or stop-scroll mechanism (use `hook-design` if available, or `pattern-router`)
- writing the final storyboard grid or prompt
- visual execution or frame-one design (use `visual-hook`)
- pre-generation approval (use `prompt-preflight-qa`)

## Core Rule

The hook creates a viewer question. The narrative must answer that question in a way that makes the product feel like the logical conclusion, not an interruption.

Do not introduce the product before the narrative has deepened the viewer's problem or desire enough to make the product arrival feel earned.

## Method

Use the upstream hook context as the input to narrative design.

The preferred upstream input is a Hook Brief produced by `hook-design`. If `hook-design` has not been run, provide at minimum:

- the viewer question the opening creates
- the hook mechanism in use
- whether the product appears in the opening frame

Narrative design starts where the hook mechanism ends.

## Default Workflow

### 1. Confirm the upstream hook context

If neither a Hook Brief nor a direct hook description exists, ask for the opening mechanism and viewer question before proceeding.

Do not attempt narrative design from a vague brief or taste words alone.

Confirm at minimum:

- viewer question created by the hook
- hook mechanism in use
- whether the product is visible in the opening frame

**Special case: Product/Outcome First hook**

If the hook shows the product or result in frame one, the arc's product timing rules apply differently. The product has already been revealed. The arc now governs not first appearance, but first explanation.

Reframe the product integration rule accordingly:

- `hold until solve` → body builds the problem; product explanation arrives at the solve beat, not product appearance
- `reveal at inversion` → product is visible from frame one, but its non-obvious capability is revealed at the inversion beat
- `show early, explain late` → this becomes the default; the body is entirely about earning belief in what the viewer already saw

In practice: a Product/Outcome First hook changes the body's job from earning the product reveal to earning the viewer's belief in the product they already saw.

**Special case: Negative hook**

If the hook leads with a negative frame ("everyone is doing this wrong," "stop buying X," "don't do this"), the hook has established that the viewer holds a mistaken belief or practice.

Arc compatibility with negative hooks:

- `problemAgitatedSolve`: strongest fit — the hook has named the mistake; the body deepens the consequence and delivers the correction
- `expertExplainer`: strong fit — the hook has established authority; the body explains the correct understanding
- `transformation`: partial fit — reframe the before state as the wrong approach, not an incomplete state
- `surpriseSatisfaction`: usable if the inversion is the proof that the conventional approach is wrong
- `urgencyClose`: avoid — a negative hook builds problem tension that urgencyClose does not resolve before asking for action

Caution: a negative hook carries a stronger implied promise than a positive hook. If beat 2 fails to deliver on the correction, the broken narrative lands harder than it would with a neutral opening.

### 2. Classify the video segment type

Choose one:

- `conversion` — primary goal is purchase or click
- `trust` — primary goal is reducing purchase hesitation
- `awareness` — primary goal is brand or product recognition
- `engagement` — primary goal is shares, saves, or comments

The segment type determines which arc family is appropriate and how aggressive the CTA can be.

### 3. Choose the narrative arc

Use the arc selection shortcuts below to narrow candidates before reading the full arc criteria.

**Shortcut A: by content type**

If the intended content type is known, use this table first:

| Content type | Primary arc | Secondary arc | Avoid |
|---|---|---|---|
| Price shock / Deal | `problemAgitatedSolve` | `urgencyClose` | `transformation` |
| Comment reply | `expertExplainer` | — | `urgencyClose` |
| Product result | `transformation` | `expertExplainer` | `urgencyClose` |
| Lifestyle / aspiration | `transformation` | `surpriseSatisfaction` | `urgencyClose` |
| Visual / emotional | `surpriseSatisfaction` | `transformation` | `expertExplainer` |

Conversion efficiency order (from platform data): price shock > comment reply > product result > lifestyle > visual/emotional. For cold-audience new-account content, start with comment reply or product result — lower production requirement, higher trust return.

**Shortcut B: by segment type**

| Segment type | Best arc match | Note |
|---|---|---|
| `conversion` | `problemAgitatedSolve` | Highest conversion rate; resolves purchase barrier directly |
| `conversion` (warm audience) | `urgencyClose` | Only for retargeted or already-warm audiences |
| `trust` | `expertExplainer` | Authority + clarity are the trust mechanism |
| `trust` | `transformation` | Credible before/after builds considered trust |
| `awareness` | `surpriseSatisfaction` | Highest share rate; spreads brand recognition |
| `awareness` | `expertExplainer` | Knowledge gap creates recall |
| `engagement` | `surpriseSatisfaction` | Inversion triggers comment and share |
| `engagement` | `transformation` | Save-worthy content; high save rate |

Default arc when segment type or content type is unclear: `expertExplainer`. It has the highest completion rate of all arc types, works for any audience temperature, and does not require a specific emotional precondition.

---

Select one primary arc. Do not mix multiple arcs unless timing explicitly supports it.

---

#### 1. `expertExplainer`

Use when:

- the viewer needs to understand something before they can want the product
- authority and clarity are the main trust levers
- the hook created a knowledge gap the body must fill

Structure:

```
Concept → Why it matters → How it works or how to get it
```

Product timing: introduce at the "How" stage, not before.

Beat 4 content: the "how to get it" step — access, purchase path, or the single next action. Do not repeat the concept or the why. This beat bridges understanding to action.

Rewatch potential: medium-high. Information density in beat 2 causes viewers to rewind to catch missed details. Increase rewatch by packing the concept explanation with specific numbers and non-obvious comparisons.

Data: most common arc in viral-tier TikTok content (OpusClip, 13.5M-clip analysis). Highest completion rate of all arc types.

Common failure: front-loading credentials before delivering value.

---

#### 2. `problemAgitatedSolve`

Use when:

- the viewer already lives with the pain
- emotional amplification will increase urgency
- the product is a direct solution, not a lifestyle add-on

Structure:

```
Name the pain → Deepen the consequence → Deliver the solution
```

Product timing: hold product until the solve beat. Agitation must land before the product appears.

Beat 4 content: proof that the solution works — not a claim, a demonstration. Show the product resolving the specific consequence named in the agitation beat. The viewer's internal question is "does it actually work?" Answer it visually, not verbally.

Rewatch potential: medium. The agitation beat can trigger rewatch if the consequence framing is vivid enough to feel personally relevant. Low rewatch if agitation is generic.

Data: highest conversion rate of all arc types in short-form commerce content.

Common failure: moving to the product before the agitation has created real tension.

---

#### 3. `transformation`

Use when:

- the before and after states are visually or emotionally distinct
- the viewer can self-project into the before state
- the change is the main proof of value

Structure:

```
Before state → Turning point or discovery → After state
```

Product timing: the product is the turning point, or the cause of the after state. It should not appear before the before state is established.

Beat 4 content: the after state made credible — not aspirational, specific. The after state must be a concrete, verifiable claim ("$200/month saved," "arrived on time every day") rather than a feeling ("feels great," "changed my life"). Credibility at beat 4 determines whether the viewer saves the video to reconsider later.

Rewatch potential: high. Before/after contrast is a natural rewatch trigger — viewers compare the two states a second time to confirm the gap. Maximize by making the after state visually and specifically different from the before state, not just "better in general."

Data: high save rate. Effective for audiences weighing a purchase decision over time.

Common failure: after state that feels aspirational rather than believable.

---

#### 4. `surpriseSatisfaction`

Use when:

- the first impression of the product is counterintuitive
- the viewer's expectation can be set up and then inverted
- the inversion itself is the proof of value

Structure:

```
Set ordinary expectation → Subvert it with product reality → Deliver satisfying resolution
```

Product timing: the product can appear earlier here because the mechanism depends on the gap between expectation and product reality.

Beat 4 content: the logical resolution of the inversion — explain why the subversion was not magic or luck, but a product property. The viewer's implicit question after the inversion is "wait, how?" Answer it. This beat is what converts share-bait into purchase consideration.

Rewatch potential: highest of all arc types. The inversion moment is the primary rewatch trigger — viewers rewatch to catch what they missed the first time, or to show others. Design the subversion beat to reward a second viewing with a detail not obvious on first watch.

Data: highest share rate of all arc types. Effective when the product has a non-obvious capability.

Common failure: the subversion is visually impressive but logically disconnected from the product claim.

---

#### 5. `urgencyClose`

Use when:

- the viewer already understands the product
- the barrier is inertia, not doubt
- price, availability, or timing is a genuine differentiator

Structure:

```
Scarcity or timing signal → Value compression → Single clear action
```

Product timing: product is assumed known. This arc does not build understanding — it converts it.

Beat 4 content: value compression — one sentence that packs the product's core claim and the scarcity signal together. Do not introduce new information. Compress what the viewer already saw into its most memorable form.

Example: `"[product's defining spec], [key differentiator] — and [scarcity signal, e.g. this price / this configuration] is only available until [date]."`

Rewatch potential: lowest of all arc types. This arc is designed for immediate action, not rewatch. If your goal is algorithm distribution rather than immediate conversion, this arc is the weakest choice.

Data: highest immediate CTR of all arc types. Lowest completion rate. Do not use as a primary arc for cold audiences.

Common failure: false scarcity that damages trust if the viewer has seen the product before.

Note: `urgencyClose` works best as a closing layer added on top of another arc, not as a standalone structure for cold audiences. A full 30–45 second video built only on scarcity → value compression → CTA rarely works unless the audience is already warm.

---

### 4. Map the beat sequence

After choosing the arc, map each beat to a time window.

Use this structure for a 30–45 second video (the viral-tier median is 41 seconds):

```text
0–3s    Hook beats (from upstream hook context — do not redesign here)
3–8s    Beat 1: [arc opening move]
8–16s   Beat 2: [arc middle — problem depth or proof]
16–28s  Beat 3: [product integration]
28–38s  Beat 4: [arc-specific resolution — see arc descriptions above]
38–43s  CTA
```

In beats 1–2, switch the visual every 2–3 seconds. Do not hold a single shot longer than 3 seconds unless the content explicitly rewards the hold.

Adjust proportions for shorter or longer formats. Do not extend the body by repeating beats — cut instead.

**Optional: Rewatch trigger beat**

If the arc and content naturally support it, plant one detail within beat 3 or beat 4 that rewards a second viewing:

- a number that takes a moment to process
- a visual that contains more information than is verbally stated
- a subversion moment the viewer wants to verify

Rewatch rate above 15–20% is an independent distribution signal: one viewer watching three times outweighs three viewers watching once. Do not engineer this beat artificially — if the content has a natural rewatch moment, name it explicitly in the Narrative Brief so downstream work preserves it.

### 5. Lock the product integration rule

Choose one:

- `hold until solve` — product does not appear until the arc's solution beat
- `reveal at inversion` — product appears at the moment of expectation subversion
- `show early, explain late` — product is visible from beat 1 but only named or explained at beat 3
- `assumed known` — product identity is not established in this video (retargeting or sequel content)

Do not let the product appear earlier than the chosen rule allows.

**Feature sequencing rule for multi-feature products**

When beat 2 or 3 contains multiple product features or specifications, order them by descending perceived impact — not by spec sheet order or logical grouping.

Lead with the feature that would make someone stop scrolling if it appeared alone. Follow with supporting features that reinforce the primary claim. End with features that close objections.

Example ordering for a vehicle or mobility product:

1. Performance differentiator (power, speed, range threshold) — highest perceived impact ("this is different")
2. Physical proof of performance (terrain, capability demo) — visual proof of the claim
3. Objection closer (range, battery, charging) — closes the "but what about…" question
4. Supporting features (lights, display, controls) — supports, does not lead

Reversed ordering (lights first, motor last) distributes attention before the viewer has been given a reason to care.

### 6. Define the emotional arc

Map the intended viewer emotional state at each major beat:

```text
Hook exit state:    [curious / unsettled / self-identified / surprised]
Beat 2 target:      [problem felt / desire raised / trust building]
Product arrival:    [relief / proof / upgrade / inversion]
CTA state:          [ready to act / want to save / want to share / happy-satisfied]
```

The product arrival emotional state must follow logically from the beat 2 target. If it does not, the arc choice is wrong.

Note: 58% of viral-tier TikTok videos trigger a "happy" or "satisfied" emotional state by the end (OpusClip, 13.5M-clip analysis). Where the arc and product allow it, design the CTA state toward positive resolution rather than urgency alone.

### 7. Design the CTA

Choose one CTA mechanism:

- `direct purchase` — link click or TikTok Shop tap
- `save for later` — for high-consideration products with longer decision cycles
- `comment trigger` — ask a question that invites responses; useful for comment-loop content
- `follow hook` — tease a sequel or series to convert viewers to followers
- `share bait` — frame the video as something the viewer will want others to see

One CTA mechanism per video. Multiple CTAs reduce each one.

CTA placement: final 3–5 seconds. Do not place CTA before the resolution beat.

**Comment-loop design note**

When using `comment trigger`, the CTA works at two levels: immediate engagement (algorithm signal) and content generation (the comments become the hook of the next video).

When designing for comment-loop:

- The CTA question should be answerable in one sentence but imply multiple possible answers
- The video's body should demonstrate that questions will actually be answered (reference a prior comment, or show a "Replying to @username" graphic in the hook)
- Each reply video closes one objection and generates new questions — the loop sustains itself

For new accounts: comment-loop content using `expertExplainer` has the lowest production barrier and highest trust return per view of all content types. Prioritize this structure in the first 30 days of account building.

Comment-loop does not require a real prior comment to start. Seed the first video with a likely question the audience already has. Use probable objections from product knowledge if no real comments yet exist.

### 8. Print the Narrative Brief

Print this block before handing off to storyboard or prompt work:

```text
Segment type:
Hook context:
  Viewer question carried in:
  Hook mechanism:
  Product reveal rule from hook:

Narrative arc:
Beat sequence:
  0–3s:   [hook — from upstream hook context]
  3–8s:   [beat 1]
  8–16s:  [beat 2 — visual switch every 2–3s]
  16–28s: [beat 3 — product integration]
  28–38s: [beat 4 — arc-specific resolution]
  38–43s: [CTA]
Rewatch trigger beat: [beat and description, or none]

Product integration rule:
Feature sequence: [highest-impact feature first, if multi-feature]

Emotional arc:
  Hook exit state:
  Beat 2 target:
  Product arrival state:
  CTA state:

CTA mechanism:
CTA placement:

Tone target:        [warm expertise (default) | educational authority |
                     casual peer | urgent advisor]
Perspective:        [third-person narration (default) | first-person testimonial]
Caption requirement: burned-in animated captions — key words enlarged or
                     color-differentiated; numbers and prices at maximum
                     readable size
Downstream handoff: [next skill name + one sentence on what it needs from
                     this brief]
```

This is the required handoff object for storyboard and prompt writing.

## Tone and Perspective Rules

**Tone target: warm expertise.**

Defined as conversational delivery paired with substantive content. Not broadcast formality. Not reaction-only casualness.

Avoid:

- formal product-launch language
- vague lifestyle language without specificity
- reaction content without a clear information payload

Tone consistency across videos matters more than tone variation. An account that uses the same register in every video is rewarded by both the algorithm and the audience. Do not shift tone between videos unless the arc type explicitly requires a different register.

**Perspective: default to third-person narration.**

Third-person narration appeared in 77.8% of top-performing clips in OpusClip's 13.5M-clip analysis. It works equally well with or without on-camera talent. B-roll, screen recordings, and stock footage all support third-person narration.

Use first-person only when:

- the creator's identity is the trust mechanism
- a testimonial arc requires personal authorship

**Caption requirement: burned-in, animated captions.**

80.2% of viral-tier clips use burned-in captions. 78.6% animate them. This is a production requirement, not a stylistic option. State this explicitly in the Narrative Brief so downstream prompt work includes it.

## AIGC-Specific Beat Design

When the downstream output is AI-generated video, beat design should exploit what real filming cannot do cheaply. This is AIGC's structural advantage — not cost reduction, but access to scenes that would be prohibitively expensive or physically impossible to shoot.

Design beats around these AIGC-native capabilities:

**Extreme scenario beats**

Shots that real filming would require specialized equipment, location access, or safety setup: maximum-load terrain, high-speed performance on non-road surfaces, weather extremes, or physical stress tests. Use these as the core proof beat (beat 2 or 3), not as b-roll filler.

**Parameter visualization beats**

Abstract specs made physically visible: torque as a force animation, watt output as a power-surge graphic, range as a route map overlay. Real filming cannot do this without significant post-production. AI can generate it natively.

**Multi-scene compression beats**

Three distinct environments within a single 5-second beat, with consistent visual identity across all three. Signals variety and versatility without requiring location shoots.

**Consistent virtual narrator**

A single virtual character used across all videos increases viewer retention compared to varied on-camera talent or voiceover-only formats. If a virtual character is in use, establish them in the hook beat and return to them at the CTA beat.

Diagnostic test before handing off to prompt work: for each beat in the sequence, ask — could a human creator film this with a phone and one afternoon? If yes for every beat, AIGC has not been used as a structural advantage. Redesign at least one beat to use AI's native capabilities.

Note: as of 2026, TikTok's algorithm shows a slight preference for human-creator content over pure AI-generated content. Mixed formats — real footage in the hook or CTA, AI-generated scenes in the proof beats — currently perform better than fully AI-generated videos for conversion-focused segments.

## Writing Rules

- carry the viewer question from the hook into the first narrative beat — do not reset
- deepen the problem or desire before the product appears
- choose one arc and follow it — do not blend arcs mid-video
- make product timing explicit, not implied
- define success as a viewer behavioral signal, not a tone word
- keep the beat sequence tight — cut rather than extend
- write the CTA as a mechanism choice, not a line to polish
- order multi-feature product reveals from highest perceived impact to lowest

## Failure Mode

Stop and say the Narrative Brief is under-specified if you cannot determine at minimum:

- which arc the body is following
- when the product is allowed to appear
- what emotional state the viewer should be in when the CTA arrives
- which CTA mechanism is being used

Do not hand off to storyboard or prompt work with a vague arc or unresolved product timing.

When stuck, default to `expertExplainer`. It is the most forgiving arc: it does not require a specific emotional precondition in the viewer, does not require product reveal timing to be precise, and has the highest completion rate of all arc types. If the hook context and product are clear, `expertExplainer` can always produce a valid Narrative Brief.

If the upstream hook context itself is under-specified, return to `hook-design` or `pattern-router` before proceeding. Do not resolve hook ambiguity inside narrative design.

## Limitations

This skill handles arc selection, beat sequencing, product timing, emotional arc, and CTA design.

It does not handle:

- hook mechanism selection (use `hook-design` or `pattern-router`)
- frame-one visual execution (use `visual-hook`)
- benchmark reference decoding (use `reference-decode`)
- pre-generation prompt validation (use `prompt-preflight-qa`)

## In Practice

The full skill chain for a short-form video is:

1. `pattern-router` — choose opening route and segment type
2. `hook-design` — lock hook mechanism and Hook Brief (use `pattern-router` output directly if `hook-design` is not available)
3. **`narrative-design`** — lock Narrative Brief ← this skill
4. `reference-decode` or `visual-hook` — when references or visual execution need work
5. `prompt-preflight-qa` — validate before generation

Without narrative design, a strong hook context frequently hands off to prompts that introduce the product too early, lose the viewer question, or arrive at a CTA the viewer is not ready for.

## Orchestrated Workflows

In practice, most short-form video problems are workflow problems, not single-skill problems.

Systems like [PostPlus](https://postplus.io) handle this as an orchestrated chain, where routing, hook design, narrative design, visual execution, and QA are connected automatically.
