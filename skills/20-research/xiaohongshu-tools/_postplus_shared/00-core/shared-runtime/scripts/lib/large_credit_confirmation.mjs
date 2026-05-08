#!/usr/bin/env node
import readline from 'node:readline/promises';

import {
  readPostPlusCliConfig,
  updatePostPlusCliConfig,
} from './postplus_cli_config.mjs';

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

  const acknowledgedTierMillicredits =
    readAcknowledgedTierMillicredits(challenge);

  if (acknowledgedTierMillicredits < challenge.requiredTierMillicredits) {
    await (options.confirm ?? confirmLargeCreditQuote)(challenge);
    writeAcknowledgedTierMillicredits(challenge);
  }

  return {
    token: challenge.token,
  };
}

export async function confirmLargeCreditQuote(challenge) {
  const message = buildLargeCreditConfirmationPrompt(challenge);
  const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stderr,
  });

  try {
    const answer = await terminal.question(message);

    if (answer.trim() !== 'CONFIRM') {
      throw createHardError(
        'skill_server_large_credit_confirmation_declined',
        'Large credit charge was not confirmed.',
      );
    }
  } finally {
    terminal.close();
  }
}

export function buildLargeCreditConfirmationPrompt(challenge) {
  const lines = [
    '',
    'PostPlus large credit warning',
    `This request crosses the ${formatCredits(
      challenge.requiredTierMillicredits,
    )}-credit warning tier.`,
    `Estimated charge: ${formatCredits(
      challenge.estimatedMillicredits,
    )} credits${challenge.estimatedOnly ? ' (estimate)' : ''}.`,
    `Reserved before execution: ${formatCredits(
      challenge.reservedMillicredits,
    )} credits.`,
    `Capability: ${formatText(challenge.featureLabel)} / ${formatText(
      challenge.action,
    )}.`,
    `Service: ${formatText(challenge.serviceLabel)}.`,
  ];

  const drivers = Array.isArray(challenge.drivers)
    ? challenge.drivers.filter((driver) => {
        return (
          driver &&
          typeof driver === 'object' &&
          typeof driver.label === 'string' &&
          driver.value !== undefined &&
          driver.value !== null
        );
      })
    : [];

  if (drivers.length > 0) {
    lines.push('High-credit drivers:');
    for (const driver of drivers.slice(0, 8)) {
      lines.push(`- ${driver.label}: ${String(driver.value)}`);
    }
  }

  lines.push(
    'PostPlus will warn again only when a future request crosses a higher tier.',
    'Type CONFIRM to continue: ',
  );

  return `${lines.join('\n')}`;
}

function readAcknowledgedTierMillicredits(challenge) {
  const config = readPostPlusCliConfig() ?? {};
  const tiers =
    config.largeCreditConfirmation?.acknowledgedTierMillicreditsByAccountId;
  const tier = tiers?.[challenge.accountId];

  return Number.isSafeInteger(tier) && tier > 0 ? tier : 0;
}

function writeAcknowledgedTierMillicredits(challenge) {
  updatePostPlusCliConfig((config) => {
    const current = config.largeCreditConfirmation ?? {};
    const tiers = {
      ...(current.acknowledgedTierMillicreditsByAccountId ?? {}),
      [challenge.accountId]: Math.max(
        readAcknowledgedTierMillicredits(challenge),
        challenge.requiredTierMillicredits,
      ),
    };

    return {
      ...config,
      largeCreditConfirmation: {
        ...current,
        acknowledgedTierMillicreditsByAccountId: tiers,
      },
    };
  });
}

function formatText(value) {
  return typeof value === 'string' && value.trim() ? value : 'unknown';
}

function formatCredits(millicredits) {
  const credits = Number(millicredits) / 1_000;

  if (!Number.isFinite(credits)) {
    return 'unknown';
  }

  return Number.isInteger(credits)
    ? String(credits)
    : credits.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}
