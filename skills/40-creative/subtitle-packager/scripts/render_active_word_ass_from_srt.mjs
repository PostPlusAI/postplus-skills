#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith("--")) {
      continue;
    }
    const key = current.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

function usage() {
  console.error(
    "Usage: node render_active_word_ass_from_srt.mjs --input <source.srt> --output <subtitles.ass> [--profile <profile.json>]"
  );
}

function readText(filePath) {
  return fs.readFileSync(path.resolve(filePath), "utf8");
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function ensureDir(targetPath) {
  fs.mkdirSync(path.resolve(targetPath), { recursive: true });
}

function writeText(filePath, text) {
  ensureDir(path.dirname(path.resolve(filePath)));
  fs.writeFileSync(path.resolve(filePath), text);
}

function srtTimeToSeconds(value) {
  const match = String(value || "")
    .trim()
    .match(/^(\d{2}):(\d{2}):(\d{2})[,.:](\d{3})$/u);
  if (!match) {
    throw new Error(`Invalid SRT timestamp: ${value}`);
  }
  const [, hh, mm, ss, ms] = match;
  return Number(hh) * 3600 + Number(mm) * 60 + Number(ss) + Number(ms) / 1000;
}

function assTime(seconds) {
  const totalCs = Math.max(0, Math.round(Number(seconds || 0) * 100));
  const hours = Math.floor(totalCs / 360000);
  const minutes = Math.floor((totalCs % 360000) / 6000);
  const secs = Math.floor((totalCs % 6000) / 100);
  const centis = totalCs % 100;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;
}

function escapeAssText(text) {
  return String(text || "")
    .replace(/\\/gu, "\\\\")
    .replace(/\{/gu, "\\{")
    .replace(/\}/gu, "\\}");
}

function normalizeSegmentText(text) {
  return String(text || "")
    .replace(/\r\n/gu, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/gu, " ")
    .trim();
}

function parseSrt(content) {
  const blocks = String(content || "")
    .replace(/\r\n/gu, "\n")
    .trim()
    .split(/\n{2,}/u)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks
    .map((block, index) => {
      const lines = block.split("\n");
      const timeLine = lines.find((line) => line.includes("-->"));
      if (!timeLine) {
        return null;
      }
      const textLines = lines.slice(lines.indexOf(timeLine) + 1);
      const [startRaw, endRaw] = timeLine.split("-->").map((part) => part.trim());
      const text = normalizeSegmentText(textLines.join(" "));
      if (!text) {
        return null;
      }
      const start = srtTimeToSeconds(startRaw);
      const end = srtTimeToSeconds(endRaw);
      if (!(end > start)) {
        return null;
      }
      return {
        id: `seg-${String(index + 1).padStart(3, "0")}`,
        start,
        end,
        text
      };
    })
    .filter(Boolean);
}

function splitWords(text) {
  return normalizeSegmentText(text)
    .split(/\s+/u)
    .filter(Boolean)
    .map((value, index) => ({
      index,
      raw: value,
      weight: Math.max(
        1,
        String(value)
          .replace(/[^A-Za-z0-9']+/gu, "")
          .length
      )
    }));
}

function allocateWordDurations(words, segmentDurationSeconds) {
  const totalCs = Math.max(words.length, Math.round(segmentDurationSeconds * 100));
  const minCs = totalCs >= words.length ? 1 : 0;
  const remainingCs = totalCs - minCs * words.length;
  const totalWeight = words.reduce((sum, word) => sum + word.weight, 0) || words.length;

  const provisional = words.map((word) => {
    const raw = remainingCs * (word.weight / totalWeight);
    const floor = Math.floor(raw);
    return {
      ...word,
      assigned: minCs + floor,
      remainder: raw - floor
    };
  });

  let distributed = provisional.reduce((sum, word) => sum + word.assigned, 0);
  let leftover = totalCs - distributed;

  provisional
    .slice()
    .sort((a, b) => b.remainder - a.remainder)
    .forEach((word) => {
      if (leftover <= 0) {
        return;
      }
      const target = provisional.find((item) => item.index === word.index);
      target.assigned += 1;
      leftover -= 1;
    });

  distributed = provisional.reduce((sum, word) => sum + word.assigned, 0);
  if (distributed !== totalCs && provisional.length > 0) {
    provisional[provisional.length - 1].assigned += totalCs - distributed;
  }

  return provisional.map((word) => word.assigned);
}

function wrapWordRows(words, { maxLines = 2, maxCharsPerLine = 18 } = {}) {
  const rows = [];
  let currentRow = [];
  let currentLength = 0;

  for (const word of words) {
    const nextLength = currentRow.length === 0 ? word.raw.length : currentLength + 1 + word.raw.length;
    if (currentRow.length > 0 && nextLength > maxCharsPerLine && rows.length < maxLines - 1) {
      rows.push(currentRow);
      currentRow = [word];
      currentLength = word.raw.length;
      continue;
    }
    currentRow.push(word);
    currentLength = nextLength;
  }

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  if (rows.length <= maxLines) {
    return rows;
  }

  const kept = rows.slice(0, maxLines - 1);
  kept.push(rows.slice(maxLines - 1).flat());
  return kept;
}

function renderWordRows(rows, activeWordIndex, profile) {
  const render = profile.render || {};
  const activeWord = profile.activeWord || {};
  const activeStyle = [
    activeWord.primaryColour ? `\\c${activeWord.primaryColour}` : "",
    activeWord.outlineColour ? `\\3c${activeWord.outlineColour}` : "",
    activeWord.borderColour ? `\\4c${activeWord.borderColour}` : "",
    activeWord.outline !== undefined ? `\\bord${activeWord.outline}` : "",
    activeWord.shadow !== undefined ? `\\shad${activeWord.shadow}` : "",
    activeWord.blur !== undefined ? `\\blur${activeWord.blur}` : "",
    activeWord.scaleX !== undefined ? `\\fscx${activeWord.scaleX}` : "",
    activeWord.scaleY !== undefined ? `\\fscy${activeWord.scaleY}` : "",
    activeWord.bold !== undefined ? `\\b${activeWord.bold}` : ""
  ]
    .filter(Boolean)
    .join("");

  return rows
    .map((row) =>
      row
        .map((word) => {
          const renderedWord = render.uppercase ? word.raw.toUpperCase() : word.raw;
          const escapedWord = escapeAssText(renderedWord);
          if (word.index !== activeWordIndex) {
            return escapedWord;
          }
          return `{${activeStyle}}${escapedWord}{\\r}`;
        })
        .join(" ")
    )
    .join("\\N");
}

function buildEvents(segments, profile) {
  const events = [];
  const layout = profile.layout || {};

  for (const segment of segments) {
    const words = splitWords(segment.text);
    if (words.length === 0) {
      continue;
    }

    const rows = wrapWordRows(words, {
      maxLines: Number(layout.maxLines || 2),
      maxCharsPerLine: Number(layout.maxCharsPerLine || 18)
    });
    const durationsCs = allocateWordDurations(words, segment.end - segment.start);

    let cursor = segment.start;
    words.forEach((word, wordIndex) => {
      const durationSeconds = durationsCs[wordIndex] / 100;
      const start = cursor;
      const end = wordIndex === words.length - 1 ? segment.end : cursor + durationSeconds;
      cursor = end;
      events.push({
        start,
        end,
        text: renderWordRows(rows, word.index, profile)
      });
    });
  }

  return events.filter((event) => event.end > event.start);
}

function buildAss(events, profile) {
  const script = profile.script || {};
  const style = profile.style || {};
  const styleName = style.name || "Default";

  const scriptInfo = [
    "[Script Info]",
    "ScriptType: v4.00+",
    `PlayResX: ${script.playResX || 720}`,
    `PlayResY: ${script.playResY || 1280}`,
    `WrapStyle: ${script.wrapStyle ?? 2}`,
    `ScaledBorderAndShadow: ${script.scaledBorderAndShadow || "yes"}`,
    ""
  ];

  const styles = [
    "[V4+ Styles]",
    "Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding",
    `Style: ${[
      styleName,
      style.fontname || "Arial",
      style.fontsize ?? 48,
      style.primaryColour || "&H00FFFFFF",
      style.secondaryColour || "&H00FFFFFF",
      style.outlineColour || "&H00111111",
      style.backColour || "&H00000000",
      style.bold ?? 1,
      style.italic ?? 0,
      style.underline ?? 0,
      style.strikeOut ?? 0,
      style.scaleX ?? 100,
      style.scaleY ?? 100,
      style.spacing ?? 0,
      style.angle ?? 0,
      style.borderStyle ?? 1,
      style.outline ?? 3,
      style.shadow ?? 0,
      style.alignment ?? 2,
      style.marginL ?? 48,
      style.marginR ?? 48,
      style.marginV ?? 170,
      style.encoding ?? 1
    ].join(",")}`,
    ""
  ];

  const eventLines = events.map(
    (event) =>
      `Dialogue: 0,${assTime(event.start)},${assTime(event.end)},${styleName},,0,0,0,,${event.text}`
  );

  const eventsSection = [
    "[Events]",
    "Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text",
    ...eventLines,
    ""
  ];

  return [...scriptInfo, ...styles, ...eventsSection].join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input || !args.output) {
    usage();
    process.exitCode = 1;
    return;
  }

  const profilePath = args.profile
    ? path.resolve(args.profile)
    : path.resolve("skills/40-creative/subtitle-packager/profiles/active-word-social.json");

  console.log(`[subtitle] reading srt: ${path.resolve(args.input)}`);
  console.log(`[subtitle] using profile: ${profilePath}`);

  const srt = readText(args.input);
  const profile = readJson(profilePath);
  const segments = parseSrt(srt);
  console.log(`[subtitle] parsed segments: ${segments.length}`);

  const events = buildEvents(segments, profile);
  console.log(`[subtitle] generated word events: ${events.length}`);

  writeText(args.output, buildAss(events, profile));
  console.log(`[subtitle] wrote ass: ${path.resolve(args.output)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
