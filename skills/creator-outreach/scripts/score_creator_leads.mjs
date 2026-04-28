#!/usr/bin/env node

import {
  cleanNumber,
  cleanString,
  countKeywordMatches,
  followerScore,
  mergeTextList,
  normalizeCreatorType,
  parseArgs,
  readJson,
  splitCsv,
  tokenizeKeywords,
  writeJson
} from "./lib/outreach_common.mjs";

function usage() {
  console.error(
    "Usage: node score_creator_leads.mjs --input <enriched-leads.json> [--brief <brand-brief.json>] [--platforms tiktok,instagram,x] [--output <scored-leads.json>]"
  );
}

function buildKeywordSet(brief) {
  if (!brief) {
    return [];
  }
  const sources = [
    brief.niche,
    brief.whyYou,
    brief.productName,
    brief.brandName,
    ...(Array.isArray(brief.keywords) ? brief.keywords : [])
  ];
  return tokenizeKeywords(sources.join(" "));
}

function scoreFromApprox(value, multiplier, cap) {
  const numeric = cleanNumber(value);
  if (numeric === null) {
    return 0;
  }
  return Math.min(numeric * multiplier, cap);
}

function sumCommentIntent(summary) {
  if (!summary || typeof summary !== "object") {
    return 0;
  }
  return (
    (cleanNumber(summary.high_intent_positive) || 0) +
    (cleanNumber(summary.question_or_info_request) || 0) * 0.6 -
    (cleanNumber(summary.objection_or_risk) || 0) * 0.4
  );
}

function computeEvidenceGaps(lead) {
  const gaps = [...(lead.evidenceGaps || [])];
  if (
    cleanNumber(lead.audienceFit) === null &&
    cleanNumber(lead.geoFit) === null &&
    !(lead.marketFitHints || []).length
  ) {
    gaps.push("manual check required: market fit");
  }
  if (
    cleanNumber(lead.languageFit) === null &&
    !(lead.languageFitHints || []).length
  ) {
    gaps.push("manual check required: language fit");
  }
  if (!(lead.styleFitNotes || []).length) {
    gaps.push("manual check required: style fit");
  }
  return [...new Set(gaps)];
}

function scoreLead(lead, context) {
  const fitReasons = [...(lead.fitReasons || [])];
  const whyContact = [...(lead.whyContact || [])];
  const whyNotPriority = [...(lead.whyNotPriority || [])];
  let score = 0;

  const followerPoints = followerScore(lead.followersCount);
  score += followerPoints;
  if (followerPoints >= 22) {
    fitReasons.push("strong audience scale");
    whyContact.push("audience scale is strong enough to justify outreach");
  } else if (followerPoints <= 5) {
    whyNotPriority.push("audience scale is relatively small for this batch");
  }

  if (lead.contactEmail) {
    score += 25;
    whyContact.push("public email is available");
  } else if ((lead.contactSignals || []).some((signal) => signal.type === "website" || signal.type === "bioLink")) {
    score += 12;
    whyContact.push("public link or website is available");
  } else {
    fitReasons.push("no direct contact signal");
    whyNotPriority.push("no public contact path found");
  }

  const keywordHaystack = [
    cleanString(lead.bio),
    cleanString(lead.displayName),
    ...(lead.sourceEvidence?.topMatchedThemes || []),
    ...(lead.sourceEvidence?.notes || []),
    ...(lead.marketFitHints || []),
    ...(lead.languageFitHints || [])
  ].filter(Boolean).join(" ");
  const keywordMatches = countKeywordMatches(keywordHaystack, context.keywords);
  score += Math.min(keywordMatches * 7, 24);
  if (keywordMatches > 0) {
    fitReasons.push(`keyword match x${keywordMatches}`);
    whyContact.push("visible profile or source evidence aligns with the target niche");
  } else if (context.keywords.length) {
    fitReasons.push("weak niche match");
    whyNotPriority.push("niche match is weak from current visible evidence");
  }

  const creatorType = normalizeCreatorType(lead.creatorType || lead.accountType, lead.platform, lead.bio);
  if (creatorType === "individual_creator") {
    score += 10;
    fitReasons.push("creator type: individual creator");
  } else if (creatorType === "educator_consultant") {
    score += 6;
    fitReasons.push("creator type: educator/consultant");
  } else if (creatorType === "brand_product_account") {
    score -= 12;
    whyNotPriority.push("account appears to be a brand or product account");
  } else if (creatorType === "aggregator" || creatorType === "media_meme") {
    score -= 8;
    whyNotPriority.push("account appears to be an aggregator or media-style page");
  }

  if (context.platforms.length && context.platforms.includes(lead.platform)) {
    score += 6;
  }

  const route = cleanString(lead.route);
  if (["content-first", "graph-first", "mixed"].includes(route)) {
    score += 8;
    fitReasons.push(`route evidence: ${route}`);
  } else if (route === "handle-first") {
    score += 3;
  }

  const topicFit = cleanNumber(lead.topicFit);
  if (topicFit !== null) {
    score += Math.min(topicFit * 18, 18);
    fitReasons.push("explicit topic fit evidence");
  }

  const audienceFit = cleanNumber(lead.audienceFit);
  if (audienceFit !== null) {
    score += Math.min(audienceFit * 12, 12);
    fitReasons.push("explicit audience fit evidence");
  }

  const geoFit = cleanNumber(lead.geoFit);
  if (geoFit !== null) {
    score += Math.min(geoFit * 6, 6);
  }

  const languageFit = cleanNumber(lead.languageFit);
  if (languageFit !== null) {
    score += Math.min(languageFit * 6, 6);
  }

  const engagementRatePoints = scoreFromApprox(lead.engagementRateApprox, 1200, 18);
  if (engagementRatePoints > 0) {
    score += engagementRatePoints;
    fitReasons.push("recent engagement rate evidence");
  }

  const engagementVolumePoints = scoreFromApprox(lead.engagementVolumeApprox, 1 / 120, 8);
  if (engagementVolumePoints > 0) {
    score += engagementVolumePoints;
  }

  const recentContentPoints = Math.min((cleanNumber(lead.recentContentCount) || 0) * 1.2, 8);
  if (recentContentPoints > 0) {
    score += recentContentPoints;
  }

  const matchedContentCount = cleanNumber(lead?.sourceEvidence?.matchedContentCount) || 0;
  if (matchedContentCount > 0) {
    score += Math.min(matchedContentCount * 2.5, 8);
    fitReasons.push("matched content evidence exists");
  }

  const commentIntentScore = sumCommentIntent(lead.commentIntentSummary);
  if (commentIntentScore > 0) {
    score += Math.min(commentIntentScore, 8);
    fitReasons.push("comment intent signal present");
  } else if (commentIntentScore < 0) {
    score += Math.max(commentIntentScore, -6);
    whyNotPriority.push("comments contain objections or risk signals");
  }

  if (lead.shopSignals && typeof lead.shopSignals === "object") {
    const shopProof =
      scoreFromApprox(lead.shopSignals.gmv30d, 1 / 5000, 8) +
      scoreFromApprox(lead.shopSignals.unitsSold30d, 1 / 40, 6);
    if (shopProof > 0) {
      score += Math.min(shopProof, 10);
      fitReasons.push("commerce proof signal present");
    }
  }

  if (lead.competitorEvidence && typeof lead.competitorEvidence === "object") {
    score += 5;
    fitReasons.push("competitor adjacency evidence present");
  }

  const evidenceGaps = computeEvidenceGaps(lead);
  if (evidenceGaps.length >= 3) {
    score -= 4;
  }

  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));
  const recommendation =
    normalizedScore >= 70 ? "strong_yes" :
    normalizedScore >= 45 ? "maybe" :
    "not_now";
  const suggestedUseCase =
    lead.platform === "tiktok" ? "content_collab" :
    lead.platform === "instagram" ? "creator_partnership" :
    "thought_leadership_outreach";
  const suggestedAngle =
    topicFit !== null || keywordMatches > 0
      ? "Lead with specific overlap from the creator's content and a concrete collaboration angle."
      : "Lead cautiously. Use concrete evidence from their recent content instead of assuming strong fit.";

  return {
    ...lead,
    creatorType,
    recommendation,
    whyContact: [...new Set(whyContact)],
    whyNotPriority: [...new Set(whyNotPriority)],
    suggestedUseCase,
    suggestedAngle,
    fitScore: normalizedScore,
    fitReasons: [...new Set(fitReasons)],
    evidenceGaps,
    outreachReady: Boolean(lead.contactEmail || (lead.contactSignals || []).length)
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const payload = readJson(args.input);
  const brief = args.brief ? readJson(args.brief) : null;
  const context = {
    brief,
    keywords: buildKeywordSet(brief),
    platforms: splitCsv(args.platforms)
  };

  const items = (payload.items || [])
    .map((lead) => scoreLead(lead, context))
    .sort((left, right) => (right.fitScore || 0) - (left.fitScore || 0));

  const output = {
    ...payload,
    scoredAt: new Date().toISOString(),
    scoringContext: {
      brief,
      keywords: context.keywords,
      preferredPlatforms: context.platforms
    },
    itemCount: items.length,
    items
  };

  if (args.output) {
    writeJson(args.output, output);
    console.log(`Saved ${output.itemCount} scored leads to ${args.output}`);
    return;
  }

  console.log(JSON.stringify(output, null, 2));
}

main();
