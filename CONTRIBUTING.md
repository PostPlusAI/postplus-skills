# Contributing to PostPlus Skills

Thank you for your interest in contributing.

## How to contribute

- **Bug reports and feature requests**: open an issue at
  https://github.com/PostPlus/postplus-skills/issues
- **Pull requests**: fork the repository, make your changes on a feature
  branch, and open a pull request against `main`.

## What this repository contains

This repository contains the skill instruction files, shared runtime helpers,
and reference docs that are installed into your local AI agent via the
PostPlus CLI.

## Contribution guidelines

- Keep changes focused: one skill or one shared utility per pull request.
- Skill instruction files (`SKILL.md`) should describe the task in plain terms
  that an agent can follow without requiring PostPlus-internal knowledge.
- Do not include customer names, internal campaign identifiers, or
  provider-specific implementation details in skill files.
- Run a basic sanity check before submitting: make sure the skill installs
  cleanly with `postplus install <skill-id>` against a local checkout.

## License

By submitting a contribution you agree that your contribution will be licensed
under the Apache License, Version 2.0 (the same license as this project).
