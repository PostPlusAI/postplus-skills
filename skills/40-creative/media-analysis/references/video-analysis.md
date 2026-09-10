# Video execution

Pass the original local path or supported URL in `--video`, preserving required
query parameters. The CLI handles source acquisition and transfer; do not author
provider requests or pre-upload files manually. Keep a distinct `--output` per source.
Use the default report by omitting `--prompt`, or supply the user's specific request.
When duration is known, `--video-seconds` is an estimation hint; omit it when unknown.

TikTok, Instagram, Facebook Reels/Ads, and YouTube use the existing hosted
source adapters. For X, use available Agent tools to obtain its video file or
media URL, then pass that source to this command. If access fails, state the
limit; do not substitute a page, cover, or subtitle for the video.

The command waits for a durable task and returns natural Markdown. Read the result
before presenting it. Show source identity without credential-bearing query strings.
The CLI prints the retained local video path. Use that file for supporting
screenshots; a text report alone does not prove screenshots were returned. Never buy another analysis
just to obtain frames.

After a wait disconnects, use the emitted `postplus media poll` command with its
handle or `--resume-from` checkpoint. Continue the same task, account, and environment;
do not submit again, remove its checkpoint, or mint a new operation. If a bounded
poll is still pending, retain the recovery command and state the current stage.

Follow typed failure and quote instructions. Retain any original report and shown
billing even when delivery is incomplete. Neither missing usage nor an unknown
result proves that no charge occurred.
