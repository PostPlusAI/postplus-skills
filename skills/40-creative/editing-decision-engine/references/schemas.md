# Core Schemas

These are working objects for edit planning.

Use them as output contracts, not rigid engineering schemas.

## `script-beat`

```json
{
  "beatId": "b03",
  "start": "0:09",
  "end": "0:18",
  "spokenText": "replying to one email turns into a whole side mission",
  "role": "pain",
  "intent": "show the task becoming bigger than it should be",
  "proofNeed": "high",
  "visualDemand": "high",
  "notes": "best moment for friction montage"
}
```

## `a-roll-moment`

```json
{
  "momentId": "a02",
  "time": "0:00-0:02",
  "type": "hook-face",
  "strength": "high",
  "reason": "expression and delivery sell the hook better than immediate cutaway",
  "recommendedTreatment": "stay on face, light punch-in"
}
```

## `b-roll-asset`

```json
{
  "assetId": "broll-old-gmail-flow",
  "path": "customers/.../broll copyGmailtextandaskChatGPTandbackemail.mp4",
  "literalContent": "leave Gmail, paste into external AI tool, return to thread",
  "proofClaim": "the old workflow is fragmented and creates a side mission",
  "bestRoles": ["pain", "contrast", "support-proof"],
  "strength": "primary",
  "idealDuration": "1.2s-3.0s",
  "repetitionRisk": "medium",
  "notes": "best when broken into short action-level inserts rather than used as one long overlay"
}
```

## `reference-pattern`

```json
{
  "patternId": "ref01",
  "source": "render-001 edited reference-style.mp4",
  "type": "structure",
  "description": "hook starts on visible A-roll, screen overlay enters early, B-roll stays action-short",
  "reuseRule": "reuse the contrast logic, not necessarily the exact timing or transitions",
  "confidence": "high"
}
```

## `edit-decision`

```json
{
  "decisionId": "d05",
  "beatId": "b03",
  "timeline": "0:09-0:13",
  "spokenText": "workflow around the writing",
  "editIntention": "make the task feel overly expanded",
  "aRollTreatment": "cut away after first stressed phrase",
  "bRollAssetIds": ["broll-old-gmail-flow"],
  "bRollUse": "primary-proof montage",
  "subtitleNote": "keep subtitle compact; let the B-roll carry detail",
  "paceNote": "fast, no long holds",
  "transitionNote": "hard cut from face into first friction action",
  "fallback": "if montage is weak, use tab-switch and copy-paste steps only"
}
```

## Recommended Output Package

For most jobs, produce:

### 1. `edit-brief`

```json
{
  "videoId": "female-1-th-002",
  "editThesis": "one email becomes a side mission when the workflow leaves Gmail",
  "mode": "comparison-led",
  "targetLength": "35s-50s",
  "referenceBasis": ["render-001 edited reference-style.mp4"]
}
```

### 2. `beat-map`

Array of `script-beat`

### 3. `asset-inventory`

Array of `b-roll-asset`

### 4. `decision-timeline`

Array of `edit-decision`

### 5. `risk-log`

```json
[
  {
    "risk": "homepage discovery footage cannot replace direct Gmail action proof",
    "impact": "high",
    "mitigation": "use homepage footage only as discovery or support proof"
  }
]
```

## Heuristic Fields

Useful label sets:

### proof need

- `low`
- `medium`
- `high`

### visual demand

- `low`
- `medium`
- `high`

### edit mode

- `stay-face`
- `face-to-proof`
- `proof-to-face`
- `montage`
- `full-broll`
- `hybrid-overlay`

### B-roll role

- `primary-proof`
- `support-proof`
- `transition-cover`
- `pace-reset`
- `visual-filler`

These labels are simple on purpose. The point is to make edit reasoning stable and reusable.
