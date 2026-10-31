# Street Interview Reference Adaptation

Deliver a detailed shot script, or generate the complete AI video when requested.
**Preserve the reference's story and candid UGC feel; change the cast, product, and only the dialogue and actions their adaptation requires.**

## Read the Reference

Resolve the reference video, cast roles, product facts/assets, and target duration from the user's materials. For a product URL, obtain verified facts and a product image. Ask only for missing information that changes the result.
Use the user's language for analysis, scripts, prompt review, and delivery notes; keep dialogue in the requested or reference language. Default to the reference's complete story duration, unless another length is requested.
Reuse existing analysis; use `media-analysis` when a new video needs understanding. Frame observations alone do not establish speech, sound, or delivery.

For faithful adaptation, carry the chronological analysis into the script:
preserve story order, complete exchanges, action and reaction timing, and
existing discontinuities. Change only what the product, cast or user's approved
adaptation requires. Keep source observations, verified product facts and
creative choices distinguishable. Do not reduce the analysis to a marketing
outline before writing prompts.

| Format | Preserve this persuasion structure |
|---|---|
| [Street Blind Test Challenge](blind-test.md) | Conceal brands from participants → experience → describe differences → choose → reveal |
| [Problem-to-Replacement Interview](problem-to-replacement.md) | Usage context → concrete complaint → new product → relevant demonstration → reaction |
| [Playful Street Challenge](fun-challenge.md) | Simple task → acceptance → action and feedback → result → product payoff |

All three are street-interview formats. Choose by what makes the product convincing and read only the matching reference. Adapt other formats around their actual mechanism rather than forcing these categories.
Use supplied or verified product facts. The source brand's claims and offers do not transfer to the new product. Avoid adding unrelated scenes. Generated participants and reactions are dramatizations, not genuine public testimonials or measured evidence.

## Shot Script

State the format, duration, and adaptations in one line, then cover the complete new video with this table. Label it as a creative script.

| Shot / time range | Framing and camera | Person / product action | Full dialogue and delivery | Sound, captions and edit | Purpose |
|---|---|---|---|---|---|

Each row is one executable shot: specify framing, angle, movement, speaker, product handling, and transition. Replace vague directions such as “natural reaction” with observable behavior.
Preserve the reference's observed cuts, holds and continuous actions for faithful adaptation; let pauses, laughter and demonstrations keep their required time. Subtitle changes and minor camera shake do not count as new shots.
Write every spoken line, preserving fillers, repetitions, pauses, laughs, interruptions, overlaps and corrections supported by the analysis. Speech can continue across cuts. Match the reference's camera proximity, composition, lighting, conversational rhythm, and location sound; music stays below dialogue.

Describe product operation with a concise factual action and observable result.
Use a selected demo only for behavior it actually shows. A supported product
specification does not automatically become a requirement to display every
state; add visual constraints only when needed for the requested adaptation.

Keep observed source overlays in the analysis. Unless the user requests them in
generated footage, leave subtitles, emphasis text, stickers, graphics, AI labels,
watermarks, award cards, URLs and end titles for postproduction. Spoken dialogue
is for audio and mouth movement, not an instruction to render text on screen.

## Approve the Adaptation

Present the faithful reference analysis for review before changing its structure.
Then present the concrete shot script and generation prompt in the user's language
for approval. Carry forward existing approval for the same content and scope;
ask again only when a material creative choice changes.

## Generation: Bind Assets → Specify Filming and Performance → Supply Dialogue

Usually use **Seedance 2.5 reference** (`video-seedance-2-5-reference`), executed through the existing `video-batch-runner` skill; let the runner match the selected inputs to the current endpoint schema. Express the task as filming a new video using the approved adaptation.
The original ad video is optional. Detailed text can define the story, filming
and performance; cast/product images can define appearance, and a selected demo
can guide product behavior. Submit the original ad when its motion, timing or
performance needs direct guidance. Bind only submitted assets, with numbering matching their
actual submission order and each asset's intended role.

Each prompt is self-contained. Organize it around these three parts and preserve
the approved content during handoff to the runner:

1. **Asset bindings:** Which submitted asset defines each person, product or demonstrated behavior, and the appearance that stays consistent. Describe the scope of any submitted video so its actors, setting or audio do not acquire unintended roles.
2. **Filming and performance:** Concrete scene, composition, camera, cuts, action order, interactions, sound and timing from the approved adaptation; “UGC vibe” alone is insufficient. If the original ad is omitted, replace references such as “follow the original reaction” with the actual reaction sequence. Refer only to media the model will receive.
3. **Shot-by-shot scene and dialogue:** In chronological shot blocks, combine setting, composition, camera, cuts, ordered actions, interactions, sound and timing with every spoken line and its delivery. Preserve fillers, pauses, laughter, interruptions and overlaps.

Typical two-person, one-product scaffold; adapt numbering, language, and content to the actual assets:

> Create a new [duration]-second UGC street-interview video. Cast [image 1] as [host and stable appearance], and [image 2] as [participant and stable appearance]. [image 3] defines [product and packaging].
>
> Shot [number] — [start–end time]:
> Setting and composition: [location, lighting, framing and subject positions].
> Camera and cut: [angle, movement, cut or hold, and transition to the next shot].
> Actions and interaction: [who does what, in what order, including gestures, gaze, product handling and responses].
> Sound and timing: [ambience, sound effects, pauses, laughter, interruptions, overlaps and their relation to actions or cuts].
> Dialogue ([language]): [speaker, exact line and delivery, placed at the corresponding action or response].

Continue in chronological shot blocks through the segment, including every line
and its associated action and reaction.

When a video is submitted, add its actual numbered binding and the specific
property it guides, such as product behavior or camera movement. Omit that
binding when no video is submitted.

## Long Videos and Delivery

Split at complete exchanges or action boundaries within the selected endpoint's current per-generation limit. **Explicitly set each segment's duration**; let the runner validate live schema constraints, including integer seconds. If submitting a source-video excerpt, retain its original boundary context and preserve the original file. Do not rewrite the story, cut off reactions or invent bridging events to fit a segment.
Reuse the same cast, wardrobe, and product bindings; each request gets its selected assets, concrete filming/action directions and complete dialogue. Later segments continue the story without restarting or adding new openings and closes. A first-segment sample does not fulfill a full-video request.
Before generating a multi-segment request for one complete video, establish that
an authorized editing environment can assemble it. This MCP connection does not
provide a stitching tool. If the host has no editing capability, explain the
missing step and resolve the delivery scope with the user before spending on
segments; do not treat separate clips as a completed assembled video.
When assembly is available, retain raw segments, assemble the complete video and
check duration, dimensions, audio and file integrity. Review generated content
when requested. Delegate pricing, recovery and failure handling to the runner
rather than creating another execution workflow.
Deliver the actual model/mode, submitted prompts, references and their roles, run information, and actual cost. Planned shots and dialogue are not verified output behavior.
