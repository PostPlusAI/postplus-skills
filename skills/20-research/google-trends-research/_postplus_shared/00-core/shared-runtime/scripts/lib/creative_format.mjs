export const DEFAULT_CREATIVE_FORMAT_ID = 'short_form_vertical';
export const CUSTOM_CREATIVE_FORMAT_ID = 'custom';

export const CREATIVE_FORMAT_PRESETS = Object.freeze({
  short_form_vertical: Object.freeze({
    id: DEFAULT_CREATIVE_FORMAT_ID,
    label: 'PostPlus short-form vertical creative format',
    aspectRatio: '9:16',
  }),
  instagram_meta_ads: Object.freeze({
    id: 'instagram_meta_ads',
    label: 'PostPlus Instagram 3:4 creative format',
    aspectRatio: '3:4',
  }),
});

const CREATIVE_FORMAT_ALIASES = Object.freeze({
  '9:16': DEFAULT_CREATIVE_FORMAT_ID,
  reels: DEFAULT_CREATIVE_FORMAT_ID,
  short_form: DEFAULT_CREATIVE_FORMAT_ID,
  short_form_vertical: DEFAULT_CREATIVE_FORMAT_ID,
  stories: DEFAULT_CREATIVE_FORMAT_ID,
  tiktok: DEFAULT_CREATIVE_FORMAT_ID,
  vertical_short_form: DEFAULT_CREATIVE_FORMAT_ID,
  '3:4': 'instagram_meta_ads',
  instagram_3_4: 'instagram_meta_ads',
  instagram_meta_ads: 'instagram_meta_ads',
  meta_ads_3_4: 'instagram_meta_ads',
});

function readString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function normalizeFormatId(value) {
  if (!value) {
    return null;
  }
  return value
    .trim()
    .toLowerCase()
    .replaceAll('-', '_')
    .replaceAll(' ', '_')
    .replaceAll('/', '_');
}

function resolvePreset(rawCreativeFormat) {
  const normalized = normalizeFormatId(rawCreativeFormat);
  if (!normalized) {
    return null;
  }
  const presetId = CREATIVE_FORMAT_ALIASES[normalized] ?? normalized;
  const preset = CREATIVE_FORMAT_PRESETS[presetId];
  if (!preset) {
    throw new Error(
      `unsupported_creative_format: ${rawCreativeFormat}. Supported formats: short_form_vertical, instagram_meta_ads.`,
    );
  }
  return preset;
}

export function resolveCreativeFormat(input = {}) {
  const explicitAspectRatio = readString(
    input.targetAspectRatio,
    input.aspectRatio,
    input.aspect_ratio,
    input.ratio,
  );
  const preset = resolvePreset(
    readString(input.creativeFormat, input.targetCreativeFormat),
  );

  if (
    preset &&
    explicitAspectRatio &&
    explicitAspectRatio !== preset.aspectRatio
  ) {
    throw new Error(
      `creative_format_aspect_ratio_conflict: ${preset.id} requires ${preset.aspectRatio}, received ${explicitAspectRatio}.`,
    );
  }

  if (preset) {
    return {
      id: preset.id,
      label: preset.label,
      aspectRatio: preset.aspectRatio,
    };
  }

  if (explicitAspectRatio && explicitAspectRatio !== CREATIVE_FORMAT_PRESETS.short_form_vertical.aspectRatio) {
    return {
      id: CUSTOM_CREATIVE_FORMAT_ID,
      label: `PostPlus ${explicitAspectRatio} creative format`,
      aspectRatio: explicitAspectRatio,
    };
  }

  return {
    ...CREATIVE_FORMAT_PRESETS.short_form_vertical,
  };
}

export function buildCreativeOutputSpec(creativeFormat) {
  return `${creativeFormat.label}; target aspect ratio ${creativeFormat.aspectRatio}`;
}
