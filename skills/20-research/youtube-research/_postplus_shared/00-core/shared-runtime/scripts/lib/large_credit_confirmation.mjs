#!/usr/bin/env node
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PRODUCT_ERROR_CODE = 'postplus_cli_quote_confirmation_required';

function createHardError(code, message, cause, extra = {}) {
  const error = new Error(message);
  error.code = code;
  if (cause !== undefined) {
    error.cause = cause;
  }
  Object.assign(error, extra);
  return error;
}

export function readLargeCreditQuoteConfirmationChallenge(error) {
  if (
    !error ||
    typeof error !== 'object' ||
    error.productErrorCode !== PRODUCT_ERROR_CODE
  ) {
    return null;
  }

  const challenge = error.quoteConfirmation;

  if (
    !challenge ||
    typeof challenge !== 'object' ||
    typeof challenge.token !== 'string' ||
    typeof challenge.accountId !== 'string' ||
    typeof challenge.requiredTierMillicredits !== 'number'
  ) {
    return null;
  }

  return challenge;
}

export async function resolveLargeCreditQuoteConfirmation(error, options = {}) {
  const challenge = readLargeCreditQuoteConfirmationChallenge(error);

  if (!challenge) {
    return null;
  }

  const confirmation = await (
    options.confirmWithPostPlusCli ?? confirmLargeCreditQuoteWithPostPlusCli
  )(challenge, options);

  if (!confirmation || typeof confirmation.token !== 'string') {
    throw createHardError(
      'skill_server_large_credit_confirmation_invalid_cli_response',
      'PostPlus CLI returned an invalid large credit confirmation response.',
      undefined,
      { confirmation },
    );
  }

  return {
    token: confirmation.token,
  };
}

export async function confirmLargeCreditQuoteWithPostPlusCli(
  challenge,
  options = {},
) {
  const command =
    options.postplusCommand ?? process.env.POSTPLUS_CLI_BIN?.trim() ?? 'postplus';
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'postplus-quote-confirmation-'),
  );
  const challengePath = path.join(tempDir, 'challenge.json');
  fs.writeFileSync(challengePath, JSON.stringify(challenge), {
    encoding: 'utf8',
    mode: 0o600,
  });
  const args = [
    'quote',
    'confirm',
    '--json',
    '--challenge-file',
    challengePath,
  ];

  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['inherit', 'pipe', 'inherit'],
    });
    const stdout = [];

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout.push(chunk);
    });

    child.once('error', (error) => {
      cleanupTempDir(tempDir);
      reject(
        createHardError(
          'skill_server_large_credit_confirmation_cli_unavailable',
          'PostPlus CLI is required to confirm large credit charges. Run `npm install -g @postplus/cli@latest` and retry.',
          error,
        ),
      );
    });

    child.once('close', (code) => {
      cleanupTempDir(tempDir);
      if (code !== 0) {
        reject(
          createHardError(
            'skill_server_large_credit_confirmation_declined',
            'Large credit charge was not confirmed by PostPlus CLI.',
            undefined,
            { exitCode: code },
          ),
        );
        return;
      }

      try {
        resolve(JSON.parse(stdout.join('')));
      } catch (error) {
        reject(
          createHardError(
            'skill_server_large_credit_confirmation_invalid_cli_json',
            'PostPlus CLI returned invalid large credit confirmation JSON.',
            error,
          ),
        );
      }
    });
  });
}

function cleanupTempDir(tempDir) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
