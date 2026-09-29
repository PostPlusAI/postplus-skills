# Listening and reply triage

Use this for current discussions, objections, brand mentions, and opportunities
to answer a real person. Public discovery and acting from the user's account
are separate jobs.

## Define and collect a bounded sample

Start with the user's topic, audience, places that matter, exclusions, and time
window. Use supplied source links first. For a Reddit keyword request about
recent conversations:

```sh
postplus research run reddit-search --query "<audience problem>" --sort new --time-range day --limit 20 --wait --output reddit-discovery.json
```

Keep the returned URL, community, author context, publication time, and
question. Rank candidates by a reproducible rubric: give 0–2 points each for
audience fit, evidence of the actual problem, timeliness within the requested
window, and the ability to add a specific helpful answer. Report the four
components and total; do not score reach or purchase intent from a title alone.
Check the discussion and community rules before suggesting engagement. Do not
reply to excluded or unrelated communities merely because a phrase matched.

If the user needs the participants' actual language, select a real URL from
discovery, then request that thread's comments:

```sh
postplus research run reddit-post-comments --url "<real post URL from discovery>" --limit 50 --wait --output reddit-comments.json
```

These are two distinct research requests that can consume credits. If a run is
incomplete, use `postplus research run --resume-from <result.json>` and preserve
its handle; do not blindly start it again. A discovered post summary is not a
sample of its comments. For Instagram, TikTok, Facebook, YouTube, and Pinterest,
select the existing public research Skill and inspect its route-specific
`postplus research run <route> --help` before using semantic flags. Examples:
`instagram-comments --url`, `tiktok-comments --url`,
`facebook-comments --url`, `youtube-videos --url`, and
`pinterest-search --query --kind all --limit`. Use a small initial sample and
expand only when the answer depends on it. A browser can verify a supplied
public URL and its live context; it does not replace the PostPlus account
execution contract. For broad public LinkedIn discovery, use user-supplied
links or exports and state their coverage; the own-account tools are not a
public network search. Do not promise unsupported sources such as a general
Hacker News or Bluesky route.

## Turn a candidate into a helpful response

Quote or paraphrase the actual question accurately. Answer its problem first,
add a relevant example or constraint, and mention a product only when it helps
the answer and community rules permit it. Do not manufacture personal
experience or pretend to be an unaffiliated community member. Give the user a
shortlist with URL, why it fits, evidence, proposed response, and exclusions.
If asked to post it, read [Reddit/Pinterest](reddit-pinterest.md) or the
relevant platform reference and [channel execution](channel-execution.md).
Drafting a reply does not authorize sending it.

For an ongoing listening request, keep a project source list of actual links,
queries, date windows, and exclusions. Reuse the user's existing customer
definition; do not duplicate a separate “ideal customer” database in the
Skill. Refresh the list only as the user's request requires.
