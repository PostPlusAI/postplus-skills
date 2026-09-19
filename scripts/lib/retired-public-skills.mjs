// Authoring source; the public repository receives an exact generated projection.
export const RETIRED_PUBLIC_SKILLS = [
  'postplus-shared', 'social-media-extractor', 'generation-router', 'media-router',
  'editing-decision-engine', 'storyboard-grid-writer', 'creative-qa',
  'slideshow-producer', 'subtitle-packager', 'ugc-flow', 'workflow-creation',
  'sourcing-selection', 'shot-by-shot-analysis',
];

export function assertNoRetiredPublicSkillReferences(content, source) {
  for (const name of RETIRED_PUBLIC_SKILLS) {
    if (new RegExp(`(?<![a-z0-9-])${name}(?![a-z0-9-])`, 'u').test(content)) {
      throw new Error(`${source}: retired public skill ${name} is not allowed in membership or references.`);
    }
  }
}

