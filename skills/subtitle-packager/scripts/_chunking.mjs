#!/usr/bin/env node

function roundTimestamp(value, decimals = 3) {
  return Number(Number(value).toFixed(decimals));
}

function splitWordsIntoGroups(words, { maxCharsPerChunk, maxWordsPerChunk }) {
  const groups = [];
  let current = [];
  let currentLength = 0;

  for (const word of words) {
    const nextLength = current.length === 0 ? word.length : currentLength + 1 + word.length;
    const wouldOverflowChars = nextLength > maxCharsPerChunk;
    const wouldOverflowWords = current.length >= maxWordsPerChunk;

    if (current.length > 0 && (wouldOverflowChars || wouldOverflowWords)) {
      groups.push(current);
      current = [word];
      currentLength = word.length;
      continue;
    }

    current.push(word);
    currentLength = nextLength;
  }

  if (current.length > 0) {
    groups.push(current);
  }

  if (groups.length > 1) {
    const lastGroup = groups[groups.length - 1];
    const lastText = lastGroup.join(" ");
    if (lastGroup.length <= 2 || lastText.length <= 8) {
      groups[groups.length - 2] = [...groups[groups.length - 2], ...lastGroup];
      groups.pop();
    }
  }

  return groups;
}

function proportionalDurations(groups, totalDuration, minDuration) {
  if (groups.length === 1) {
    return [totalDuration];
  }

  const weights = groups.map((group) => group.join(" ").length);
  const totalWeight = weights.reduce((sum, value) => sum + value, 0) || groups.length;
  const minimumBudget = minDuration * groups.length;

  if (minimumBudget >= totalDuration) {
    const equalDuration = totalDuration / groups.length;
    return groups.map(() => equalDuration);
  }

  const flexibleBudget = totalDuration - minimumBudget;
  return weights.map((weight) => minDuration + (weight / totalWeight) * flexibleBudget);
}

export function chunkNormalizedTranscript(payload, options = {}) {
  if (payload?.schemaVersion !== "subtitle-normalized/v1") {
    throw new Error("Input must be a normalized-transcript.json with schemaVersion subtitle-normalized/v1.");
  }

  const chunkMode = options.chunkMode || "basic";
  if (chunkMode !== "basic") {
    throw new Error(`Unsupported chunk mode: ${chunkMode}`);
  }

  const maxCharsPerChunk = Number(options.maxCharsPerChunk || 30);
  const maxWordsPerChunk = Number(options.maxWordsPerChunk || 12);
  const minDuration = Number(options.minDuration || 0.8);
  const sourceSegments = Array.isArray(payload.segments) ? payload.segments : [];
  const chunkedSegments = [];

  for (const segment of sourceSegments) {
    const start = Number(segment.start);
    const end = Number(segment.end);
    const text = String(segment.text || "").trim();
    if (!text || !Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      continue;
    }

    const words = text.split(/\s+/u).filter(Boolean);
    const needsSplit =
      text.length > maxCharsPerChunk || words.length > maxWordsPerChunk;

    if (!needsSplit) {
      chunkedSegments.push({
        ...segment,
        start: roundTimestamp(start),
        end: roundTimestamp(end),
        duration: roundTimestamp(end - start),
        text
      });
      continue;
    }

    const groups = splitWordsIntoGroups(words, { maxCharsPerChunk, maxWordsPerChunk });
    const durations = proportionalDurations(groups, end - start, minDuration);

    let cursor = start;
    groups.forEach((group, index) => {
      const duration = durations[index];
      const chunkStart = cursor;
      const chunkEnd = index === groups.length - 1 ? end : cursor + duration;
      cursor = chunkEnd;

      chunkedSegments.push({
        ...segment,
        id: `${segment.id || "seg"}-c${String(index + 1).padStart(2, "0")}`,
        start: roundTimestamp(chunkStart),
        end: roundTimestamp(chunkEnd),
        duration: roundTimestamp(chunkEnd - chunkStart),
        text: group.join(" "),
        words: []
      });
    });
  }

  return {
    ...payload,
    segments: chunkedSegments,
    chunking: {
      mode: "basic",
      maxCharsPerChunk,
      maxWordsPerChunk,
      minDuration,
      maxLines: Number(options.maxLines || 2),
      maxCharsPerLine: Number(options.maxCharsPerLine || 16)
    }
  };
}
