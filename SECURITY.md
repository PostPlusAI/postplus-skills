# Security Policy

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Report security issues by email to **security@email.postplus.io**.

We will acknowledge receipt within 48 hours and aim to provide an initial
assessment within 7 days.

GitHub Private Vulnerability Reporting is also enabled for this repository.

## Scope

PostPlus Skills:

- are executed by your local AI agent (Claude Code, Codex)
- communicate with PostPlus Cloud over HTTPS only, using a token obtained
  via `postplus auth login`
- do not store credentials locally; tokens are managed by the PostPlus CLI

Please include in your report:

- a description of the vulnerability and its impact
- steps to reproduce or a proof-of-concept
- affected skill names or versions if known

We follow responsible disclosure and ask that you allow a reasonable time to
fix the issue before publishing details publicly.
