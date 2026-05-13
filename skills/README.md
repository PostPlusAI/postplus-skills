# PostPlus Skills

PostPlus Skills is the released local skill catalog for PostPlus.

## Install

```bash
npm install -g @postplus/cli@latest
postplus auth login
npx -y skills add PostPlusAI/postplus-skills --global --full-depth --skill '*' --agent claude-code codex cursor github-copilot windsurf trae trae-cn openclaw hermes-agent --yes
```

If you explicitly do not want global skills, run the install from the target
project directory and omit `--global`:

```bash
npx -y skills add PostPlusAI/postplus-skills --full-depth --skill '*' --agent claude-code codex cursor github-copilot windsurf trae trae-cn openclaw hermes-agent --yes
```

## Browse

```bash
npx -y skills add PostPlusAI/postplus-skills --global --list
```

The readable catalog is in `skills/INDEX.md`.

## Validate

```bash
node scripts/validate-skill-references.mjs
```

## What This Package Contains

- `skills/`: released PostPlus skills
- `skills/00-shared/postplus-shared`: shared principle documents for released
  PostPlus skills
- `skills/INDEX.md`: the readable skill catalog

PostPlus Cloud auth, billing, and hosted capabilities are provided through
`@postplus/cli` after sign-in.
