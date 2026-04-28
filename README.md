# PostPlus Skills

`postplus-skills` contains the skills that PostPlus CLI installs into your
local AI agent.

## Install

Install and update skills through PostPlus CLI:

```bash
postplus auth login
postplus install
postplus status
```

To see available skills:

```bash
postplus list
```

The CLI downloads the current PostPlus skill catalog, installs the selected
skills into your local agent, and verifies the local setup.

## What Lives Here

- `skills/`: released PostPlus skills and the shared files they use
- `.claude/skills`: the Claude-compatible entry that points to `skills/`

## Product Boundary

This repository contains local skill code, references, and shared runtime
helpers.

It does not contain:

- PostPlus Cloud auth or billing services
- provider credentials
- hosted provider implementations
- release catalog APIs or other cloud control-plane code

Those capabilities are served by PostPlus Cloud after you sign in with
`postplus auth login`.
