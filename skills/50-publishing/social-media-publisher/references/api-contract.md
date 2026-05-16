# Social Media Publisher Contract

This workspace wraps the PostPlus social publishing capability instead of
shelling out to a third-party CLI.

Why:

- no extra npm install is required
- the scripts stay testable with a local mock HTTP server
- request and response payloads can be stored directly as local artifacts

## Ownership model

PostPlus holds one platform-owned social publishing workspace.
End users do not need separate publishing-service accounts.

Channel onboarding flow:

1. PostPlus backend asks PostPlus Cloud to create an invite link for the target
   social platform
2. PostPlus returns a social-platform OAuth URL (e.g. Instagram consent screen)
3. PostPlus delivers the URL to the end user via product UI or CLI
4. End user clicks the link and authorizes their social account on the
   platform's own consent screen
5. PostPlus saves the resulting channel token into the social publishing
   workspace
6. PostPlus labels the channel with the user's PostPlus account id

## PostPlus Cloud Boundary

All remote publishing calls from skill scripts are proxied through the PostPlus
hosted capability bridge. Scripts never hold publishing credentials directly.

All social publishing script request files are hosted execution envelopes:

```json
{
  "schemaVersion": 1,
  "input": {
    "...": "social publishing request"
  }
}
```

The social publishing request shapes below are the envelope's `input` value.
Do not pass a bare publish request object as the final `--request` file.

The skill contract assumes:

- channel allowlists are enforced server-side and in local request shaping
- publishing capability is either available or it fast-fails clearly
- user-facing skill docs do not ask for third-party publishing-service credentials

The optional local test URL remains an implementation detail for
PostPlus-provided scripts and local test doubles.

## Customer config

Path:

- `customers/<customer-id>/assets/social/social-publishing.config.json`

Shape:

```json
{
  "socialPublishingWorkspace": "postplus-platform",
  "allowedIntegrationIds": [],
  "defaultPlatforms": []
}
```

Rules:

- `allowedIntegrationIds` is the enforcement boundary; it contains the
  integration ids that were onboarded for this PostPlus account via the
  invite-link flow
- an empty array means "no channels connected yet" and must fail for publish
  actions
- do not infer permissions from platform names alone

## Channel Onboarding Operations

Used by PostPlus backend to generate invite links and label channels:

- create invite link for the target social platform
- list channel account labels in the workspace
- assign a PostPlus account id label to a connected channel

## Publish Request Shape

Domain request shape:

```json
{
  "type": "draft",
  "date": "2026-04-05T12:00:00.000Z",
  "shortLink": false,
  "tags": [],
  "posts": [
    {
      "integrationId": "integration-id",
      "settings": {
        "__type": "discord",
        "channel": "discord-channel-id"
      },
      "value": [
        {
          "content": "hello from vibe_marketing",
          "delay": 0,
          "mediaUrls": []
        }
      ]
    }
  ]
}
```

Executable request file:

```json
{
  "schemaVersion": 1,
  "input": {
    "type": "draft",
    "date": "2026-04-05T12:00:00.000Z",
    "shortLink": false,
    "tags": [],
    "posts": [
      {
        "integrationId": "integration-id",
        "settings": {
          "__type": "discord",
          "channel": "discord-channel-id"
        },
        "value": [
          {
            "content": "hello from vibe_marketing",
            "delay": 0,
            "mediaUrls": []
          }
        ]
      }
    ]
  }
}
```

Mapped remote request shape:

```json
{
  "type": "draft",
  "date": "2026-04-05T12:00:00.000Z",
  "shortLink": false,
  "tags": [],
  "posts": [
    {
      "integration": {
        "id": "integration-id"
      },
      "settings": {
        "__type": "discord",
        "channel": "discord-channel-id"
      },
      "value": [
        {
          "content": "hello from vibe_marketing",
          "delay": 0,
          "image": []
        }
      ]
    }
  ]
}
```

Notes:

- `settings.__type` must be included explicitly according to the connected
  channel type
- `mediaUrls` are mapped to remote `image` objects
- every request must already know the exact integration id
- `tags` must use the official publishing API object shape; do not send string arrays

Platform note for Facebook Pages:

- use the connected Facebook Page integration id from the channel list
- set `settings.__type` to `facebook`
- optional: `settings.url` creates a link preview in the post
- do not treat arbitrary Facebook profile URLs as writable publishing targets

Platform note for Instagram:

- use the connected Instagram integration id from the channel list
- set `settings.__type` to `instagram` for Facebook Business-linked Instagram accounts
- set `settings.__type` to `instagram-standalone` for standalone Instagram accounts
- set `settings.post_type` explicitly; supported values include `post` and `story`
- optional: `settings.collaborators` must be an array of `{ "label": "<username>" }` objects
- optional: `settings.is_trial_reel` and `settings.graduation_strategy` are supported for trial-reel flows
- upload images or videos first, then reference the returned uploaded URLs in `mediaUrls`
- do not assume Instagram requests can succeed without a professional Instagram account and the correct Meta scopes

## Operations Used By This Workspace

- list connected channels
- read channel settings
- trigger channel setup helpers
- upload media from local files or URLs
- create post drafts or scheduled posts
- update post status after approval
- list posts
- delete one post after approval
- delete a post group after approval
- inspect missing media content
- attach a release id after approval
- read platform analytics
- read post analytics
- list notifications

## Failure posture

- fail fast on missing env
- fail fast on missing customer config
- fail fast on disallowed integration ids
- fail fast on missing `settings.__type`
- fail fast on invalid `tags`
- fail fast on non-2xx remote publishing responses
- always persist raw response bodies for debugging when the caller provides an output path

## Create post response shape

The create-post operation response is an array like:

```json
[
  {
    "postId": "post-id",
    "integration": "integration-id"
  }
]
```

Do not assume the response includes `result.posts[*].state` or `result.posts[*].publishDate`.
