# PostPlus

Describe the marketing result you want. Your agent selects the specific skill,
uses the evidence and inputs you provide, and returns a usable result.
You do not need to learn skill names or read a shared rulebook first.

## Install and start

Requires Node.js >=24.5.0 and npm.

```bash
npm install -g @postplus/cli@latest
postplus install
```

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
credentials with the agent. Quotes, publishing, and replacing existing content
require the applicable user approval.

## Maintenance

Run `postplus update` to update the CLI and its matching managed skills.
Follow the exact reported action on failure; do not repeat maintenance blindly.
The CLI identifies content conflicts and requests authorization before replacing
protected content. Its session-reload message explains how to continue.

```bash
postplus status
postplus skills verify
```

`status` reports installation and account state; `skills verify` verifies skill
content. `postplus doctor --help` explains readiness checks and their limits.
No disk check proves a running agent has loaded newly installed instructions.

## Repository navigation

- Each concrete `SKILL.md` is the entry for its task.
- Read local references only when the task enters their documented branch.
- `skills/catalog.json` is generated release metadata, not a second authoring source.
- CLI help/schema owns executable fields, typed actions, and command discovery.

## Product direction

<!-- BEGIN POSTPLUS PRODUCT BRIEF -->
PostPlus helps your agent turn public research, product facts, and media references into useful marketing decisions and creative assets.

Describe the result you want. The matching skill guides the task directly, while the CLI handles execution, account access, cost confirmation, and clear recovery actions.

Human judgment stays central: you set the direction, approve important decisions, and review the result. Current capabilities are listed by the CLI from its bundled catalog.
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
