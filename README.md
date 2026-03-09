# @appgram/react-native

React Native SDK for Appgram - feature voting, roadmaps, changelogs, help center, support, surveys, blog, and status pages.

## Installation

```bash
npm install @appgram/react-native
# or
yarn add @appgram/react-native
```

### Peer Dependencies

```bash
npm install @react-native-async-storage/async-storage lucide-react-native react-native-svg react-native-markdown-display react-native-render-html
```

## Quick Start

```tsx
import { AppgramProvider, WishList, SupportForm } from '@appgram/react-native'

function App() {
  return (
    <AppgramProvider
      config={{
        projectId: 'your-project-id',
        orgSlug: 'your-org',
        projectSlug: 'your-project',
      }}
    >
      <NavigationContainer>
        {/* Your app content */}
      </NavigationContainer>
    </AppgramProvider>
  )
}
```

## Features

| Feature | Components | Hooks |
|---------|------------|-------|
| **Wishes/Feedback** | `WishList`, `WishCard`, `VoteButton`, `WishDetailModal`, `SubmitWishSheet` | `useWishes`, `useVote`, `useComments` |
| **Roadmap** | `RoadmapBoard` | `useRoadmap` |
| **Changelog/Releases** | `Releases`, `ReleaseList`, `ReleaseDetail` | `useReleases`, `useRelease` |
| **Help Center** | `HelpCenter`, `HelpFlowCard`, `HelpFlowDetail`, `HelpArticleCard`, `HelpArticleDetail` | `useHelpCenter`, `useHelpFlow`, `useHelpArticle` |
| **Support** | `SupportForm`, `FormRenderer` | `useSupport`, `useForm`, `useFormSubmit` |
| **Surveys** | `SurveyForm` | `useSurvey`, `useSurveySubmit` |
| **Blog** | `Blog`, `BlogList`, `BlogCard`, `BlogPostDetail` | `useBlogPosts`, `useBlogPost`, `useBlogCategories`, `useFeaturedPosts` |
| **Status Page** | `StatusBoard` | `useStatus` |

---

## Components

### Wishes/Feedback

#### WishList

Complete feature request list with voting, filtering, and built-in submission.

```tsx
import { WishList } from '@appgram/react-native'

<WishList
  title="Feature Requests"
  description="Vote on features and submit your ideas"
  filters={{ status: 'pending', sort_by: 'votes' }}
  showSubmitButton={true}
  submitButtonText="Submit Idea"
  onWishPress={(wish) => console.log('Selected:', wish)}
  onWishSubmitted={(wish) => console.log('Submitted:', wish)}
  refreshInterval={30000}
/>
```

#### WishCard

Individual wish card for custom layouts.

```tsx
import { WishCard } from '@appgram/react-native'

<WishCard
  wish={wish}
  onPress={(wish) => navigation.navigate('WishDetail', { id: wish.id })}
  onVote={(wishId) => console.log('Voted:', wishId)}
  onCommentPress={(wish) => console.log('Comment on:', wish.id)}
/>
```

#### VoteButton

Standalone vote button for custom layouts.

```tsx
import { VoteButton } from '@appgram/react-native'

<VoteButton
  wishId={wish.id}
  initialVoteCount={wish.vote_count}
  initialHasVoted={wish.has_voted}
  onVoteChange={(hasVoted, newCount) => updateWish(wish.id, newCount)}
/>
```

#### SubmitWishSheet

Modal sheet for submitting new feature requests.

```tsx
import { SubmitWishSheet } from '@appgram/react-native'

<SubmitWishSheet
  visible={isVisible}
  onClose={() => setVisible(false)}
  onSuccess={(wish) => console.log('Created:', wish)}
  title="Submit a Feature Request"
  description="Tell us what you'd like to see"
/>
```

### Roadmap

#### RoadmapBoard

Kanban-style roadmap display.

```tsx
import { RoadmapBoard } from '@appgram/react-native'

<RoadmapBoard
  onItemPress={(item) => console.log('Selected:', item)}
/>
```

### Releases/Changelog

#### Releases

Full changelog view with release list and detail.

```tsx
import { Releases } from '@appgram/react-native'

<Releases
  onReleasePress={(release) => navigation.navigate('ReleaseDetail', { slug: release.slug })}
/>
```

#### ReleaseList

List of releases for custom layouts.

```tsx
import { ReleaseList } from '@appgram/react-native'

<ReleaseList
  limit={10}
  onReleasePress={(release) => console.log(release)}
/>
```

#### ReleaseDetail

Single release detail view.

```tsx
import { ReleaseDetail } from '@appgram/react-native'

<ReleaseDetail
  releaseSlug="v1.2.0"
  onBack={() => navigation.goBack()}
/>
```

### Help Center

#### HelpCenter

Complete help center with flows and articles.

```tsx
import { HelpCenter } from '@appgram/react-native'

<HelpCenter
  title="Help Center"
  onFlowPress={(flow) => navigation.navigate('HelpFlow', { slug: flow.slug })}
  onArticlePress={(article) => navigation.navigate('Article', { slug: article.slug })}
/>
```

#### HelpFlowDetail

Single help flow with its articles.

```tsx
import { HelpFlowDetail } from '@appgram/react-native'

<HelpFlowDetail
  slug="getting-started"
  onArticlePress={(article) => navigation.navigate('Article', { slug: article.slug })}
  onBack={() => navigation.goBack()}
/>
```

#### HelpArticleDetail

Single article content view.

```tsx
import { HelpArticleDetail } from '@appgram/react-native'

<HelpArticleDetail
  slug="how-to-reset-password"
  flowId="account-help"
  onBack={() => navigation.goBack()}
/>
```

### Support

#### SupportForm

Complete support ticket form.

```tsx
import { SupportForm } from '@appgram/react-native'

<SupportForm
  title="Contact Support"
  userEmail="user@example.com"
  userName="John Doe"
  onSuccess={() => {
    Alert.alert('Success', 'Your ticket has been submitted!')
    navigation.goBack()
  }}
  onError={(error) => Alert.alert('Error', error)}
/>
```

#### FormRenderer

Render dynamic forms.

```tsx
import { FormRenderer } from '@appgram/react-native'

<FormRenderer
  formId="contact-sales"
  onSuccess={() => console.log('Submitted!')}
/>
```

### Surveys

#### SurveyForm

Interactive survey form.

```tsx
import { SurveyForm } from '@appgram/react-native'

<SurveyForm
  slug="customer-satisfaction"
  onSuccess={(response) => console.log('Submitted:', response)}
  onError={(error) => console.log('Error:', error)}
/>
```

### Blog

#### Blog

Full blog with categories and posts.

```tsx
import { Blog } from '@appgram/react-native'

<Blog
  title="Blog"
  onPostPress={(post) => navigation.navigate('BlogPost', { slug: post.slug })}
/>
```

#### BlogList

List of blog posts with pagination.

```tsx
import { BlogList } from '@appgram/react-native'

<BlogList
  category="announcements"
  onPostPress={(post) => console.log(post)}
/>
```

#### BlogPostDetail

Single blog post content.

```tsx
import { BlogPostDetail } from '@appgram/react-native'

<BlogPostDetail
  slug="introducing-v2"
  onBack={() => navigation.goBack()}
/>
```

### Status Page

#### StatusBoard

System status overview.

```tsx
import { StatusBoard } from '@appgram/react-native'

<StatusBoard
  slug="status"
  refreshInterval={60000}
/>
```

---

## Hooks

All hooks are designed for building custom UI. Each hook returns loading state, error handling, and a refetch function.

### useWishes

Fetch and filter feature requests.

```tsx
import { useWishes } from '@appgram/react-native'

const { wishes, isLoading, error, refetch, setFilters } = useWishes({
  filters: { status: 'pending', sort_by: 'votes' },
  refreshInterval: 30000,
})
```

### useVote

Manage voting on wishes.

```tsx
import { useVote } from '@appgram/react-native'

const { vote, unvote, checkVote, isVoting, error } = useVote()

// Vote on a wish
await vote(wishId, currentVoteCount)

// Remove vote
await unvote(wishId, voteId, currentVoteCount)
```

### useComments

Fetch and add comments to wishes.

```tsx
import { useComments } from '@appgram/react-native'

const { comments, isLoading, addComment, isSubmitting, refetch } = useComments({
  wishId: 'wish-123',
  autoFetch: true,
})

// Add a comment
await addComment('Great idea!', 'John', 'john@example.com')
```

### useRoadmap

Fetch roadmap columns and items.

```tsx
import { useRoadmap } from '@appgram/react-native'

const { roadmap, columns, totalItems, isLoading, error, refetch } = useRoadmap({
  refreshInterval: 60000,
})
```

### useReleases / useRelease

Fetch changelog releases.

```tsx
import { useReleases, useRelease } from '@appgram/react-native'

// List of releases
const { releases, isLoading, refetch } = useReleases({ limit: 10 })

// Single release with features
const { release, features, isLoading, refetch } = useRelease({
  releaseSlug: 'v1.2.0',
})
```

### useHelpCenter / useHelpFlow / useHelpArticle

Fetch help center content.

```tsx
import { useHelpCenter, useHelpFlow, useHelpArticle } from '@appgram/react-native'

// Help center overview
const { collection, flows, isLoading } = useHelpCenter()

// Single flow with articles
const { flow, isLoading } = useHelpFlow('getting-started')

// Single article
const { article, isLoading } = useHelpArticle('reset-password', 'account-help')
```

### useSupport

Submit support tickets.

```tsx
import { useSupport } from '@appgram/react-native'

const { submitTicket, isSubmitting, error, successMessage } = useSupport()

await submitTicket({
  subject: 'Help needed',
  description: 'I have a question...',
  user_email: 'user@example.com',
  user_name: 'John',
})
```

### useForm / useFormSubmit

Fetch and submit dynamic forms.

```tsx
import { useForm, useFormSubmit } from '@appgram/react-native'

const { form, isLoading } = useForm('form-id')
const { submitForm, isSubmitting, error } = useFormSubmit()

await submitForm(projectId, 'form-id', { name: 'John', email: 'john@example.com', message: 'Hello!' })
```

### useSurvey / useSurveySubmit

Fetch and submit surveys.

```tsx
import { useSurvey, useSurveySubmit } from '@appgram/react-native'

const { survey, nodes, isLoading } = useSurvey('customer-satisfaction')
const { submitResponse, isSubmitting } = useSurveySubmit({
  onSuccess: (response) => console.log('Done!', response),
})

await submitResponse(survey.id, { answers: { q1: 'Great!' } })
```

### useBlogPosts / useBlogPost / useBlogCategories / useFeaturedPosts

Fetch blog content.

```tsx
import { useBlogPosts, useBlogPost, useBlogCategories, useFeaturedPosts } from '@appgram/react-native'

// List with filters and pagination
const { posts, page, totalPages, setPage, setFilters, refetch } = useBlogPosts({
  category: 'news',
  per_page: 10,
})

// Single post with related posts
const { post, relatedPosts, isLoading } = useBlogPost({ slug: 'hello-world' })

// Categories
const { categories, isLoading } = useBlogCategories()

// Featured posts
const { posts: featured, isLoading } = useFeaturedPosts()
```

### useStatus

Fetch status page data.

```tsx
import { useStatus } from '@appgram/react-native'

const { data, isLoading, error, refetch } = useStatus({
  slug: 'status',
  refreshInterval: 60000,
})
```

---

## Theming

The SDK automatically adapts to system dark/light mode using the Hazel design system.

### Configuration

```tsx
<AppgramProvider
  config={{
    projectId: 'your-project-id',
    theme: {
      mode: 'system', // 'light' | 'dark' | 'system'
      lightColors: {
        primary: '#0EA5E9',
        background: '#FFFFFF',
        foreground: '#0F172A',
      },
      darkColors: {
        primary: '#38BDF8',
        background: '#0F172A',
        foreground: '#F8FAFC',
      },
    },
  }}
>
```

### Access Theme

Use the `useAppgramTheme` hook to access theme values in custom components.

```tsx
import { useAppgramTheme } from '@appgram/react-native'

function MyComponent() {
  const { colors, spacing, radius, typography, isDark } = useAppgramTheme()

  return (
    <View style={{ backgroundColor: colors.background, padding: spacing.lg }}>
      <Text style={{ color: colors.foreground, fontSize: typography.base }}>
        Hello
      </Text>
    </View>
  )
}
```

### Theme Properties

| Property | Description |
|----------|-------------|
| `colors` | Color palette (primary, background, foreground, muted, border, error, etc.) |
| `spacing` | Spacing scale (xs, sm, md, lg, xl, 2xl) |
| `radius` | Border radius scale (sm, md, lg, xl, full) |
| `typography` | Font sizes (xs, sm, base, lg, xl, 2xl, 3xl) |
| `isDark` | Boolean indicating if dark mode is active |
| `mode` | Current theme mode ('light', 'dark', 'system') |

---

## Direct API Access

For advanced use cases, access the API client directly.

```tsx
import { useAppgramContext } from '@appgram/react-native'

function MyComponent() {
  const { client, config, fingerprint } = useAppgramContext()

  const fetchData = async () => {
    const response = await client.getWishes({ status: 'approved' })
    if (response.success) {
      console.log(response.data)
    }
  }
}
```

---

## TypeScript

The SDK is fully typed. Import types as needed:

```tsx
import type {
  Wish,
  WishFilters,
  Vote,
  Release,
  ReleaseFeature,
  RoadmapData,
  RoadmapColumn,
  HelpCollection,
  HelpFlow,
  HelpArticle,
  BlogPost,
  BlogCategory,
  Survey,
  SurveyNode,
  StatusPageOverview,
  Comment,
  AppgramConfig,
  AppgramTheme,
} from '@appgram/react-native'
```

---

## License

MIT

## Skill install (skills.sh)

Want to reuse this SDK as a Codex/skills.sh skill? The skill lives at `skills/appgram-react-native-sdk`.

- Local install from this repo: `npx skills add . --skill appgram-react-native-sdk`
- From GitHub: `npx skills add https://github.com/<owner>/<repo> --skill appgram-react-native-sdk`
- Peer deps required in consuming projects: `@react-native-async-storage/async-storage`, `lucide-react-native`, `react-native-svg`, `react-native-markdown-display`, `react-native-render-html` (install after `@appgram/react-native`; run `npx pod-install` for iOS).
