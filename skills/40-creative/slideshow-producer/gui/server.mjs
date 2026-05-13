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

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { port: 3099, manifest: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' && args[i + 1]) {
      result.port = parseInt(args[i + 1], 10);
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
    req.on('data', (d) => { body += d; });
    req.on('end', async () => {
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
    if (!imagePath || !existsSync(imagePath)) {
      res.writeHead(404);
      res.end('Image not found');
      return;
    }
    await serveStatic(res, imagePath);
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
