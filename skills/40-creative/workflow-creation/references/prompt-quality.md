# Prompt Quality Reference

Use this reference when converting rough ideas into Seedance prompts for reusable UGC ad workflows.

## Core Principle

The best prompt feels like a real creator explaining a believable moment. It should not feel like a brand storyboard dressed up as UGC.

Judge every prompt from three angles:

- **Advertiser Judge**: product, claims, usage, references, and compliance boundaries are accurate enough for the advertiser to trust.
- **Viewer Judge**: the first seconds create a human question, the product enters naturally, and the CTA feels like the next step instead of a sales interruption.
- **Generator Judge**: the downstream models receive concrete visible details, clear reference duties, isolated clip scope, and executable camera/audio instructions.

Start with a specific human pressure, then let the product enter as a practical fix when the moment gives it a believable reason to appear. Avoid opening with a product announcement unless the brief explicitly asks for one.

Only put model-facing generation instructions in the prompt. Do not include post-production plans, internal rationale, end-card copy, translation overlays, hook-text suggestions, or disclaimers-for-later inside a Seedance prompt. If those are useful, store them in a separate notes file or outside the video node prompt.

Keep each segment isolated. The model should only receive references, objects, and constraints that are meant to influence that segment.

## Generation Control Doctrine

Use this doctrine for the Generator Judge.

Image and video models are easier to steer with concrete, positive, visible details than with abstract exclusions. Negative instructions define boundaries. Positive scene details create the video.

Treat user "do not show X" instructions as authoring constraints, not final prompt language. First ask what job the unwanted element was doing for the viewer: story clarity, proof, safety, realism, product understanding, or attention control. Then replace it with a visible carrier:

- human action, posture, gaze, expression, or hesitation
- practical light from a window, desk lamp, kitchen light, hallway light, or phone screen glow
- everyday props such as a notebook, receipt, cup, bag, laptop, table, sink, mirror, or product handling
- camera behavior such as handheld selfie, desk-level insert, quick b-roll slice, phone dip, or hard cut
- spoken line, room tone, reaction, object movement, or the result of a gesture

Do not make a wall of banned terms. If an object should not appear, build a better scene that no longer needs that object.

Examples:

- User constraint: "Do not show the app interface."
  Better prompt move: keep the interface out of the scene. The creator sets the phone beside a laptop as a simple prop; the viewer understands the result through her relieved half-smile, a quick thumb tap, and the spoken line. A notebook and coffee cup catch soft window light on the desk.
- User constraint: "No subtitles or text."
  Better prompt move: the message is carried entirely by natural speech, visible reaction, and physical action. Do not add papers, screens, captions, labels, or any other text-bearing prop unless the user specifically needs one.
- User constraint: "Do not make it feel like an ad."
  Better prompt move: handheld phone footage in a normal room, practical desk light, tiny pauses before speaking, a small correction when the phone dips, and everyday objects left where they naturally sit.
- User constraint: "Do not make the product appear suddenly."
  Better prompt move: the product is already on the table because the creator was using it before the clip starts, or the creator pulls it from a bag during a moment where the scene gives it a reason to appear.

## Reference Role Binding

References are not generic inspiration. Every reference image, video, or audio must have a job, a scope, and a boundary.

- Job: what the reference controls, such as creator identity, product appearance, scene style, camera rhythm, voice, pacing, or room tone.
- Scope: where it applies, such as all clips, product-only clips, this one scene image, or only spoken audio.
- Boundary: what should not transfer, such as background, outfit, UI, readable text, unrelated objects, lighting, expression, or product presence in pre-product clips.

Write reference bindings directly in the prompt when references are attached:

- Reference image 1: creator identity. Preserve face shape, hairstyle, skin tone, and natural presence across this clip; do not transfer the reference background or outfit unless this clip states it.
- Reference image 2: product appearance. Preserve exact product shape, color, material, label placement, and physical scale whenever the product appears; do not invent extra packaging, UI, or variants.
- Reference audio 1: voice and pacing reference. Use it for speaker tone, cadence, and natural room-like delivery; spoken words must follow this clip's script.
- Reference video 1: camera rhythm reference. Use its handheld timing and cut energy only; do not copy its person, setting, objects, joke, or composition.

Avoid generic lines like "use the reference image" or "match the reference." Say what should transfer and what should stay behind.

## Human Speech

Write lines that sound spoken, not copywritten:

- Use short clauses and concrete situations.
- Let the person admit friction: "honestly, fair question", "I could not miss one sentence", "I just sit there smiling".
- Keep claims grounded in what the scene proves.
- Avoid breathless slogans unless they are marked as post-production text.

Good dialogue should have a reason to exist inside the shot. Put the spoken line inside the matching cut so Seedance pairs the line with the intended action.

Before writing the timestamped cuts, choose one speech posture for the clip unless the brief clearly needs a switch:

- `on-camera spoken`: the visible creator speaks to the phone/camera with synchronized mouth movement; keep the face and mouth available when the line matters.
- `voiceover`: the line plays over action, setting, or b-roll; visible people should listen, move, handle props, or react instead of looking into the lens to speak.
- `silent / room tone`: no spoken line; action, expression, and ambient sound carry the beat.

Do not park the main script in a separate `Audio exact line` block after the cuts. If a cut contains the line, write the line in that cut: `0-2s on-camera direct address: she looks into the phone lens and says, "..."` or `2-4s voiceover over b-roll: her hand sets the product down while VO says, "..."`. Keep a separate audio section only for voice reference, pacing, room tone, and no-extra-dialogue constraints.

Use spoken density when choosing clip duration. A natural UGC voice usually sits around `2.4-2.8 English words/second`; yapping-style talking-head clips can use `3.0-3.8 words/second` when the brief asks for dense, fast POV delivery; trust-sensitive scripts should stay closer to `2.2-2.6 words/second`. Product-action cuts should be lighter on dialogue so the gesture can read.

For yapping-style clips, judge density by turns, not only speed. Every `1-2s` should change something: a new claim, contrast, example, emotional beat, visual action, or punchline. Compress explanation into short spoken turns. Avoid filler setup such as "today I want to talk about"; open from conflict, conclusion, or a specific diagnosis.

Practical spoken ranges:

- normal UGC: `2s = 5-6 words`, `3s = 7-9 words`, `4s = 10-12 words`
- yapping UGC: `2s = 6-8 words`, `3s = 9-11 words`, `4s = 12-15 words`
- trust-sensitive UGC: stay near the normal range and prioritize clarity

## Micro-Actions

Seedance needs small, physical instructions to make people feel real. Include details such as:

- eyes flicking toward a door, laptop, phone, or other person
- fingers fidgeting with a cup, sleeve, paper, handle, or trackpad
- tiny nods, half-smiles, small exhales, skeptical eyebrow lifts
- phone dipping as someone sits down, slight handheld correction, natural refocus
- one-hand product touch or small adjustment that lasts about one second

Avoid generic acting notes like "she looks emotional" unless paired with visible behavior.

## UGC Camera And Editing

Use camera language a real phone creator could plausibly capture:

- handheld selfie
- husband/partner/friend POV
- low desk-level insert
- quick b-roll slice
- hallway selfie
- table-level insert
- hard cut
- slight phone micro-shake
- practical window, desk, kitchen, hallway, or ceiling light

Be cautious with:

- crane, dolly, drone, sweeping cinematic push-ins
- perfect product macro beauty shots
- staged over-the-shoulder drama that feels like a commercial
- impossible angles for the stated camera operator
- negative composition instructions such as "blur her face", "out of focus", "partially out of frame", or "do not show her face clearly"

Use positive focus language instead:

- focus on the influencer explaining
- focus on hands, papers, product handling, everyday objects, or natural gestures
- keep the scene casual, handheld, and readable

## Natural Product Placement

Give the product a social reason to appear:

- it removes a small but real friction in the scene
- it fits the person's existing habit or environment
- it lets the person keep attention on the moment instead of managing a workaround
- it creates a visible action or result the viewer can understand without overexplaining

For the current product, preserve only capabilities and constraints provided by the user or source brief. Keep the product grounded in its actual capabilities.

Do not invent:

- visible features not provided by the brief
- interface behavior not provided by the brief
- technical claims not provided by the brief
- legal, medical, financial, or compliance claims not provided by the brief

## Text, UI, And Legal Safety

Generated video should usually avoid model-rendered text. Keep captions, hooks, translation overlays, end cards, and disclaimers outside the Seedance prompt unless the user explicitly asks the model to render text in-frame.

If screens, papers, labels, charts, or bottles are necessary for the scene:

- make them serve a concrete physical role such as holding, tapping, setting down, or pointing
- convey the message through speech, gesture, expression, or product handling instead of generated text
- do not use prompt phrases such as unreadable text, illegible text, hidden text, obscured text, blurred text, or soft text blocks
- avoid personal data, private records, logos, regulated claims, or sensitive information unless the user explicitly provides and approves them

## Clip Structure

Each clip prompt should be self-contained:

1. Reference binding.
2. Global style.
3. Narrative summary.
4. Speech posture.
5. Dynamic description with timestamps, cuts, and cut-bound spoken/VO text.
6. Audio constraints such as voice reference, pacing, room tone, and no extra dialogue.
7. Visual constraints.
8. Node config check: duration, aspect ratio, resolution, and audio generation are set on the generation node config, not restated as prompt text.

For longer concepts, split by story beat:

- setup
- escalation
- action
- resolution

Each clip should work independently and still cut naturally into the next clip through the assembly node.
