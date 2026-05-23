#!/usr/bin/env node
import { formatCliError } from '../_postplus_shared/00-core/shared-runtime/scripts/lib/network_runtime.mjs';
import { pollVoiceGeneration } from './_poll_voice_generation.mjs';

function usage() {
  console.error(
    'Usage: node poll_design_voice.mjs --request <request.json> [--response <response.json>] [--result-url <url>]',
  );
}

async function main() {
  await pollVoiceGeneration({
    defaultMode: 'voice_design',
    defaultModel: 'voice-qwen3-design',
    failureLabel: 'Voice design polling',
    usage,
  });
}

main().catch((error) => {
  console.error(formatCliError(error));
  process.exitCode = 1;
});
