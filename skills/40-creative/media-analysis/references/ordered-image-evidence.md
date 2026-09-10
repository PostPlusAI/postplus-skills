# Image evidence

Open already readable images directly. For native Instagram or TikTok image posts,
use `postplus media prepare --source <url>` and inspect its returned originals.
`ordered-images` supplies paths and original indices; `image` identifies a local
image. `video-input` means continue with video analysis or frames for the user's
question, not that a video file was downloaded. No Gemini analysis is needed for pictures.

Inspect every original for a full carousel review. Byte validation and platform
metadata do not prove visual readability; open originals when a contact sheet
cannot resolve details. Preserve original order, repeated slides, and missing
indices. Do not sort filenames, substitute a cover, or omit a video child while
claiming the whole post was reviewed. If a separate source total is unavailable,
state that the manifest proves only the returned set.

If preparation fails after some images were downloaded, inspect the CLI error's
`partialEvidence`. It retains verified downloads and original indices while the
command remains failed. Use its inline image list if no `manifestPath` is present;
do not claim a saved manifest exists. Show useful inspected pages with the failed
index and missing scope; do not restart the whole collection just to answer from
the available images.

For each reviewed page, show its image, original index, visible facts/text, and
interpretation. Match detail to the question. Label unreadable text and partial
sets explicitly; never infer speech, music, duration, or motion from a still.
For an animated image, claim only the frames actually inspected. Printed claims
are source statements, not independently verified facts.

Use readable Markdown without fabricated timecodes or video sections. Embed
images beside the observations they support, and save needed originals to the
report's attachment folder before cleaning invocation-owned temporary downloads.
Verify the delivered links remain readable; never delete user files or attachments.
