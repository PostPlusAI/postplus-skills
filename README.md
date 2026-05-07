# PostPlus

Most marketing work starts messy.

You may not know which platform to research, which creator is worth contacting, why a competitor's video works, what customers are really saying in comments, or how to turn scattered evidence into a script, report, campaign brief, or launch plan.

PostPlus Skills help an AI agent turn that messy request into a repeatable marketing workflow.

Instead of asking you to choose tools first, PostPlus starts from the job you want done:

```text
"Find creators for this product."
"Analyze why this competitor video works."
"Tell me whether this product has marketplace potential."
"Turn these references into a short-form video brief."
"Package the research into a client-ready Feishu report."
```

The agent then routes the work, collects evidence, makes the judgment explicit, produces the asset, and hands it off in the right format.

## Product Surface

PostPlus has three public surfaces that work together:

- `https://postplus.io/`: the hosted product surface for account access, subscription state, and cloud-backed capabilities.
- `https://github.com/PostPlusAI/postplus-skills`: the public skill repository that installs local marketing workflows into agent tools.
- `https://github.com/PostPlusAI/postplus-cli`: the local command-line tool that signs you in, checks local readiness, and connects released skills to PostPlus account state.

## Install

Requires Node.js and npm.

```bash
npm install -g @postplus/cli@latest
postplus auth login
npx -y skills add PostPlusAI/postplus-skills --global --full-depth --skill '*' --agent claude-code codex cursor github-copilot windsurf trae trae-cn --yes
```

Useful checks:

```bash
postplus status
npx -y skills add PostPlusAI/postplus-skills --list --full-depth
```

## The Vision

PostPlus is built for a world where one marketer, founder, operator, or agency strategist can work with an AI agent as if they had a larger marketing team around them.

The goal is not to replace marketing judgment. The goal is to make the repeatable parts of marketing more structured:

- finding public signals
- comparing channels, creators, products, and content angles
- turning research into briefs, scripts, captions, subtitles, images, videos, reports, and outreach lists
- publishing or handing work off through Feishu, Google Workspace, social tools, email, or local files
- improving the result through experiments, feedback, and performance analysis

PostPlus gives the agent durable marketing workflows so it does not improvise from a blank page every time.

## Who This Is For

PostPlus is useful when you want marketing work completed, not just discussed.

- For founders: turn vague growth questions into research, strategy, and concrete next steps.
- For marketers: move faster from evidence to briefs, campaigns, creator lists, and content assets.
- For agencies: package repeatable client work into auditable workflows and shareable deliverables.
- For operators: connect marketing work with Feishu, Google Workspace, reporting, outreach, and publishing.
- For people new to marketing: follow guided workflows instead of needing to know every framework upfront.

You do not need to know the skill names to start. Describe the outcome you want.

## What Are Skills?

Skills are instructions, workflows, scripts, and reference rules that teach an AI agent how to do a specific kind of work.

A skill can tell the agent:

- when to use a workflow
- what evidence to collect first
- which PostPlus capability to use
- how to normalize raw data
- how to decide whether the result is good enough
- what artifact to produce at the end

In PostPlus, skills are not isolated prompts. They are designed to work together across a full marketing workflow.

## Why Trust This Workflow?

PostPlus is designed to reduce the risky parts of agent-based marketing work:

- It starts from evidence before making strategic claims.
- It separates routing, collection, synthesis, production, and publishing so each step has a clear job.
- It keeps reusable rules in shared files instead of relying on one-off prompt memory.
- It produces artifacts that can be inspected, reused, or handed to a teammate or client.
- It makes external dependencies visible when a workflow needs an account, permission, local dependency, or publishing destination.

The result should feel less like asking an agent to "do marketing" and more like giving a skilled operator a repeatable playbook.

## How It Works

PostPlus follows a simple operating loop:

```text
Goal
-> Route the task
-> Collect the minimum useful evidence
-> Normalize and compare the data
-> Make a recommendation or brief
-> Create the asset or package the result
-> Publish, hand off, or iterate
```

This matters because many marketing tasks fail when the agent jumps straight to writing. PostPlus pushes the agent to identify the job, gather enough proof, and keep the output tied to evidence.

## What You Can Ask For

### Market and Platform Research

Use PostPlus when you need to understand what is happening on a platform or in a category.

Example requests:

```text
"Research how AI study tools are discussed on TikTok and YouTube."
"Find Xiaohongshu notes about US company registration for solo founders."
"Compare Amazon review complaints for these products."
"Show me recent content patterns from these Instagram accounts."
```

Typical outputs:

- topic snapshots
- strongest posts, videos, notes, or products
- repeated audience language
- competitor or creator patterns
- raw, normalized, and summarized research artifacts

### Creator Discovery and Outreach Prep

Use PostPlus when you need to find creators, score them, and turn candidates into a usable outreach list.

Example requests:

```text
"Find 30 US TikTok creators for this cat litter product."
"Rank these Instagram accounts by content fit and engagement quality."
"Build a shortlist of creators we can contact for a product seeding campaign."
```

Typical outputs:

- candidate pools
- ranked shortlists
- profile and content evidence
- contact signals
- outreach drafts or handoff tables

### Product, Marketplace, and Sourcing Judgment

Use PostPlus when you need to decide whether a product, category, or channel is worth testing.

Example requests:

```text
"Does this product fit Amazon or a content-led launch better?"
"Find 1688 suppliers and compare them against demand signals."
"Analyze whether this category has enough content proof to test."
```

Typical outputs:

- channel-fit judgment
- supplier or product shortlists
- price band and review summaries
- demand, competition, risk, and next-step notes

### Creative and Media Production

Use PostPlus when research needs to become usable creative work.

Example requests:

```text
"Analyze this reference video and turn it into a brief for our product."
"Generate a storyboard for a 15-second hook."
"Transcribe this video, create subtitles, and suggest B-roll placements."
"Prepare provider-ready image or video generation requests."
```

Typical outputs:

- video analysis
- transcripts and subtitle files
- hook and pattern breakdowns
- storyboards and prompt requests
- B-roll plans and edit-ready packages
- generated media candidates and manifests

### Strategy, Copy, SEO, and Growth

Use PostPlus when you need to turn product or customer context into marketing strategy and execution.

Example requests:

```text
"Create a content strategy for this SaaS product."
"Rewrite this landing page copy for higher conversion."
"Plan an A/B test for our signup flow."
"Audit this app store listing."
```

Typical outputs:

- positioning and message maps
- content plans
- copy drafts and edits
- SEO and AI-search recommendations
- CRO, pricing, referral, lifecycle, and paid creative plans

### Publishing, Reporting, and Workspace Handoff

Use PostPlus when work needs to move into a shared system.

Example requests:

```text
"Publish this research summary into a Feishu doc."
"Turn this CSV into a Google Sheet for the client."
"Package these campaign assets into a shareable report."
"Schedule these posts through our social media tool."
```

Typical outputs:

- Feishu docs, sheets, folders, wiki pages, or calendar items
- Google Docs or Sheets
- local reports and campaign folders
- social publishing records
- outreach logs and send reports

## Common Workflows

### New Product Validation

```text
Product idea
-> collect TikTok, Amazon, Xiaohongshu, Google Trends, or 1688 evidence
-> compare demand, content fit, supply, price, and risk
-> produce a go / no-go / test-first recommendation
```

### Creator Campaign Setup

```text
Campaign goal
-> choose discovery mode
-> collect content-first creator evidence
-> enrich profiles
-> rank candidates
-> package shortlist and outreach drafts
```

### Short-Form Video Production

```text
Product and reference videos
-> decode the reference
-> choose the hook pattern
-> write the brief or storyboard
-> prepare image, video, voice, subtitle, and B-roll assets
-> package the edit-ready output
```

### Client Research Report

```text
Research question
-> collect public evidence
-> normalize and summarize findings
-> make the recommendation explicit
-> package into Markdown, Feishu, Google Workspace, or a customer folder
```

### Growth Optimization

```text
Page, funnel, campaign, or product context
-> identify the bottleneck
-> collect supporting evidence
-> propose copy, CRO, SEO, pricing, lifecycle, or paid media changes
-> define tests and follow-up checks
```

## Capability Map

PostPlus skills are organized into seven capability families.

### 1. Find and Route

For broad or ambiguous requests where the first job is choosing the right path.

Examples: social media routing, creator discovery routing, media routing, pattern selection, reference decoding, prompt QA.

### 2. Research and Evidence

For collecting and analyzing public signals from platforms, marketplaces, search behavior, and social content.

Examples: TikTok, TikTok ads, Instagram, X, YouTube, LinkedIn, Facebook, Xiaohongshu, 1688, Amazon, Google Trends.

### 3. Decide and Shortlist

For turning raw findings into a clear recommendation, shortlist, brief, or judgment.

Examples: product selection, sourcing judgment, creator ranking, benchmark-to-brief, persona packs, account shortlists.

### 4. Create and Edit

For turning evidence into content, media, and production-ready assets.

Examples: transcription, subtitles, storyboard grids, reference decoding, B-roll matching, video analysis, image generation, video generation, Xiaohongshu cards and articles.

### 5. Publish and Operate

For moving work into tools, reports, calendars, sheets, docs, social systems, or outreach channels.

Examples: Feishu, Google Docs, Google Sheets, social publishing, Gmail outreach, customer folders, campaign reports.

### 6. Grow and Optimize

For improving conversion, search visibility, lifecycle performance, ad performance, pricing, retention, and revenue operations.

Examples: copywriting, SEO, AI SEO, CRO, paid ads, analytics, A/B tests, pricing, referrals, churn prevention, sales enablement.

### 7. Maintain and Improve

For finding skills, keeping shared rules aligned, and recording lessons so the system improves over time.

Examples: skill discovery, shared rulebooks, memory notes, self-improving workflows.

## Skills Map

This is not a full catalog. It is a practical map of the problems PostPlus is meant to solve.

| If you need to... | PostPlus helps with... | Common platforms and workflow keywords |
|---|---|---|
| Understand a market or audience | Topic listening, trend discovery, competitor snapshots, comment mining, audience language, demand signals | TikTok, Instagram, X, YouTube, LinkedIn, Facebook, Xiaohongshu, Google Trends, Amazon reviews |
| Find creators or KOL/KOC partners | Creator discovery, profile enrichment, content-fit scoring, shortlist building, contact signal extraction, outreach prep | TikTok creators, Instagram creators, Xiaohongshu accounts, X accounts, creator graph, follower bands, engagement proxy |
| Decide whether a product is worth testing | Product selection, marketplace comparison, channel fit, price bands, review analysis, supply-side checks, sourcing judgment | Amazon, 1688, Google Trends, Xiaohongshu commerce, supplier ranking, SKU, MOQ, margin risk |
| Turn references into creative direction | Reference decoding, hook analysis, visual grammar, benchmark-to-brief, persona packs, storyboard planning, prompt QA | TikTok videos, Reels, Xiaohongshu notes, short-form hooks, UGC, product demo, lifestyle, testimonial |
| Produce media assets | Transcription, subtitles, frame extraction, B-roll planning, image generation, video generation, voice generation, edit packaging | Speech-to-text, SRT/VTT/ASS, B-roll, storyboard grid, hosted media generation, image prompts, video requests |
| Plan content and messaging | Positioning, content strategy, copywriting, social content, email sequences, SEO, AI search, launch planning | Blog, landing page, LinkedIn, X, Xiaohongshu, cold email, content pillars, hooks, objections, offers |
| Improve conversion or growth | CRO, signup flow, onboarding, paid creative, analytics, A/B tests, pricing, referrals, churn prevention, revenue operations | Landing page, signup, funnel, Google Ads, paid social, GA4, experiments, pricing page, lifecycle |
| Package and hand off work | Client reports, campaign folders, Feishu docs, Google Sheets, social scheduling, Gmail outreach, publishing records | Feishu/Lark, Google Docs, Google Sheets, social publishing, Gmail, customer workspace, campaign report |

Most workflows combine two or three rows. For example, a creator campaign may start with TikTok research, move into creator discovery, produce an outreach shortlist, then publish the result into Feishu or Google Sheets.

## How To Navigate This Repository

Start from the job, not the file name.

1. Describe the outcome you want in natural language.
2. If you are unsure which workflow fits, start with a router skill.
3. Use `skills/INDEX.md` as the detailed map of active skills, boundaries, and handoffs.
4. Read the target `SKILL.md` before execution.
5. Follow shared rulebooks when the task crosses platforms, products, ads, media, or publishing.
6. Chain only the minimum skills needed to produce the next useful artifact.

Important files:

- `README.md`: this first-time onboarding page
- `skills/INDEX.md`: detailed agent-facing navigation map
- `skills/README.md`: short runtime catalog notes
- `skills/shared-*.md`: shared routing and judgment rules
- each `SKILL.md`: the workflow contract for one specific capability

## First Requests To Try

If you are new, start with one concrete goal:

```text
"I have this product and want to know which marketing channel to test first."
"I want to find creators for this product and package a shortlist."
"I have three competitor videos. Explain what works and create a brief for our version."
"I need a Xiaohongshu content plan for this customer."
"I need to turn this research into a client-ready report."
```

The best first prompt includes:

- what you are trying to achieve
- the product, customer, or market
- the target platform if you already know it
- any reference links, files, accounts, or assets
- the artifact you want at the end

## License

PostPlus CLI and PostPlus Skills are source-available under the PolyForm Shield
License 1.0.0.

You may use PostPlus, including for commercial work, to create your own
marketing research, strategy, media, reports, outreach lists, and other
deliverables.

You may not sell, host, distribute, repackage, rename, or provide PostPlus or a
competing product or service as a substitute for PostPlus.

Every copy or distribution must include the license terms and the Required
Notice lines provided with this repository. Contact RealProductStudio for a
separate commercial license if you need rights outside the public license.
