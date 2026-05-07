# Prompt Preflight Checklist

Use this checklist before running image or video generation.

## 1. Opening Strength

Ask:

- does frame or beat one create a clear viewer question?
- is the first beat already in the interesting moment?
- would this still read without text or voiceover?

Fail examples:

- setup before payoff
- product packaging before the problem or desire is visible
- empty beauty shot with no action

## 2. Viewer Question

Ask:

- is the question concrete?
- can the draft answer why the viewer keeps watching?

Weak questions:

- `Is this a vibe?`
- `Is this premium?`

Strong questions:

- `How is that whole setup happening there?`
- `Can this really do the hard part fast enough?`

## 3. Visible Evidence

Ask:

- what proof exists inside the frame?
- are objects, hands, surfaces, or context visible enough?
- is the prompt describing what can be seen?

## 4. Product Timing

Ask:

- when may the product first appear?
- is it support, proof, or hero?
- does the timing match the segment type?

Default warning:

- hook drafts often fail by showing the product too early

## 5. Negative Constraints

Ask:

- what exact drift is being blocked?
- are the first 2-3 beats protected from common failure modes?

Typical missing negatives:

- no readable text
- no TikTok UI
- no copied faces
- no glossy ad look
- no posed mutual gaze

## 6. Reference Contract

Ask:

- what may the model learn from references?
- what identity elements must change?
- what references were intentionally not used?
- if references are used, is each one explicitly bound to a role?

If this is unclear, later failure analysis becomes weak.

Reference-binding warning:

- `use the attached references` is too vague
- prefer explicit bindings such as `[image 1] controls shot order` or `[video 1] controls pacing`

## 7. Realism / Native Feel

Ask:

- does the draft specify camera grammar?
- does it include tactile or environmental anchors?
- is there at least one imperfection or candid behavior when needed?

## 8. Output Format

Ask:

- is this supposed to be a storyboard grid or a full video?
- did storyboard language accidentally leak into a final render request?
- is aspect ratio explicit?
- if this is a Seedance request over 15 seconds, does a segment plan exist?
- does each segment stay within 15 seconds and remain usable on its own?

Fail examples:

- one 28-second Seedance request with no split plan
- multiple segments that only make sense when merged, but do not stand as usable clips

## Verdict Labels

Use one:

- `ready`
- `ready_with_risk`
- `not_ready`

## Output Shape

```text
Verdict:
What works:
- ...
Major risks:
- ...
Missing fields:
- ...
Most likely drift:
- ...
Fix now:
- ...
```
