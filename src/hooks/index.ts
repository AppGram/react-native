/**
 * Hook Exports
 *
 * Headless hooks for building custom UI implementations.
 * All hooks follow a consistent pattern with loading state, error handling, and refetch capabilities.
 */

export { useWishes, type UseWishesOptions, type UseWishesResult } from './useWishes'
export { useVote, type UseVoteOptions, type UseVoteResult } from './useVote'
export {
  useSupport,
  type UseSupportOptions,
  type UseSupportResult,
  type SupportSubmitData,
  type StoredTicket,
} from './useSupport'
export {
  useContactForm,
  useContactFormSubmit,
  type UseContactFormOptions,
  type UseContactFormResult,
  type UseContactFormSubmitOptions,
  type UseContactFormSubmitResult,
} from './useContactForm'
export {
  useHelpCenter,
  useHelpFlow,
  useHelpArticle,
  type UseHelpCenterResult,
  type UseHelpFlowResult,
  type UseHelpArticleResult,
} from './useHelpCenter'
export { useStatus, type UseStatusOptions, type UseStatusResult } from './useStatus'
export { useComments, type UseCommentsOptions, type UseCommentsResult } from './useComments'
export {
  useReleases,
  useRelease,
  type UseReleasesOptions,
  type UseReleasesResult,
  type UseReleaseOptions,
  type UseReleaseResult,
} from './useReleases'
export { useRoadmap, type UseRoadmapOptions, type UseRoadmapResult } from './useRoadmap'
export {
  useSurvey,
  useSurveySubmit,
  type UseSurveyOptions,
  type UseSurveyResult,
  type UseSurveySubmitOptions,
  type UseSurveySubmitResult,
} from './useSurvey'
export {
  useBlogPosts,
  useBlogPost,
  useBlogCategories,
  useFeaturedPosts,
  type UseBlogPostsOptions,
  type UseBlogPostsResult,
  type UseBlogPostOptions,
  type UseBlogPostResult,
  type UseBlogCategoriesOptions,
  type UseBlogCategoriesResult,
  type UseFeaturedPostsOptions,
  type UseFeaturedPostsResult,
} from './useBlog'
