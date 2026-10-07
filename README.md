# PostPlus

Describe the marketing result you want. Your agent selects the specific skill,
uses the evidence and inputs you provide, and returns a usable result.
You do not need to learn skill names or read a shared rulebook first.

## Install and start

Ask your agent to follow the [official installation guide](https://postplus.io/postplus-agent-install.md).
The installer prepares PostPlus and its dedicated runtime automatically.
You do not need to install or upgrade Node.js or npm, and your system Node is not changed.

After installation, the agent uses the command path returned by the installer
for the current session, then continues your original task. New shells use the
registered `postplus` command.

The CLI includes its matching skills and verifies actual installed content.
Follow the completion message for session reload and continuing your task.
Correct installations are reused; do not run a separate skills installer.
Use `postplus install --current-directory` for a project-only installation.

Ask your agent for a concrete result, with relevant links or files and the
output you want. For example: “Transcribe this video and give me subtitles.”
Explore current capabilities and examples with `postplus list`; use
`postplus install --help` for installation options. The CLI derives available
skills from its bundled catalog, so this page does not maintain another list.
If you are unsure where to start, tell your agent the result you want; it can
ask one useful question and select the relevant skill. After an update, continue
your original task rather than repeating this introduction.

Cloud tasks require a connected account. Run `postplus auth login` when the CLI
requests it, and approve the real browser connection yourself. Never share
credentials with the agent. Quotes, publishing, and replacing business content
require the applicable user approval.

## Connect a marketing channel

Ask for the outcome you need: review Google or Meta ad performance, prepare a
Facebook Page post, or adapt a video for Instagram and TikTok. Your agent uses
the relevant skill, discovers the available tools, and checks their inputs and
your account permissions before executing.

Connect and manage accounts in Web **Integrations** or through the CLI:

```bash
postplus channels list
postplus channels connect google-ads
postplus channels tools list --toolkit googleads
postplus channels tools show GOOGLEADS_LIST_ACCESSIBLE_CUSTOMERS
```

`postplus list` describes the tasks your agent can help with. `channels list`
shows channels and your connections; `channels tools list` searches executable
tools. Use `channels tools show` for the selected tool's inputs and availability.
A listed tool does not prove that your account has the platform permissions to
use it. Complete any browser authorization yourself; the agent checks connection
status before continuing your original task.

Channel connections belong to your personal account and can be reused across
workspaces. Connecting or executing channel tools requires eligible subscription
access on your own PostPlus account; a teammate's subscription does not cover
you. Disconnecting a connection affects every workspace that uses it.

For publishing or account changes, approve the exact destination and final
content or change. If the result is unknown, the agent checks the original
operation instead of sending a duplicate. Channel access is covered by your
eligible subscription; research and media generation can have separate charges.

## Maintenance

Your agent continues the task while the CLI handles a required compatible update.
You can also run `postplus update` to update the CLI and its matching skills.
Official skill names are managed by PostPlus: local changes are overwritten and
retired skills are removed without prompts or backups. Keep custom skills under
separate names. Correct installations are reused.
Follow the reported action only if an update fails or a new agent session is required;
do not repeat maintenance blindly.

```bash
postplus status
postplus skills verify
```

`status` reports installation and account state; `skills verify` verifies skill
content. `postplus doctor --help` explains readiness checks and their limits.
Hosted diagnostics check configuration, not live provider access or whether a
specific source can be downloaded. Those are verified when the request runs.
No disk check proves a running agent has loaded newly installed instructions.

## Repository navigation

- Each concrete `SKILL.md` is the entry for its task.
- Read local references only when the task enters their documented branch.
- `skills/catalog.json` is generated release metadata, not a second authoring source.
- CLI help/schema owns executable fields, typed actions, and command discovery.

## Product direction

<!-- BEGIN POSTPLUS PRODUCT BRIEF -->
PostPlus helps your AI agent handle marketing work, from market research and content creation to social publishing and advertising management.

Research markets and audiences: explore popular content, competitors, and audience interests on TikTok, Instagram, Facebook, and YouTube to find the right marketing direction.

Create marketing content: write social posts and ad copy, and generate images, video, and voice for different platforms.

Connect social accounts: connect Instagram, Facebook, YouTube, and TikTok accounts to prepare content and, after your approval, carry out supported publishing, scheduling, or engagement actions.

Connect advertising accounts: connect Meta Ads, Google Ads, and other supported ad platforms to plan campaigns, analyze performance, and carry out supported campaign launches and adjustments after your approval.

Explore 28 advertising strategy templates for performance monitoring, budget adjustments, stop loss, and creative testing at https://postplus.io/ad-strategy. Choose a strategy and copy its prompt to your agent to adapt it to your goals and account.

Tell your agent what you want to promote and who you want to reach, and it will help you choose where to start. Available actions depend on platform support and account permissions. TikTok account connections are currently available only to invited test users.
<!-- END POSTPLUS PRODUCT BRIEF -->

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

## CLI development

In the `postplus-cli` repository, `pnpm test` builds once and runs the full source-level and compiled-command test suite with at most two test files in parallel. Existing offline, account-state, recovery and installer assertions remain.

For an individual command test file, run `pnpm build` first, then `pnpm exec tsx --test src/<name>.test.ts`. Rebuild after source changes so command tests exercise the current code.
