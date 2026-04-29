# PostPlus Skills

`postplus-skills` contains the released PostPlus skills for your local AI
agent.

## Install

Install PostPlus CLI, sign in, then add the released skills:

```bash
npm install -g @postplus/cli
postplus auth login
npx -y skills add PostPlusAI/postplus-skills --full-depth --skill '*' --agent claude-code codex cursor --yes
```

To see available skills:

```bash
npx -y skills add PostPlusAI/postplus-skills --list --full-depth
```

Validate local skill references:

```bash
node scripts/validate-skill-references.mjs
```

## What Lives Here

- `skills/`: released PostPlus skills
- `skills/00-shared/postplus-shared`: shared principle documents for released
  PostPlus skills
- business skills keep executable helper files inside their own
  `_postplus_shared/` directory when local runtime imports need stable paths

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
