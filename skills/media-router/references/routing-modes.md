# Media Routing Modes

## 1. Transcript Only

Use when the user needs text, searchability, or rough review.

Primary skill:

- `audio-transcription` or `video-transcription`

## 2. Subtitle Ready

Use when the user needs:

- SRT
- VTT
- readable caption chunks
- timing alignment

Primary chain:

1. transcription with timestamps
2. subtitle-packager

## 3. Semantic Understanding

Use when the user needs:

- what the visuals prove
- what happens on screen
- what B-roll is available

Primary chain:

1. transcription if speech matters
2. video-analysis

## 4. Edit Prep

Use when the user needs:

- cut points
- proof beats
- A-roll vs B-roll choices
- a real edit plan

Primary chain:

1. transcription with timestamps
2. subtitle-packager if subtitle artifacts are needed
3. video-analysis if proof reasoning is needed
4. editing-decision-engine

## 5. Batch Pipeline

Use when the user needs:

- many files processed consistently
- durable manifests
- retryable provider calls

Add:

- one manifest per asset
- one summary index per batch
- clear request/response persistence
