#!/usr/bin/env node

import path from "node:path";
import {
  cleanString,
  parseArgs,
  readJson,
  writeJson
} from "./lib/x_common.mjs";

function usage() {
  console.error(
    "Usage: node build_x_audience_graph.mjs --input <normalized-relationships.json> [--profiles <normalized-profiles.json>] [--output <graph.json>]"
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const relationshipDataset = readJson(args.input);
  const relationshipItems = Array.isArray(relationshipDataset.items) ? relationshipDataset.items : [];
  const profileDataset = args.profiles ? readJson(args.profiles) : { items: [] };
  const profileItems = Array.isArray(profileDataset.items) ? profileDataset.items : [];

  const nodeMap = new Map();
  const edgeMap = new Map();

  for (const profile of profileItems) {
    const username = cleanString(profile.username);
    if (!username) {
      continue;
    }
    nodeMap.set(username, {
      id: username,
      username,
      displayName: cleanString(profile.displayName),
      profileUrl: cleanString(profile.profileUrl),
      followersCount: profile.followersCount || 0,
      accountType: cleanString(profile.accountType) || null,
      nodeType: "profile"
    });
  }

  for (const item of relationshipItems) {
    const edge = item.relationship || item;
    const sourceUsername = cleanString(edge.sourceUsername);
    const targetUsername = cleanString(edge.targetUsername || item.username);
    const relationshipType = cleanString(edge.relationshipType);
    if (!sourceUsername || !targetUsername || !relationshipType) {
      continue;
    }

    if (!nodeMap.has(sourceUsername)) {
      nodeMap.set(sourceUsername, {
        id: sourceUsername,
        username: sourceUsername,
        nodeType: "seed"
      });
    }
    if (!nodeMap.has(targetUsername)) {
      nodeMap.set(targetUsername, {
        id: targetUsername,
        username: targetUsername,
        displayName: cleanString(item.displayName),
        profileUrl: cleanString(item.profileUrl),
        followersCount: item.followersCount || 0,
        nodeType: "audience"
      });
    }

    const key = `${sourceUsername}::${relationshipType}::${targetUsername}`;
    if (!edgeMap.has(key)) {
      edgeMap.set(key, {
        source: sourceUsername,
        target: targetUsername,
        relationshipType,
        weight: 0,
        tweetId: cleanString(edge.tweetId)
      });
    }
    edgeMap.get(key).weight += 1;
  }

  const nodes = Array.from(nodeMap.values()).sort((left, right) => {
    return (right.followersCount || 0) - (left.followersCount || 0);
  });
  const edges = Array.from(edgeMap.values()).sort((left, right) => right.weight - left.weight);

  const payload = {
    generatedAt: new Date().toISOString(),
    input: {
      relationshipsPath: path.resolve(args.input),
      profilesPath: args.profiles ? path.resolve(args.profiles) : null
    },
    nodeCount: nodes.length,
    edgeCount: edges.length,
    nodes,
    edges
  };

  if (args.output) {
    writeJson(args.output, payload);
    console.log(`Saved audience graph to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
