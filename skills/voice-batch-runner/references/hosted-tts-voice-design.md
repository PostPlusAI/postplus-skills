# Hosted TTS Voice Design Notes

This file records the hosted capability direction for voice design on the released shell.

## Current Role

Use the hosted voice design capability for:

- first-pass persona voice design
- early script-specific takes before a stronger reusable voice identity exists

## Why It Fits

The capability direction is suitable when the workflow starts from:

- text
- voice description
- persona traits

This matches the current stage of the released shell, where personas exist but durable voice identities have not been captured yet.

## Documented Inputs

Required:

- `text`
- `voice_description`

Optional:

- `language`

Language options currently documented:

- `auto`
- `Chinese`
- `English`
- `German`
- `Italian`
- `Portuguese`
- `Spanish`
- `Japanese`
- `Korean`
- `French`
- `Russian`

## Documented Output

The response schema documents:

- `id`
- `model`
- `outputs`
- `status`
- `urls`
- `created_at`
- `has_nsfw_contents`

Interpretation for the adapter:

- submit the job
- preserve the returned `id`
- if status is not `completed`, poll via `urls.get`
- use `outputs` as the downloadable audio URL list when completed

## Boundary

This hosted capability path should be treated as:

- good for designing or approximating a voice
- not necessarily the final long-term timbre-preservation backend

Later, a second hosted capability may be introduced to lock a voice identity more tightly while scripts change.

The outer workflow should not need to change when that happens.
