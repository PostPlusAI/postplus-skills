#!/usr/bin/env node

import {
  average,
  cleanNumber,
  cleanString,
  inferAccountTypeFromBio,
  mergeObjects,
  mergeTextList,
  normalizeContactSignals,
  normalizeCreatorType,
  normalizeUrl,
  parseArgs,
  pickMeaningful,
  pickPreferred,
  readJson,
  splitCsv,
  topLevelItems,
  uniqueBy,
  writeJson
} from "./lib/outreach_common.mjs";

function usage() {
  console.error(
    "Usage: node build_creator_leads.mjs --inputs <normalized-a.json,normalized-b.json> [--output <leads.json>]"
  );
}

function inferBio(item) {
  return (
    cleanString(item.bio) ||
    cleanString(item.signature) ||
    cleanString(item.biography) ||
    cleanString(item.description)
  );
}

function inferWebsite(item) {
  return normalizeUrl(
    cleanString(item.website) ||
    cleanString(item.bioLink) ||
    cleanString(item.link)
  );
}

function inferDisplayName(item) {
  return (
    cleanString(item.displayName) ||
    cleanString(item.fullName) ||
    cleanString(item.name)
  );
}

function inferRecentContentCount(item) {
  return (
    cleanNumber(item.recentContentCount) ??
    cleanNumber(item.recentVideosCount) ??
    cleanNumber(item.recentPostsCount) ??
    cleanNumber(item.recentTweetsCount) ??
    cleanNumber(item.matchedContentCount)
  );
}

function inferEngagementRate(item) {
  return (
    cleanNumber(item.engagementRateApprox) ??
    cleanNumber(item.averageEngagementRate)
  );
}

function inferEngagementVolume(item) {
  return (
    cleanNumber(item.engagementScore) ??
    cleanNumber(item.averageEngagementPerVideo) ??
    cleanNumber(item.averageEngagementPerPost) ??
    cleanNumber(item.averageEngagement)
  );
}

function inferCreatorType(item, platform, bio) {
  return (
    normalizeCreatorType(item.creatorType, platform, bio) ||
    normalizeCreatorType(item.accountType, platform, bio) ||
    normalizeCreatorType(inferAccountTypeFromBio(platform, bio))
  );
}

function inferRoute(item) {
  return cleanString(item.route);
}

function inferSourceEvidence(item) {
  const matchedContentCount =
    cleanNumber(item?.sourceEvidence?.matchedContentCount) ??
    cleanNumber(item.matchedContentCount) ??
    inferRecentContentCount(item);
  const topMatchedThemes = mergeTextList(
    item?.sourceEvidence?.topMatchedThemes,
    item.topMatchedThemes
  );
  const notes = mergeTextList(
    item?.sourceEvidence?.notes,
    item.notes
  );

  return {
    matchedContentCount,
    topMatchedThemes,
    notes
  };
}

function inferHintList(item, ...keys) {
  return mergeTextList(...keys.map((key) => item?.[key]));
}

function inferCommentIntentSummary(item) {
  if (item?.commentIntentSummary && typeof item.commentIntentSummary === "object") {
    return item.commentIntentSummary;
  }

  const summary = {};
  for (const key of [
    "question_or_info_request",
    "high_intent_positive",
    "objection_or_risk",
    "gratitude",
    "general_reaction"
  ]) {
    const direct = cleanNumber(item?.[key]);
    if (direct !== null) {
      summary[key] = direct;
    }
  }
  return Object.keys(summary).length ? summary : null;
}

function inferShopSignals(item) {
  const signals = {
    gmv30d: cleanNumber(item.gmv30d),
    unitsSold30d: cleanNumber(item.unitsSold30d),
    productCount30d: cleanNumber(item.productCount30d)
  };
  return Object.values(signals).some((value) => value !== null) ? signals : null;
}

function isLeadLike(item) {
  return Boolean(
    cleanString(item.platform) &&
    (
      cleanString(item.username) ||
      cleanString(item.profileUrl)
    ) &&
    (
      item.recordType === "profile" ||
      item.recordType === "shopCreator" ||
      "topicFit" in item ||
      "audienceFit" in item ||
      "sourceEvidence" in item ||
      "contactSignals" in item ||
      "fitScore" in item
    )
  );
}

function leadFromItem(item, dataset, inputPath) {
  const platform = cleanString(item.platform) || cleanString(dataset.platform);
  const bio = inferBio(item);
  const website = inferWebsite(item);
  const contactSignals = normalizeContactSignals(item.contactSignals);
  const creatorType = inferCreatorType(item, platform, bio);
  const sourceEvidence = inferSourceEvidence(item);

  return {
    platform,
    username: cleanString(item.username),
    displayName: inferDisplayName(item),
    profileUrl: cleanString(item.profileUrl),
    bio,
    website,
    route: inferRoute(item),
    creatorType,
    accountType: cleanString(item.accountType) || inferAccountTypeFromBio(platform, bio),
    topicFit: cleanNumber(item.topicFit),
    audienceFit: cleanNumber(item.audienceFit),
    geoFit: cleanNumber(item.geoFit),
    languageFit: cleanNumber(item.languageFit),
    engagementRateApprox: inferEngagementRate(item),
    engagementVolumeApprox: inferEngagementVolume(item),
    recentContentCount: inferRecentContentCount(item),
    marketFitHints: inferHintList(item, "marketFitHints"),
    languageFitHints: inferHintList(item, "languageFitHints"),
    styleFitNotes: inferHintList(item, "styleFitNotes"),
    manualChecks: inferHintList(item, "manualChecks", "brandSafetyNotes"),
    sourceEvidence,
    competitorEvidence: item?.competitorEvidence && typeof item.competitorEvidence === "object"
      ? item.competitorEvidence
      : null,
    commentIntentSummary: inferCommentIntentSummary(item),
    shopSignals: inferShopSignals(item),
    platformMetrics: item?.platformMetrics && typeof item.platformMetrics === "object"
      ? item.platformMetrics
      : null,
    recommendation: cleanString(item.recommendation),
    whyContact: mergeTextList(item.whyContact),
    whyNotPriority: mergeTextList(item.whyNotPriority),
    suggestedUseCase: cleanString(item.suggestedUseCase),
    contactability: cleanString(item.contactability),
    contactEmail: cleanString(item.contactEmail),
    contactEmailSource: cleanString(item.contactEmailSource),
    contactSignals,
    followersCount: cleanNumber(item.followersCount) ?? 0,
    suggestedAngle: cleanString(item.suggestedAngle),
    outreachReady: Boolean(item.outreachReady),
    fitScore: cleanNumber(item.fitScore),
    fitReasons: mergeTextList(item.fitReasons),
    evidenceGaps: mergeTextList(item.evidenceGaps),
    outreachStatus: cleanString(item.outreachStatus) || "new",
    draftSubject: cleanString(item.draftSubject),
    draftBody: cleanString(item.draftBody),
    lastContactedAt: cleanString(item.lastContactedAt),
    source: {
      inputPaths: [inputPath],
      actorIds: mergeTextList(dataset.actorId, item?.source?.actorId),
      sourceUrls: mergeTextList(item?.source?.sourceUrl, item.profileUrl),
      scrapedAt: mergeTextList(item?.source?.scrapedAt)
    }
  };
}

function mergeSignals(left, right) {
  return uniqueBy(
    [...normalizeContactSignals(left), ...normalizeContactSignals(right)],
    (signal) => `${signal.type?.toLowerCase()}:${signal.value?.toLowerCase()}`
  );
}

function mergeEvidence(left, right) {
  return {
    matchedContentCount: average([
      left?.matchedContentCount,
      right?.matchedContentCount
    ], 3),
    topMatchedThemes: mergeTextList(left?.topMatchedThemes, right?.topMatchedThemes),
    notes: mergeTextList(left?.notes, right?.notes)
  };
}

function mergeLead(existing, incoming) {
  const competitorEvidence = mergeObjects(existing.competitorEvidence, incoming.competitorEvidence);
  const commentIntentSummary = mergeObjects(existing.commentIntentSummary, incoming.commentIntentSummary);
  const shopSignals = mergeObjects(existing.shopSignals, incoming.shopSignals);
  const platformMetrics = mergeObjects(existing.platformMetrics, incoming.platformMetrics);
  return {
    ...existing,
    platform: pickPreferred(existing.platform, incoming.platform),
    username: pickPreferred(existing.username, incoming.username),
    displayName: pickPreferred(existing.displayName, incoming.displayName),
    profileUrl: pickPreferred(existing.profileUrl, incoming.profileUrl),
    bio: pickPreferred(existing.bio, incoming.bio),
    website: pickPreferred(existing.website, incoming.website),
    route: pickPreferred(existing.route, incoming.route),
    creatorType: pickMeaningful(existing.creatorType, incoming.creatorType),
    accountType: pickMeaningful(existing.accountType, incoming.accountType),
    topicFit: average([existing.topicFit, incoming.topicFit], 4),
    audienceFit: average([existing.audienceFit, incoming.audienceFit], 4),
    geoFit: average([existing.geoFit, incoming.geoFit], 4),
    languageFit: average([existing.languageFit, incoming.languageFit], 4),
    engagementRateApprox: average([existing.engagementRateApprox, incoming.engagementRateApprox], 6),
    engagementVolumeApprox: average([existing.engagementVolumeApprox, incoming.engagementVolumeApprox], 3),
    recentContentCount: Math.max(existing.recentContentCount || 0, incoming.recentContentCount || 0) || null,
    marketFitHints: mergeTextList(existing.marketFitHints, incoming.marketFitHints),
    languageFitHints: mergeTextList(existing.languageFitHints, incoming.languageFitHints),
    styleFitNotes: mergeTextList(existing.styleFitNotes, incoming.styleFitNotes),
    manualChecks: mergeTextList(existing.manualChecks, incoming.manualChecks),
    sourceEvidence: mergeEvidence(existing.sourceEvidence, incoming.sourceEvidence),
    competitorEvidence: Object.keys(competitorEvidence).length ? competitorEvidence : null,
    commentIntentSummary: Object.keys(commentIntentSummary).length ? commentIntentSummary : null,
    shopSignals: Object.keys(shopSignals).length ? shopSignals : null,
    platformMetrics: Object.keys(platformMetrics).length ? platformMetrics : null,
    recommendation: pickPreferred(existing.recommendation, incoming.recommendation),
    whyContact: mergeTextList(existing.whyContact, incoming.whyContact),
    whyNotPriority: mergeTextList(existing.whyNotPriority, incoming.whyNotPriority),
    suggestedUseCase: pickPreferred(existing.suggestedUseCase, incoming.suggestedUseCase),
    contactability: pickPreferred(existing.contactability, incoming.contactability),
    contactEmail: pickPreferred(existing.contactEmail, incoming.contactEmail),
    contactEmailSource: pickPreferred(existing.contactEmailSource, incoming.contactEmailSource),
    contactSignals: mergeSignals(existing.contactSignals, incoming.contactSignals),
    followersCount: Math.max(existing.followersCount || 0, incoming.followersCount || 0),
    suggestedAngle: pickPreferred(existing.suggestedAngle, incoming.suggestedAngle),
    outreachReady: Boolean(
      existing.outreachReady ||
      incoming.outreachReady ||
      existing.contactEmail ||
      incoming.contactEmail
    ),
    fitScore: pickPreferred(existing.fitScore, incoming.fitScore),
    fitReasons: mergeTextList(existing.fitReasons, incoming.fitReasons),
    evidenceGaps: mergeTextList(existing.evidenceGaps, incoming.evidenceGaps),
    outreachStatus: pickPreferred(existing.outreachStatus, incoming.outreachStatus) || "new",
    draftSubject: pickPreferred(existing.draftSubject, incoming.draftSubject),
    draftBody: pickPreferred(existing.draftBody, incoming.draftBody),
    lastContactedAt: pickPreferred(existing.lastContactedAt, incoming.lastContactedAt),
    source: {
      inputPaths: mergeTextList(existing?.source?.inputPaths, incoming?.source?.inputPaths),
      actorIds: mergeTextList(existing?.source?.actorIds, incoming?.source?.actorIds),
      sourceUrls: mergeTextList(existing?.source?.sourceUrls, incoming?.source?.sourceUrls),
      scrapedAt: mergeTextList(existing?.source?.scrapedAt, incoming?.source?.scrapedAt)
    }
  };
}

function leadKey(lead, index) {
  return `${lead.platform}:${lead.username || lead.profileUrl || index}`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.inputs) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const inputPaths = splitCsv(args.inputs);
  const merged = new Map();

  for (const inputPath of inputPaths) {
    const dataset = readJson(inputPath);
    const items = topLevelItems(dataset);
    for (const item of items) {
      if (!isLeadLike(item)) {
        continue;
      }
      const lead = leadFromItem(item, dataset, inputPath);
      const key = leadKey(lead, merged.size);
      merged.set(key, merged.has(key) ? mergeLead(merged.get(key), lead) : lead);
    }
  }

  const deduped = [...merged.values()].sort((left, right) => (right.followersCount || 0) - (left.followersCount || 0));

  const payload = {
    generatedAt: new Date().toISOString(),
    itemCount: deduped.length,
    items: deduped
  };

  if (args.output) {
    writeJson(args.output, payload);
    console.log(`Saved ${payload.itemCount} leads to ${args.output}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
