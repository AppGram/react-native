# AppgramClient reference (imperative API)

Get client: `const { client } = useAppgramContext()`. Methods return `ApiResponse<T>` unless noted.

## Wishes
- `getPublicWishes(filters?: WishFilters)` → paginated wishes (transforms raw response).
- `getWish(wishId)`
- `createWish({ title, description, author_email?, author_name?, category_id? })`

## Votes
- `checkVote(wishId, fingerprint)`
- `createVote(wishId, fingerprint, voterEmail?)`
- `deleteVote(voteId)`

## Comments
- `getComments(wishId, { page?, per_page? })` → normalizes to `CommentsResponse`.
- `createComment({ wish_id, content, author_name?, author_email?, parent_id? })`

## Roadmap
- `getRoadmapData()` (requires projectId; uses orgSlug/projectSlug when provided).

## Releases / Changelog
- Needs both `orgSlug` and `projectSlug` in provider config.
- `getReleases({ limit? })`
- `getRelease(releaseSlug)`
- `getReleaseFeatures(releaseSlug)`

## Help Center
- `getHelpCollection()` → `{ collection, flows }`
- `getHelpFlow(slug)`
- `getHelpArticle(slug, flowId)`

## Support
- `uploadFile(file)` → size limit 10MB; returns `{ url, name, size, mime_type? }`.
- `submitSupportRequest(data: SupportRequestInput)`; auto-uploads attachments first.
- `sendSupportMagicLink(email)`
- `verifySupportToken(token)` → `{ tickets, user_email }`
- `getSupportTicket(ticketId, token)`
- `addSupportMessage(ticketId, token, content)`

## Status
- `getPublicStatusOverview(slug = 'status')`

## Surveys
- `getPublicSurvey(slug)` → includes `nodes`.
- `submitSurveyResponse(surveyId, data)`
- `getPublicSurveyCustomization(surveyId)`

## Forms
- `getForm(formId)` → normalizes portal form shape.
- `trackFormView(formId)` → POST; tolerant of non-JSON responses.
- `submitForm(projectId, formId, data)` → tolerant of empty/non-JSON responses.

## Page data
- `getPageData()` → combined public payload for landing usage.

## Blog
- `getBlogPosts(filters?: BlogFilters)` → paginated transform.
- `getBlogPost(slug)`
- `getFeaturedBlogPosts()`
- `getBlogCategories()`
- `getBlogPostsByCategory(categorySlug, { page?, per_page? })`
- `getBlogPostsByTag(tag, { page?, per_page? })`
- `searchBlogPosts(query, { page?, per_page? })`
- `getRelatedBlogPosts(slug)`
