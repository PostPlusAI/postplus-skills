# Social Media Publisher Contract

This workspace wraps the Postiz Public API instead of shelling out to the Postiz CLI.

Why:

- no extra npm install is required
- the scripts stay testable with a local mock HTTP server
- request and response payloads can be stored directly as local artifacts

## Ownership model

PostPlus holds one platform-owned Postiz org and API key.
End users do not need Postiz accounts.

Channel onboarding flow:

1. PostPlus backend calls `GET /public/v1/social/{integration}` with the
   PostPlus Postiz API key
2. Postiz returns a social-platform OAuth URL (e.g. Instagram consent screen)
   and stores a `state → org` mapping in Redis for 1 hour
3. PostPlus delivers the URL to the end user via product UI or CLI
4. End user clicks the link and authorizes their social account on the
   platform's own consent screen — no Postiz account required
5. Postiz callback receives the code, resolves the org via `state`, and saves
   the channel token into the PostPlus Postiz org
6. PostPlus calls `PUT /integrations/:id/customer-name` to label the channel
   with the user's PostPlus account id

## PostPlus Cloud Boundary

All Postiz API calls from skill scripts are proxied through the PostPlus hosted
capability bridge. Scripts never hold a Postiz API key directly.

The skill contract assumes:

- channel allowlists are enforced server-side and in local request shaping
- publishing capability is either available or it fast-fails clearly
- user-facing skill docs do not ask for any Postiz credentials

The optional `POSTIZ_API_URL` remains an implementation detail for PostPlus-provided
scripts and local test doubles.

## Customer config

Path:

- `customers/<customer-id>/assets/social/postiz.config.json`

Shape:

```json
{
  "postizWorkspace": "postplus-platform",
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
- do not infer permissions from provider names alone

## Channel onboarding endpoints

Used by PostPlus backend to generate invite links and label channels:

- `GET /public/v1/social/{integration}` — generate social-platform OAuth URL;
  the returned `url` is delivered to the end user as the invite link
- `GET /integrations/customers` — list customer labels in the org
- `PUT /integrations/:id/customer-name` — assign a PostPlus account id label
  to a connected channel

## Publish request shape

Wrapper request shape:

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

Mapped Postiz request shape:

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

- `settings.__type` must be included explicitly according to the official provider docs
- `mediaUrls` are mapped to Postiz `image` objects
- every request must already know the exact integration id
- `tags` must use the official Postiz API object shape; do not send string arrays

Provider note for Facebook Pages:

- use the connected Facebook Page integration id from `GET /integrations`
- set `settings.__type` to `facebook`
- optional: `settings.url` creates a link preview in the post
- do not treat arbitrary Facebook profile URLs as writable publishing targets

Provider note for Instagram:

- use the connected Instagram integration id from `GET /integrations`
- set `settings.__type` to `instagram` for Facebook Business-linked Instagram accounts
- set `settings.__type` to `instagram-standalone` for standalone Instagram accounts
- set `settings.post_type` explicitly; Postiz documents `post` and `story`
- optional: `settings.collaborators` must be an array of `{ "label": "<username>" }` objects
- optional: `settings.is_trial_reel` and `settings.graduation_strategy` are supported for trial-reel flows
- upload images or videos first, then reference the returned uploaded URLs in `mediaUrls`
- do not assume Instagram requests can succeed without a professional Instagram account and the correct Meta scopes

## Endpoints used by this workspace

- `GET /is-connected`
- `GET /integrations`
- `GET /integration-settings/:id`
- `POST /integration-trigger/:id`
- `POST /upload`
- `POST /upload-from-url`
- `POST /posts`
- `PUT /posts/{id}/status`
- `GET /posts`
- `DELETE /posts/:id`
- `DELETE /posts/group/:group`
- `GET /posts/:id/missing`
- `PUT /posts/:id/release-id`
- `GET /analytics/:id?date=<days>`
- `GET /analytics/post/:id?date=<days>`
- `GET /notifications?page=<page>`

## Failure posture

- fail fast on missing env
- fail fast on missing customer config
- fail fast on disallowed integration ids
- fail fast on missing `settings.__type`
- fail fast on invalid `tags`
- fail fast on non-2xx Postiz responses
- always persist raw response bodies for debugging when the caller provides an output path

## Create post response shape

The official `POST /posts` response is an array like:

```json
[
  {
    "postId": "post-id",
    "integration": "integration-id"
  }
]
```

Do not assume the response includes `result.posts[*].state` or `result.posts[*].publishDate`.
