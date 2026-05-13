#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function parseArgs(argv) {
  const args = { manifest: null };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--manifest' && argv[index + 1]) {
      args.manifest = argv[index + 1];
      index += 1;
    }
  }
  return args;
}

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function validateUrl(value) {
  return typeof value === 'string' && /^https?:\/\//.test(value);
}

export function validateSlideshowManifest(manifest, options = {}) {
  const checkFiles = options.checkFiles !== false;
  const errors = [];

  if (!manifest || typeof manifest !== 'object') {
    return ['Manifest must be a JSON object.'];
  }

  if (manifest.manifestVersion !== 'slideshow/v1') {
    errors.push('manifestVersion must be "slideshow/v1".');
  }

  if (!Array.isArray(manifest.slides) || manifest.slides.length === 0) {
    errors.push('slides must be a non-empty array.');
    return errors;
  }

  manifest.slides.forEach((slide, index) => {
    const label = `slides[${index}]`;
    const referenceImagePaths = asArray(slide.referenceImagePaths);
    const referenceImageUrls = asArray(slide.referenceImageUrls);
    const hasReferenceImages =
      referenceImagePaths.length > 0 || referenceImageUrls.length > 0;

    if (slide.position !== index + 1) {
      errors.push(`${label}.position must be ${index + 1}.`);
    }

    if (slide.imageSource === 'local') {
      if (slide.generationMode !== null) {
        errors.push(`${label}.generationMode must be null for local slides.`);
      }
      if (!slide.localImagePath) {
        errors.push(`${label}.localImagePath is required for local slides.`);
      } else if (!path.isAbsolute(slide.localImagePath)) {
        errors.push(`${label}.localImagePath must use an absolute path: ${slide.localImagePath}`);
      } else if (checkFiles && !existsSync(slide.localImagePath)) {
        errors.push(`${label}.localImagePath file does not exist: ${slide.localImagePath}`);
      }
      if (hasReferenceImages) {
        errors.push(`${label} local slides must not carry reference images.`);
      }
      return;
    }

    if (slide.imageSource !== 'generate') {
      errors.push(`${label}.imageSource must be "generate" or "local".`);
      return;
    }

    if (typeof slide.prompt !== 'string' || !slide.prompt.trim()) {
      errors.push(`${label}.prompt is required for generated slides.`);
    }

    if (slide.localImagePath != null) {
      errors.push(`${label}.localImagePath must be null for generated slides.`);
    }

    const expectedMode = hasReferenceImages ? 'edit' : 'text-to-image';
    if (slide.generationMode !== expectedMode) {
      errors.push(
        `${label}.generationMode must be "${expectedMode}" because reference images are ${hasReferenceImages ? 'present' : 'absent'}.`,
      );
    }

    for (const referencePath of referenceImagePaths) {
      if (typeof referencePath !== 'string') {
        errors.push(
          `${label}.referenceImagePaths entries must be strings: ${typeof referencePath}`,
        );
      } else if (!path.isAbsolute(referencePath)) {
        errors.push(`${label}.referenceImagePaths must use absolute paths: ${referencePath}`);
      } else if (checkFiles && !existsSync(referencePath)) {
        errors.push(`${label}.referenceImagePaths file does not exist: ${referencePath}`);
      }
    }

    for (const referenceUrl of referenceImageUrls) {
      if (!validateUrl(referenceUrl)) {
        errors.push(`${label}.referenceImageUrls must be HTTP(S) URLs: ${referenceUrl}`);
      }
    }
  });

  return errors;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.manifest) {
    console.error('Usage: node validate-manifest.mjs --manifest <manifest.json>');
    process.exitCode = 1;
    return;
  }

  const manifestPath = path.resolve(args.manifest);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const errors = validateSlideshowManifest(manifest);
  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify({ ok: true, slides: manifest.slides.length }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
