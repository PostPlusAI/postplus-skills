#!/usr/bin/env node

/**
 * Composite overlay text onto generated slide images.
 *
 * Uses Python PIL (Pillow), which must be available in the active python3
 * environment.
 *
 * Usage:
 *   node composite-text.mjs --manifest <path-to-manifest.json>
 *
 * Reads each slide from the manifest, composites overlay text onto the
 * generated image, and writes the final image next to it.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const args = process.argv.slice(2);
  const manifestIdx = args.indexOf('--manifest');
  if (manifestIdx === -1 || !args[manifestIdx + 1]) {
    console.error('Usage: node composite-text.mjs --manifest <path-to-manifest.json>');
    process.exit(1);
  }

  const manifestPath = path.resolve(args[manifestIdx + 1]);
  if (!existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath}`);
    process.exit(1);
  }

  const manifest = JSON.parse(await readFile(manifestPath, 'utf-8'));
  const baseDir = path.dirname(manifestPath);
  await assertPythonPillowAvailable();

  for (const slide of manifest.slides) {
    const hasText = slide.overlayText;
    const hasProduct = slide.productOverlay && slide.productOverlay.imagePath;
    if (!hasText && !hasProduct) {
      console.log(`Slide ${slide.position}: no overlay, skipping`);
      continue;
    }

    const inputPath = slide.generatedImagePath || slide.localImagePath;
    if (!inputPath) {
      console.warn(`Slide ${slide.position}: no image path, skipping`);
      continue;
    }

    if (!existsSync(inputPath)) {
      console.warn(`Slide ${slide.position}: image not found at ${inputPath}, skipping`);
      continue;
    }

    const ext = path.extname(inputPath);
    const finalName = `final-${String(slide.position).padStart(3, '0')}${ext}`;
    const outputPath = path.join(baseDir, finalName);

    const style = slide.overlayStyle || {};
    const text = slide.overlayText || null;
    const color = style.color || '#FFFFFF';
    const strokeColor = style.strokeColor || '#000000';
    const strokeWidth = style.strokeWidth ?? 3;
    const fontSize = style.fontSize || 56;
    const positionLabel = style.position || 'upper-center';

    const product = slide.productOverlay || null;

    try {
      await compositeWithPil(inputPath, outputPath, {
        text,
        textStyle: { color, strokeColor, strokeWidth, fontSize, position: positionLabel },
        product,
        canvasWidth: parseCanvasWidth(manifest.canvasPx),
      });
      slide.finalImagePath = outputPath;
      console.log(`Slide ${slide.position}: composited → ${outputPath}`);
    } catch (err) {
      console.error(`Slide ${slide.position}: compositing failed — ${err.message}`);
    }
  }

  manifest.updatedAt = new Date().toISOString();
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`Manifest updated: ${manifestPath}`);
}

async function assertPythonPillowAvailable() {
  return new Promise((resolve, reject) => {
    const proc = spawn('python3', ['-c', 'from PIL import Image, ImageDraw, ImageFont'], {
      stdio: ['ignore', 'ignore', 'pipe'],
    });

    let stderr = '';
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    proc.on('error', (error) => {
      reject(
        new Error(
          `Failed to start python3 for slideshow text compositing: ${error.message}`,
        ),
      );
    });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          [
            'python3 with Pillow is required for slideshow text compositing.',
            'Install Pillow in the python3 environment used by this skill, then retry.',
            stderr.trim(),
          ]
            .filter(Boolean)
            .join(' '),
        ),
      );
    });
  });
}

function parseCanvasWidth(canvasPx) {
  if (!canvasPx) return 1080;
  const parts = canvasPx.split('x');
  return parseInt(parts[0], 10) || 1080;
}


async function compositeWithPil(inputPath, outputPath, opts) {
  const canvasW = opts.canvasWidth;
  const text = opts.text;
  const ts = opts.textStyle;
  const product = opts.product;

  const script = `
import sys
import os
from PIL import Image, ImageDraw, ImageFont

img = Image.open(${JSON.stringify(inputPath)}).convert("RGBA")
w, h = img.size
scale = w / ${canvasW}

# ── Text overlay ──
${text ? `
text = ${JSON.stringify(text)}
font_size = int(${ts.fontSize} * scale)
color = ${JSON.stringify(ts.color)}
stroke_color = ${JSON.stringify(ts.strokeColor)}
stroke_width = ${ts.strokeWidth}
position = ${JSON.stringify(ts.position)}

def find_font(size):
    candidates = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]
    for path in candidates:
        if not os.path.exists(path):
            continue
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            continue
    return ImageFont.load_default()

font = find_font(font_size)

draw = ImageDraw.Draw(img)
words = text.split()
lines = []
line = ""
for word in words:
    test = line + (" " if line else "") + word
    bbox = draw.textbbox((0, 0), test, font=font)
    if bbox[2] - bbox[0] > w * 0.85 and line:
        lines.append(line)
        line = word
    else:
        line = test
if line:
    lines.append(line)
lines = lines[:2]

margin = int(40 * scale)
y_start = margin
line_heights = []
for i, l in enumerate(lines):
    bbox = draw.textbbox((0, 0), l, font=font)
    line_heights.append(bbox[3] - bbox[1])
total_h = sum(line_heights) + (len(lines) - 1) * int(font_size * 0.3)
if position == "center":
    y_start = (h - total_h) // 2
elif position == "lower-center":
    y_start = h - margin - total_h

y = y_start
line_spacing = int(font_size * 0.3)
for l in lines:
    bbox = draw.textbbox((0, 0), l, font=font)
    tw = bbox[2] - bbox[0]
    x = (w - tw) // 2
    for dx in range(-stroke_width, stroke_width + 1):
        for dy in range(-stroke_width, stroke_width + 1):
            if dx == 0 and dy == 0:
                continue
            draw.text((x + dx, y + dy), l, font=font, fill=stroke_color)
    draw.text((x, y), l, font=font, fill=color)
    y += line_heights[i] + line_spacing
` : `
# No text overlay
`}

# ── Product overlay ──
${product ? `
product_img = Image.open(${JSON.stringify(product.imagePath)}).convert("RGBA")
pw = product_img.width
ph = product_img.height
prod_w = int(${product.width || 180} * scale)
ratio = prod_w / pw
prod_h = int(ph * ratio)
product_img = product_img.resize((prod_w, prod_h), Image.LANCZOS)

prod_margin = int(${product.margin || 40} * scale)
prod_position = ${JSON.stringify(product.position || 'bottom-right')}

if prod_position == "bottom-right":
    px = w - prod_w - prod_margin
    py = h - prod_h - prod_margin
elif prod_position == "bottom-left":
    px = prod_margin
    py = h - prod_h - prod_margin
elif prod_position == "top-right":
    px = w - prod_w - prod_margin
    py = prod_margin
elif prod_position == "top-left":
    px = prod_margin
    py = prod_margin
elif prod_position == "bottom-center":
    px = (w - prod_w) // 2
    py = h - prod_h - prod_margin
else:
    px = w - prod_w - prod_margin
    py = h - prod_h - prod_margin

img.paste(product_img, (px, py), product_img)
` : `
# No product overlay
`}

img = img.convert("RGB")
img.save(${JSON.stringify(outputPath)})
print("OK")
`.trim();

  return new Promise((resolve, reject) => {
    const proc = spawn('python3', ['-c', script], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('error', (error) => {
      reject(
        new Error(
          `Failed to start python3 for slideshow text compositing: ${error.message}`,
        ),
      );
    });

    proc.on('close', (code) => {
      if (code === 0 && stdout.includes('OK')) {
        resolve();
      } else {
        reject(new Error(stderr || stdout || `exit code ${code}`));
      }
    });
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
