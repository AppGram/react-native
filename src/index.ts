/**
 * @appgram/react-native
 *
 * React Native SDK for Appgram - feature voting, roadmaps, changelogs,
 * help center, support, surveys, blog, and status pages.
 *
 * @example
 * ```tsx
 * import { AppgramProvider, WishList, SupportForm } from '@appgram/react-native'
 *
 * function App() {
 *   return (
 *     <AppgramProvider
 *       config={{
 *         projectId: 'your-project-id',
 *         orgSlug: 'your-org',
 *         projectSlug: 'your-project',
 *       }}
 *     >
 *       <NavigationContainer>
 *         <Stack.Navigator>
 *           <Stack.Screen name="Feedback" component={FeedbackScreen} />
 *           <Stack.Screen name="Support" component={SupportScreen} />
 *         </Stack.Navigator>
 *       </NavigationContainer>
 *     </AppgramProvider>
 *   )
 * }
 *
 * function FeedbackScreen() {
 *   return <WishList onWishPress={(wish) => console.log(wish)} />
 * }
 *
 * function SupportScreen() {
 *   return <SupportForm onSuccess={() => Alert.alert('Submitted!')} />
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Using headless hooks for custom UI
 * import { useWishes, useVote } from '@appgram/react-native'
 *
 * function CustomWishList() {
 *   const { wishes, isLoading, refetch } = useWishes({
 *     filters: { status: 'pending', sort_by: 'votes' },
 *   })
 *   const { vote, unvote, checkVote } = useVote()
 *
 *   // Build your own UI...
 * }
 * ```
 */

// Provider
export {
  AppgramProvider,
  useAppgramContext,
  useAppgramTheme,
  type AppgramProviderProps,
  type AppgramConfig,
  type AppgramTheme,
  type ThemeMode,
} from './provider'

// Client
export { AppgramClient, type AppgramClientConfig } from './client'

// Hooks
export {
  useWishes,
  useVote,
  useComments,
  useRoadmap,
  useReleases,
  useRelease,
  useHelpCenter,
  useHelpFlow,
  useHelpArticle,
  useSupport,
  useSurvey,
  useSurveySubmit,
  useForm,
  useFormSubmit,
  useStatus,
  useBlogPosts,
  useBlogPost,
  useBlogCategories,
  useFeaturedPosts,
  type UseWishesOptions,
  type UseWishesResult,
  type UseVoteOptions,
  type UseVoteResult,
  type UseCommentsOptions,
  type UseCommentsResult,
  type UseRoadmapOptions,
  type UseRoadmapResult,
  type UseReleasesOptions,
  type UseReleasesResult,
  type UseReleaseOptions,
  type UseReleaseResult,
  type UseHelpCenterResult,
  type UseHelpFlowResult,
  type UseHelpArticleResult,
  type UseSupportOptions,
  type UseSupportResult,
  type SupportSubmitData,
  type StoredTicket,
  type UseSurveyOptions,
  type UseSurveyResult,
  type UseSurveySubmitOptions,
  type UseSurveySubmitResult,
  type UseFormOptions,
  type UseFormResult,
  type UseFormSubmitOptions,
  type UseFormSubmitResult,
  type UseStatusOptions,
  type UseStatusResult,
  type UseBlogPostsOptions,
  type UseBlogPostsResult,
  type UseBlogPostOptions,
  type UseBlogPostResult,
  type UseBlogCategoriesOptions,
  type UseBlogCategoriesResult,
  type UseFeaturedPostsOptions,
  type UseFeaturedPostsResult,
} from './hooks'

// Components
export {
  // Base components
  Button,
  Card,
  Badge,
  Input,
  type ButtonProps,
  type CardProps,
  type BadgeProps,
  type InputProps,
  // Feedback components
  VoteButton,
  WishCard,
  WishList,
  WishDetailModal,
  SubmitWishSheet,
  type VoteButtonProps,
  type WishCardProps,
  type WishListProps,
  type WishDetailModalProps,
  type SubmitWishSheetProps,
  // Support components
  SupportForm,
  type SupportFormProps,
  // Forms components
  FormRenderer,
  type FormRendererProps,
  // Help components
  HelpFlowCard,
  HelpArticleCard,
  HelpCenter,
  HelpFlowDetail,
  HelpArticleDetail,
  type HelpFlowCardProps,
  type HelpArticleCardProps,
  type HelpCenterProps,
  type HelpFlowDetailProps,
  type HelpArticleDetailProps,
  // Status components
  StatusBoard,
  type StatusBoardProps,
  // Releases components
  ReleaseList,
  ReleaseDetail,
  Releases,
  type ReleaseListProps,
  type ReleaseDetailProps,
  type ReleasesProps,
  // Roadmap components
  RoadmapBoard,
  type RoadmapBoardProps,
  // Survey components
  SurveyForm,
  type SurveyFormProps,
  // Chat components
  ChatScreen,
  type ChatScreenProps,
  // Blog components
  Blog,
  BlogList,
  BlogCard,
  BlogPostDetail,
  type BlogProps,
  type BlogListProps,
  type BlogCardProps,
  type BlogPostDetailProps,
} from './components'

// Theme
export {
  lightColors,
  darkColors,
  spacing,
  radius,
  typography,
  type AppgramColors,
} from './theme'

// Types
export type {
  // Wish types
  Wish,
  WishStatus,
  WishFilters,
  WishesResponse,
  WishAuthor,
  Category,
  // Vote types
  Vote,
  VoteCheckResponse,
  // Comment types
  Comment,
  CommentAuthor,
  CommentCreateInput,
  CommentsResponse,
  // Roadmap types
  RoadmapColumn,
  RoadmapItem,
  RoadmapData,
  // Release types
  Release,
  ReleaseFeature,
  // Help types
  HelpCollection,
  HelpFlow,
  HelpArticle,
  ArticleType,
  FlowDisplayType,
  // Support types
  SupportRequest,
  SupportMessage,
  SupportAttachment,
  SupportRequestInput,
  SupportRequestStatus,
  SupportRequestPriority,
  SupportRequestCategory,
  // Survey types
  Survey,
  SurveyNode,
  SurveyNodeOption,
  SurveyQuestionType,
  SurveyResponse,
  SurveyAnswer,
  SurveySubmitInput,
  // Form types
  Form,
  FormField,
  FormFieldType,
  FormSubmission,
  // Status types
  StatusPage,
  StatusPageService,
  StatusPageOverview,
  StatusType,
  StatusState,
  // Blog types
  BlogPost,
  BlogCategory,
  BlogPostsResponse,
  BlogFilters,
  // API types
  ApiResponse,
  PaginatedResponse,
} from './types'

// Utils
export { getFingerprint, getErrorMessage } from './utils'
