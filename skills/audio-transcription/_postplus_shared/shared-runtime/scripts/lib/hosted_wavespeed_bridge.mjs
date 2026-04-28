#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

import { runHostedProviderOperation } from "./hosted_provider_bridge.mjs";

export async function requestHostedWaveSpeedJson(
  url,
  { method = "GET", body, billing } = {},
) {
  const parsedBody =
    typeof body === "string" && body.trim().length > 0
      ? JSON.parse(body)
      : body ?? undefined;

  const data = await runHostedProviderOperation({
    family: "wavespeed",
    operation: "json-request",
    url,
    method,
    ...(parsedBody !== undefined ? { body: parsedBody } : {}),
    ...(billing ? { billing } : { billing: { charge: false } }),
  });

  return {
    data,
    response: {
      headers: {},
      status: 200,
    },
  };
}

export async function uploadHostedWaveSpeedFile(
  localFilePath,
  mimeType = "application/octet-stream",
) {
  const absolutePath = path.resolve(localFilePath);
  const fileBuffer = fs.readFileSync(absolutePath);

  return await runHostedProviderOperation({
    family: "wavespeed",
    operation: "upload-file",
    fileContentBase64: fileBuffer.toString("base64"),
    fileName: path.basename(absolutePath),
    mimeType,
  });
}

export async function downloadHostedWaveSpeedFile(url, outputPath) {
  const result = await runHostedProviderOperation({
    family: "wavespeed",
    operation: "download-file",
    url,
  });
  const absoluteOutputPath = path.resolve(outputPath);

  fs.mkdirSync(path.dirname(absoluteOutputPath), { recursive: true });
  fs.writeFileSync(
    absoluteOutputPath,
    Buffer.from(String(result.contentBase64 || ""), "base64"),
  );
}
