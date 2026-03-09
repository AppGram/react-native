# Hooks cheat sheet

Each hook is headless: returns data, `isLoading`, often `error`, `refetch`, plus setters. Most support `refreshInterval` (ms) and `skip` for lazy load where provided. Use with `AppgramProvider` mounted.

## Feedback / Wishes
- `useWishes(options?: { filters?: WishFilters; refreshInterval?: number; skip?: boolean })`
  - Returns `{ wishes, total, page, totalPages, isLoading, error, setFilters(filters), setPage(page), refetch }`
  - Includes fingerprint when voting enabled; `setFilters` resets page to 1.
- `useVote({ onVote?, onError? }?)`
  - Returns `{ vote(wishId, currentCount), unvote(wishId, voteId, currentCount), checkVote(wishId), isVoting, error }`
  - Requires `fingerprint` (default enabled); `checkVote` safe if missing.
- `useComments({ wishId, autoFetch?, refreshInterval? })`
  - Returns `{ comments, isLoading, error, isSubmitting, addComment(body, name?, email?), refetch }`

## Roadmap
- `useRoadmap({ refreshInterval? })`
  - Returns `{ roadmap, columns, totalItems, isLoading, error, refetch }`

## Releases / Changelog
- `useReleases({ limit?, page?, refreshInterval? })`
  - Returns `{ releases, isLoading, error, page, totalPages, setPage, refetch }`
- `useRelease({ releaseSlug, refreshInterval? })`
  - Returns `{ release, features, isLoading, error, refetch }`

## Help Center
- `useHelpCenter()` → `{ collection, flows, isLoading, error }`
- `useHelpFlow(slug)` → `{ flow, isLoading, error }`
- `useHelpArticle(articleSlug, flowId?)` → `{ article, isLoading, error }`

## Support & Forms
- `useSupport({ onSuccess?, onError? }?)`
  - Returns submission + auth helpers: `{ submitTicket(data), isSubmitting, error, successMessage, clearMessages, requestMagicLink(email), isSendingMagicLink, verifyToken(token), isVerifying, storedTickets, loadStoredTickets, clearStoredTickets }`
  - Stores last 50 tickets in AsyncStorage (fallback to in-memory).
- `useForm(formId, { refreshInterval?, skip? }?)`
  - `{ form, isLoading, error, refetch }`
- `useFormSubmit({ onSuccess?, onError? }?)`
  - `{ submitForm(projectId, formId, payload), isSubmitting, error }`

## Surveys
- `useSurvey(slug, { refreshInterval?, skip? }?)`
  - `{ survey, nodes, isLoading, error, refetch }`
- `useSurveySubmit({ onSuccess?, onError? }?)`
  - `{ submitResponse(surveyId, payload), isSubmitting, error }`

## Blog
- `useBlogPosts({ category?, per_page?, page?, search?, refreshInterval? }?)`
  - `{ posts, page, totalPages, setPage, setFilters, isLoading, error, refetch }`
- `useBlogPost({ slug })` → `{ post, relatedPosts, isLoading, error }`
- `useBlogCategories()` → `{ categories, isLoading, error }`
- `useFeaturedPosts()` → `{ posts, isLoading, error }`

## Status
- `useStatus({ slug, refreshInterval? })`
  - `{ data, isLoading, error, refetch }`

## Shared utilities
- `useAppgramContext()` → `{ client, config, fingerprint, theme }`
- `useAppgramTheme()` → `{ colors, spacing, radius, typography, isDark, mode }`
