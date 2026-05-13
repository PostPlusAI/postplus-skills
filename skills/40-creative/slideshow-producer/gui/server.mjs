#!/usr/bin/env node

/**
 * Minimal HTTP server for the slideshow-producer GUI.
 *
 * Serves the GUI HTML/CSS/JS and a simple REST API for slide manifest CRUD.
 *
 * Usage:
 *   node server.mjs --manifest <path-to-manifest.json> [--port 3099]
 */

import { readFile, writeFile } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAX_MANIFEST_BODY_BYTES = 5 * 1024 * 1024;

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { port: 3099, manifest: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' && args[i + 1]) {
      result.port = parseInt(args[i + 1], 10);
      if (!Number.isInteger(result.port) || result.port < 1 || result.port > 65535) {
        throw new Error(`Invalid --port value: ${args[i + 1]}`);
      }
      i++;
    } else if (args[i] === '--manifest' && args[i + 1]) {
      result.manifest = path.resolve(args[i + 1]);
      i++;
    }
  }
  return result;
}

function mimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
  };
  return map[ext] || 'application/octet-stream';
}

async function serveStatic(res, filePath) {
  if (!existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const content = await readFile(filePath);
  res.writeHead(200, { 'Content-Type': mimeType(filePath) });
  res.end(content);
}

function readJsonFile(filePath) {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

async function handleApi(req, res, config) {
  const url = new URL(req.url, `http://localhost:${config.port}`);
  const method = req.method;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET /api/manifest
  if (method === 'GET' && url.pathname === '/api/manifest') {
    if (!config.manifest || !existsSync(config.manifest)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No manifest loaded. Start server with --manifest <path>' }));
      return;
    }
    const data = readJsonFile(config.manifest);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return;
  }

  // PUT /api/manifest
  if (method === 'PUT' && url.pathname === '/api/manifest') {
    if (!config.manifest) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No manifest path configured' }));
      return;
    }
    let body = '';
    let bodyBytes = 0;
    let bodyRejected = false;
    req.on('data', (chunk) => {
      bodyBytes += chunk.length;
      if (bodyBytes > MAX_MANIFEST_BODY_BYTES) {
        bodyRejected = true;
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Manifest payload is too large.' }));
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on('end', async () => {
      if (bodyRejected) {
        return;
      }
      try {
        const data = JSON.parse(body);
        data.updatedAt = new Date().toISOString();
        await writeFile(config.manifest, JSON.stringify(data, null, 2), 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, updatedAt: data.updatedAt }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Invalid JSON: ${e.message}` }));
      }
    });
    return;
  }

  // GET /api/image?path=...
  if (method === 'GET' && url.pathname === '/api/image') {
    const imagePath = url.searchParams.get('path');
    const allowedImagePath = resolveManifestImagePath(config.manifest, imagePath);
    if (!allowedImagePath || !existsSync(allowedImagePath)) {
      res.writeHead(404);
      res.end('Image not found');
      return;
    }
    await serveStatic(res, allowedImagePath);
    return;
  }

  // Fallback: serve static file from gui/
  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  // Prevent directory traversal
  filePath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
  const fullPath = path.join(__dirname, filePath);
  if (existsSync(fullPath)) {
    await serveStatic(res, fullPath);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
}

function resolveManifestImagePath(manifestPath, imagePath) {
  if (!manifestPath || !imagePath) {
    return null;
  }

  const manifest = readJsonFile(manifestPath);
  const manifestDir = path.dirname(manifestPath);
  const requestedPath = path.resolve(manifestDir, imagePath);

  return collectManifestImagePaths(manifest, manifestDir).has(requestedPath)
    ? requestedPath
    : null;
}

function collectManifestImagePaths(manifest, manifestDir) {
  const allowedPaths = new Set();

  if (!manifest || !Array.isArray(manifest.slides)) {
    return allowedPaths;
  }

  for (const slide of manifest.slides) {
    addManifestImagePath(allowedPaths, manifestDir, slide?.generatedImagePath);
    addManifestImagePath(allowedPaths, manifestDir, slide?.localImagePath);
    for (const referencePath of Array.isArray(slide?.referenceImagePaths)
      ? slide.referenceImagePaths
      : []) {
      addManifestImagePath(allowedPaths, manifestDir, referencePath);
    }
  }

  return allowedPaths;
}

function addManifestImagePath(allowedPaths, manifestDir, imagePath) {
  if (typeof imagePath === 'string' && imagePath.trim()) {
    allowedPaths.add(path.resolve(manifestDir, imagePath));
  }
}

const config = parseArgs();

if (!config.manifest) {
  console.error('Usage: node server.mjs --manifest <path-to-manifest.json> [--port 3099]');
  process.exit(1);
}

const server = createServer((req, res) => handleApi(req, res, config));
server.listen(config.port, () => {
  console.log(`Slideshow Producer GUI → http://localhost:${config.port}`);
  console.log(`Manifest: ${config.manifest}`);
});
