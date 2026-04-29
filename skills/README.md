# PostPlus Skills

PostPlus Skills is the released local skill catalog for PostPlus.

## Install

```bash
npm install -g @postplus/cli
postplus auth login
npx -y skills add PostPlusAI/postplus-skills --skill '*' --agent claude-code codex cursor --yes
```

## Browse

```bash
npx -y skills add PostPlusAI/postplus-skills --list
```

The readable catalog is in `skills/INDEX.md`.

## What This Package Contains

- `skills/`: released PostPlus skills with self-contained helper files
- `skills/INDEX.md`: the readable skill catalog

PostPlus Cloud auth, billing, and hosted capabilities are provided through
`@postplus/cli` after sign-in.
