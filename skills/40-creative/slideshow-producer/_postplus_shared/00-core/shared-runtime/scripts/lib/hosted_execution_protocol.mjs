#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

export const HOSTED_SKILL_EXECUTION_SCHEMA_VERSION = 1;

const PRODUCT_ERROR_CODE = 'postplus_cli_quote_confirmation_required';
const HOSTED_EXECUTION_ENVELOPE_ERROR_CODE =
  'postplus_hosted_skill_execution_envelope_required';
const TOKEN_PLACEHOLDER = '<token-from-postplus-quote-confirm-json>';
const TOKEN_JSON_FIELD = 'token';
let envelopeQuoteConfirmationToken = null;
let envelopeHostedOperationId = null;

function createHardError(code, message, cause, extra = {}) {
  const error = new Error(message);
  error.code = code;
  if (cause !== undefined) {
    error.cause = cause;
  }
  Object.assign(error, extra);
  return error;
}

export function normalizeQuoteConfirmationToken(value) {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

export function readQuoteConfirmationTokenFromArgv(argv = process.argv.slice(2)) {
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] !== '--quote-confirmation-token') {
      continue;
    }

    return normalizeQuoteConfirmationToken(argv[index + 1]);
  }

  return envelopeQuoteConfirmationToken;
}

export function readHostedOperationIdFromArgv(argv = process.argv.slice(2)) {
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] !== '--hosted-operation-id') {
      continue;
    }

    return normalizeNonEmptyString(argv[index + 1]);
  }

  return envelopeHostedOperationId;
}

export function applyProcessQuoteConfirmationToken(request) {
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    return request;
  }

  if (normalizeQuoteConfirmationToken(request.quoteConfirmationToken)) {
    return request;
  }

  const quoteConfirmationToken = readQuoteConfirmationTokenFromArgv();

  return quoteConfirmationToken
    ? {
        ...request,
        quoteConfirmationToken,
      }
    : request;
}

export function applyProcessHostedExecutionFields(request) {
  const withQuoteConfirmationToken = applyProcessQuoteConfirmationToken(request);

  if (
    !withQuoteConfirmationToken ||
    typeof withQuoteConfirmationToken !== 'object' ||
    Array.isArray(withQuoteConfirmationToken)
  ) {
    return withQuoteConfirmationToken;
  }

  if (normalizeNonEmptyString(withQuoteConfirmationToken.operationId)) {
    return withQuoteConfirmationToken;
  }

  const hostedOperationId = readHostedOperationIdFromArgv();

  return hostedOperationId
    ? {
        ...withQuoteConfirmationToken,
        operationId: hostedOperationId,
      }
    : withQuoteConfirmationToken;
}

export function readHostedSkillExecutionEnvelope(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw createHostedExecutionEnvelopeError(
      'Hosted skill input must be a schemaVersion 1 execution envelope object.',
      { actualType: Array.isArray(value) ? 'array' : typeof value },
    );
  }

  if (value.schemaVersion !== HOSTED_SKILL_EXECUTION_SCHEMA_VERSION) {
    throw createHostedExecutionEnvelopeError(
      `Hosted skill input must use schemaVersion ${HOSTED_SKILL_EXECUTION_SCHEMA_VERSION}.`,
      { actualSchemaVersion: value.schemaVersion ?? null },
    );
  }

  if (!Object.hasOwn(value, 'input')) {
    throw createHostedExecutionEnvelopeError(
      'Hosted skill input envelope must include an input field.',
    );
  }

  const quoteConfirmationToken = rememberEnvelopeQuoteConfirmationToken(
    value.quoteConfirmationToken,
  );
  const operationId = rememberEnvelopeHostedOperationId(
    value.hostedOperationId ?? value.operationId,
  );

  return {
    input: value.input,
    operationId,
    quoteConfirmationToken,
    schemaVersion: HOSTED_SKILL_EXECUTION_SCHEMA_VERSION,
  };
}

export function readHostedSkillExecutionInput(value) {
  return readHostedSkillExecutionEnvelope(value).input;
}

export function readDomainSkillExecutionInput(value) {
  return value;
}

function createHostedExecutionEnvelopeError(message, extra = {}) {
  return createHardError(
    HOSTED_EXECUTION_ENVELOPE_ERROR_CODE,
    message,
    undefined,
    {
      productErrorCode: HOSTED_EXECUTION_ENVELOPE_ERROR_CODE,
      schemaVersion: HOSTED_SKILL_EXECUTION_SCHEMA_VERSION,
      status: 400,
      ...extra,
    },
  );
}

function rememberEnvelopeQuoteConfirmationToken(value) {
  const token = normalizeQuoteConfirmationToken(value);

  if (token) {
    envelopeQuoteConfirmationToken = token;
  }

  return token;
}

function rememberEnvelopeHostedOperationId(value) {
  const operationId = normalizeNonEmptyString(value);

  if (operationId) {
    envelopeHostedOperationId = operationId;
  }

  return operationId;
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

export function buildRetryCommandFromArgv({
  argv = process.argv,
  hostedOperationId = null,
  tokenPlaceholder = TOKEN_PLACEHOLDER,
} = {}) {
  const parts = [...argv];

  stripFlagWithOptionalValue(parts, '--quote-confirmation-token');
  stripFlagWithOptionalValue(parts, '--hosted-operation-id');

  if (normalizeNonEmptyString(hostedOperationId)) {
    parts.push('--hosted-operation-id', hostedOperationId);
  }

  parts.push('--quote-confirmation-token', tokenPlaceholder);

  return parts.map(shellQuote).join(' ');
}

export function createQuoteConfirmationRequiredError(error, options = {}) {
  const challenge = readLargeCreditQuoteConfirmationChallenge(error);

  if (!challenge) {
    return null;
  }

  const challengeFilePath = writeQuoteConfirmationChallengeFile(challenge, {
    workDir: options.workDir,
  });
  const confirmCommand = `postplus quote confirm --json --challenge-file ${shellQuote(challengeFilePath)}`;
  const retryCommand =
    options.retryCommand ??
    buildRetryCommandFromArgv({
      argv: options.argv,
      hostedOperationId: challenge.operationId,
      tokenPlaceholder: TOKEN_PLACEHOLDER,
    });
  const agentAction = {
    schemaVersion: HOSTED_SKILL_EXECUTION_SCHEMA_VERSION,
    type: 'postplus_quote_confirmation',
    confirmationCommand: confirmCommand,
    confirmationTokenJsonField: TOKEN_JSON_FIELD,
    quoteConfirmationTokenPlaceholder: TOKEN_PLACEHOLDER,
    retryCommandTemplate: retryCommand,
  };

  return createHardError(
    PRODUCT_ERROR_CODE,
    [
      'PostPlus Cloud requires user-confirmed quote confirmation before this hosted request can continue.',
      `Agent confirmation command: ${confirmCommand}`,
      `Agent retry command: ${retryCommand}`,
      [
        `Agent retry token: read JSON field "${TOKEN_JSON_FIELD}"`,
        'from the confirmation command output and replace',
        `${TOKEN_PLACEHOLDER}.`,
      ].join(' '),
    ].join('\n'),
    error,
    {
      agentAction,
      confirmationCommand: confirmCommand,
      confirmationTokenJsonField: TOKEN_JSON_FIELD,
      productErrorCode: PRODUCT_ERROR_CODE,
      quoteConfirmation: challenge,
      quoteConfirmationChallengeFile: challengeFilePath,
      quoteConfirmationTokenPlaceholder: TOKEN_PLACEHOLDER,
      retryCommand,
      schemaVersion: HOSTED_SKILL_EXECUTION_SCHEMA_VERSION,
      status: typeof error.status === 'number' ? error.status : 402,
    },
  );
}

function writeQuoteConfirmationChallengeFile(challenge, { workDir } = {}) {
  const baseDir = path.resolve(
    workDir ?? process.env.POSTPLUS_SKILL_WORK_DIR ?? process.cwd(),
    '.postplus',
  );
  const outputDir = path.join(baseDir, 'quote-confirmations');
  const operationId =
    typeof challenge.operationId === 'string' && challenge.operationId.trim()
      ? challenge.operationId.trim()
      : 'hosted-request';
  const safeOperationId = operationId.replace(/[^A-Za-z0-9_.-]+/g, '-');
  const outputPath = path.join(outputDir, `${safeOperationId}.json`);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(challenge, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  });

  return outputPath;
}

function shellQuote(value) {
  const text = String(value);
  if (/^[A-Za-z0-9_./:=@-]+$/.test(text)) {
    return text;
  }

  return `'${text.replaceAll("'", "'\\''")}'`;
}

function stripFlagWithOptionalValue(parts, flag) {
  for (let index = parts.length - 1; index >= 0; index -= 1) {
    if (parts[index] !== flag) {
      continue;
    }

    parts.splice(index, parts[index + 1] ? 2 : 1);
  }
}

function normalizeNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}
