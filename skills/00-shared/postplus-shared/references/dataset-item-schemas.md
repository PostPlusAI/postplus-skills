# Hosted Collection Result Record Schemas

Shared reference: the documented result-record shape for every released hosted
research key — both the `postplus research collect <collectionKey>` lane and
the `postplus research scrape <sourceKey>` lane. Use
`postplus research schema --collection-key <collectionKey> --json` for the
request-side input shape; this file documents the records that come back.

Rules:

- These tables are reading aids, not validation contracts. Hosted collection
  result records evolve; the actual collected record is always the source of
  truth. Consult this reference before writing result-processing code, then
  probe a single real record only to verify — not to rediscover the whole
  shape.
- Field lists describe top-level record keys. Nested objects are noted with
  `{}`; arrays with `[]`. Fields may be absent or `null` in real records when
  the platform did not populate them.
- Signed media URLs inside result records expire quickly. Download media to
  local files promptly and treat the URLs as ephemeral; never persist a signed
  media URL as a durable reference.

Last reviewed: 2026-07-12.

## facebook-ads-library

The richest record shape on the released surface. Top-level keys (from a real
result record):

```
ad_archive_id (string, dedupe key)   ad_id (string|null)
collation_count (number)             collation_id (string)
is_active (bool)                     page_id (string)
page_name (string)                   page_is_deleted (bool)
snapshot {}                          has_user_reported (bool)
report_count (number|null)           menu_items []
state_media_run_label (null|…)       impressions_with_index { impressions_text, impressions_index }
gated_type (string, e.g. ELIGIBLE)   categories [string]
is_aaa_eligible (bool)               contains_digital_created_media (bool)  ← NOTE: not "digitally_created"
reach_estimate (null|…)              currency (string)
spend (null|…)                       start_date / end_date (unix seconds)
start_date_formatted / end_date_formatted (string "YYYY-MM-DD HH:mm:ss")
publisher_platform [FACEBOOK|INSTAGRAM|AUDIENCE_NETWORK|MESSENGER]
contains_sensitive_content (bool)    total_active_time (null|…)
regional_regulation_data { finserv{is_deemed_finserv,is_limited_delivery}, tw_anti_scam{is_limited_delivery} }
hide_data_status (string)            fev_info (null|…)
targeted_or_reached_countries []     url (string, source Ads Library search URL)
total (number, result-set size)      position (number)
ads_count (number)                   ad_library_url (string)
```

`snapshot {}` (the creative payload — the part large-result processing usually
needs):

```
branded_content (null|…)        page_id / page_name / page_is_deleted / page_profile_uri
page_profile_picture_url        root_reshared_post (null|…)
byline (null|…)                 disclaimer_label (null|…)
event (null|…)                  caption (string, display domain)
cta_text (string)               cta_type (string, e.g. INSTALL_MOBILE_APP)
cards []                        body { text }        ← primary ad copy
display_format (VIDEO|IMAGE|…)  link_description (null|string)
link_url (string)               title (string)
images []                       videos [ { video_hd_url, video_sd_url, video_preview_image_url,
                                            watermarked_video_hd_url, watermarked_video_sd_url } ]
is_reshared (bool)              extra_links [] / extra_texts [] / extra_images [] / extra_videos []
page_categories [string]        page_like_count (number)
country_iso_code (null|…)       brazil_tax_id (null|…)
additional_info (null|…)        ec_certificates []
```

The `videos[]` / `images[]` URLs are signed CDN links with short expiry —
download promptly or treat as ephemeral (see the media-URL rule above).

## Other collection keys (`research collect`)

| collection key | top-level result-record keys |
| --- | --- |
| facebook-posts | facebookUrl, postId, pageName, url, time, timestamp, user{}, text, textReferences[], link, likes, comments, shares, topReactionsCount, viewsCount, media[], feedbackId, reactionLikeCount/LoveCount/CareCount/WowCount/HahaCount, topLevelUrl, facebookId, pageAdLibrary{}, inputUrl |
| facebook-comments | facebookUrl, commentUrl, commentId, id, feedbackId, date, text, profileUrl, profilePicture, profileId, profileName, likesCount, threadingDepth, facebookId, postTitle, pageAdLibrary{}, inputUrl |
| facebook-pages | facebookUrl, categories, info, likes, messenger, title, pageId, pageName, pageUrl, intro, websites, email, website, followers, profilePictureUrl, coverPhotoUrl, creation_date, ad_status, about_me, facebookId, pageAdLibrary{}, address, phone, rating |
| facebook-events | inputUrl, url, id, name, eventFrequency, imageUrl, dateTimeSentence, utcStartDate, startTime, isCanceled, address, childEvents[], duration, description, usersGoing, usersInterested, usersResponded, location{}, ticketsInfo, organizedBy, organizators[], eventType, isPast, isOnline, discoveryCategories, externalLinks |
| facebook-groups | facebookUrl, url, time, user{}, text, topReactionsCount, feedbackId, reactionLikeCount, reactionLoveCount, id, legacyId, likesCount, sharesCount, commentsCount, topComments[], facebookId, groupTitle, inputUrl |
| facebook-marketplace | facebookUrl, listingUrl, id, primary_listing_photo{}, listing_price{}, location{}, is_hidden/is_live/is_pending/is_sold, marketplace_listing_title, marketplace_listing_seller{}, delivery_types |
| facebook-reels | facebookUrl, inputUrl, topLevelUrl, topLevelReelUrl, text, time, playCountRounded, post_id, creation_time, feedback{}, video{}, shareable_url, playback_video{}, video_owner{}, play_count_reduced |
| facebook-search | page-search records, same family as facebook-pages: facebookUrl, categories, info, likes, title, pageId, pageName, pageUrl, phone, email, website, rating, followers, ad_status, pageAdLibrary{} |
| google-trends-fast | keyword mode: keyword, timeframe, geo, trends_url, timeline_data, region_data, data_granularity · trending mode: geo, language, timeframe_hours, max_items, trending_searches[], trends_url, timestamp |
| instagram-posts | inputUrl, id, type, shortCode, caption, hashtags, mentions, url, commentsCount, firstComment, latestComments[], likesCount, timestamp, displayUrl, images[], videoUrl, videoDuration, videoViewCount, videoPlayCount, ownerUsername, ownerFullName, ownerId, taggedUsers, coauthorProducers, childPosts, isPinned |
| instagram-profiles | inputUrl, id, username, url, fullName, biography, about{}, followersCount, followsCount, postsCount, highlightReelCount, isBusinessAccount, businessCategoryName, private, verified, externalUrl(s), profilePicUrl(HD), relatedProfiles[], latestPosts[], latestIgtvVideos[] |
| instagram-comments | id, text, ownerUsername, ownerProfilePicUrl, timestamp, likesCount, repliesCount, replies[] |
| instagram-hashtags | inputUrl, id, type, shortCode, caption, hashtags, mentions, url, commentsCount, likesCount, displayUrl, timestamp, ownerUsername, ownerId, ownerFullName, locationName, musicInfo, videoUrl, videoDuration, videoPlayCount |
| instagram-search | one of four record kinds by searchType (places/profiles/hashtags/reels); shared: searchTerm, searchSource |
| instagram-email-search | Email, title, Description, Detail_Link (only 4 documented fields — probe a real record when this key matters) |
| pinterest-search | id, title, pinner{}, date{}, type, imageURL |
| tiktok-ads-top | ad_title, brand_name, cost, ctr, favorite, id, industry_key, is_search, like, objective_key, tag, video_info{}, analytics{}, keyframe_metrics{}, cost_readable, tag_readable, ctr_readable |
| tiktok-comments | text, diggCount, replyCommentTotal, createTimeISO, uniqueId, videoWebUrl, uid, cid, avatarThumbnail · failure rows: url, input, error, errorCode |
| tiktok-profiles / tiktok-videos / tiktok-related-videos | shared video-record family: id, text, textLanguage, createTime, createTimeISO, isAd, isSponsored, authorMeta{}, musicMeta{}, webVideoUrl, mediaUrls[], videoMeta{}, diggCount, shareCount, playCount, collectCount, commentCount, mentions, hashtags, effectStickers, isPinned, isSlideshow, input |
| tiktok-users | avatar, name, nickName, verified, signature, fans, video, privateAccount, ttSeller, bioLink, id |
| youtube-channel-summary | type:"channel": channelId, channelName, channelHandle, channelUrl, description, subscriberCount, totalVideos, totalViews, joinedDate, location, country, avatarUrl, bannerUrl, isVerified, isFamilySafe, keywords, links · type:"video": videoId, title, url, thumbnailUrl, viewCount, duration, publishedText, channelName, channelId |
| youtube-comments | text, likeCount, replyCount, publishedTime, author{id,name,thumbnails}, isPinned, isHearted |
| youtube-video-download | original_url, requested_resolution, provided_resolution, title, channel, duration, thumbnail, view_count, categories, description, video_filesize, audio_filesize, downloadable_video_link, downloadable_audio_link, merged_downloadable_link, additional_metadata{} |

## Public content source keys (`research scrape`)

| source key | top-level record keys |
| --- | --- |
| facebook-profile-posts | url, post_id, user_url, user_username_raw, content, date_posted, hashtags, num_comments, num_shares, num_likes_type, likes, post_type, page_name, page_url, profile_id, profile_handle, page_intro, page_category, page_logo, page_external_website, page_likes, page_followers, page_is_verified, attachments[], video_view_count, play_count, count_reactions_type, is_sponsored, shortcode, is_page, following, original_post |
| facebook-post-by-url | url, post_id, user_url, user_username_raw, content, date_posted, num_comments, num_shares, num_likes_type, profile_id, page_logo, page_likes, page_followers, page_is_verified, attachments[], page_url, profile_handle, is_sponsored, video_view_count, likes, post_type, play_count |
| facebook-group-posts | confirmed by a real record: url, post_id, user_url, user_username_raw, content (string\|null), date_posted (ISO 8601), num_comments, num_shares, group_name, group_id, group_url, group_category, group_logo, group_members (number), group_created_at (ISO 8601), user_is_verified (bool), attachments[], post_type, likes (number\|null), profile_id · additionally documented (may appear when populated): hashtags, num_likes_type, group_intro, profile_handle, original_post_url, other_posts_url, post_external_link |
| youtube-videos | url, title, youtuber, video_url, video_length, likes, views, date_posted, description, num_comments, subscribers, video_id, channel_url, preview_image, shortcode, verified, handle_name, is_sponsored, quality, transcript, tags, is_age_restricted |
