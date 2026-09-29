# Short video

Use a short video only when a scene, demonstration, person, or timed reveal
helps answer the audience's question better than text or a still image.
Separate a script, media analysis, production, upload acceptance, processing,
and public visibility.

## Brief and script

Write a one-sentence viewer promise and choose proof the viewer can see or hear.
Storyboard the first scene, the key change or demonstration, the proof/caveat,
and one next action. In a scene table include spoken line, visual, on-screen
text, required footage, and claim source. Use a sequence length that serves
the idea and the user's production capacity; a fixed duration or completion
rate is not a cross-platform law. Avoid a hook that promises a result the video
does not deliver. Confirm rights for footage, music, likenesses, and customer
examples before recommending their use.

For a user-supplied existing video, the `media-analysis` Skill exposes a
PostPlus route such as `postplus media analyze video-analysis`; use its public
CLI instructions and ask a focused question about scenes, pacing, or evidence.
For speech from a source video, the `video-transcription` Skill exposes
`postplus media transcribe transcription-video`. Inspect their route help for
the exact media flag and use the user's existing transcript when sufficient.
Use `postplus media schema --json` when the endpoint's input shape is unknown;
the owning media Skill remains the execution guide.
These are potentially billable; a script can be written without them. Media
generation or editing belongs to the corresponding media Skill, not an
invented Social script.

Before publishing, identify the actual file or platform-readable URL, caption,
thumbnail or cover if supported, intended account, and visibility. TikTok URL
publication and local-file upload are distinct tool routes. YouTube upload may
continue processing after the initial response. Follow
[YouTube/TikTok](youtube-tiktok.md) and [channel execution](channel-execution.md)
for the concrete request, media mapping, and status readback. Do not report a
video as live based only on a successful upload call.
