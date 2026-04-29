#!/usr/bin/env node

export function canonicalizeFacebookUrl(url) {
  const current = new URL(String(url).trim());
  current.search = "";
  current.hash = "";

  const segments = current.pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return `${current.origin}/`;
  }

  if (segments[0] === "groups" && segments[1]) {
    return `${current.origin}/groups/${segments[1]}/`;
  }

  if (
    segments.includes("posts") ||
    segments.includes("videos") ||
    segments.includes("permalink") ||
    segments[0] === "reel"
  ) {
    return `${current.origin}${current.pathname.replace(/\/+$/, "")}/`;
  }

  return `${current.origin}/${segments[0]}/`;
}

export function classifyFacebookCollectionTarget(url) {
  const current = new URL(canonicalizeFacebookUrl(url));
  const segments = current.pathname.split("/").filter(Boolean);

  if (segments[0] === "groups") {
    return "group";
  }

  if (
    segments.includes("posts") ||
    segments.includes("videos") ||
    segments.includes("permalink") ||
    segments[0] === "reel"
  ) {
    return "post";
  }

  return "profile";
}
