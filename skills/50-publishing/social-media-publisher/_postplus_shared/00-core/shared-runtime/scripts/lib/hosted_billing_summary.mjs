#!/usr/bin/env node

function readNonNegativeNumber(value) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function normalizeHostedBillingSummary(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const estimatedMillicredits = readNonNegativeNumber(
    value.estimatedMillicredits,
  );
  const estimatedCredits = readNonNegativeNumber(value.estimatedCredits);
  const finalizedMillicredits = readNonNegativeNumber(
    value.finalizedMillicredits,
  );
  const finalizedCredits = readNonNegativeNumber(value.finalizedCredits);
  const reservedMillicredits = readNonNegativeNumber(
    value.reservedMillicredits,
  );
  const reservedCredits = readNonNegativeNumber(value.reservedCredits);

  if (
    estimatedMillicredits === null ||
    estimatedCredits === null ||
    finalizedMillicredits === null ||
    finalizedCredits === null ||
    reservedMillicredits === null ||
    reservedCredits === null
  ) {
    return null;
  }

  return {
    billingUnit:
      value.billingUnit === 'credit' || value.billingUnit === 'milliCredit'
        ? value.billingUnit
        : null,
    charged: value.charged === true,
    estimatedCredits,
    estimatedMillicredits,
    estimatedOnly:
      typeof value.estimatedOnly === 'boolean' ? value.estimatedOnly : null,
    finalizedCredits,
    finalizedMillicredits,
    reservedCredits,
    reservedMillicredits,
  };
}
