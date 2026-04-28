# PostPlus Skills

`postplus-skills` contains the released PostPlus skills for your local AI
agent.

## Install

Install PostPlus CLI, sign in, then add the released skills:

```bash
npm install -g @postplus/cli
postplus auth login
npx -y skills add PostPlusAI/postplus-skills --all
```

To see available skills:

```bash
npx -y skills add PostPlusAI/postplus-skills --list
```

## What Lives Here

- `skills/`: released PostPlus skills and the shared files they use

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
