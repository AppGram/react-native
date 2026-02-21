# @appgram/react-native

React Native SDK for Appgram - feature voting, roadmaps, changelogs, help center, support, and status pages.

## Installation

```bash
npm install @appgram/react-native
# or
yarn add @appgram/react-native
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

- **Wishes/Feature Requests** - Display and vote on feature requests
- **Support Forms** - Submit support tickets
- **Theming** - Automatic dark/light mode with Hazel design system
- **Headless Hooks** - Build custom UI with provided hooks

## Components

### WishList

Display a list of feature requests with voting.

```tsx
import { WishList } from '@appgram/react-native'

<WishList
  onWishPress={(wish) => navigation.navigate('WishDetail', { id: wish.id })}
  onVoteChange={(wishId, hasVoted, newCount) => console.log('Vote changed')}
/>
```

### SupportForm

A complete support ticket form.

```tsx
import { SupportForm } from '@appgram/react-native'

<SupportForm
  title="Contact Support"
  userEmail="user@example.com"
  onSuccess={() => navigation.goBack()}
/>
```

### VoteButton

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

## Hooks

### useWishes

Fetch and manage wishes.

```tsx
import { useWishes } from '@appgram/react-native'

const { wishes, isLoading, error, refetch, setFilters } = useWishes({
  filters: { status: 'pending', sort_by: 'votes' },
  refreshInterval: 30000,
})
```

### useVote

Manage voting.

```tsx
import { useVote } from '@appgram/react-native'

const { vote, unvote, checkVote, isVoting, error } = useVote()

// Vote
await vote(wishId, currentVoteCount)

// Unvote
await unvote(wishId, voteId, currentVoteCount)
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
})
```

### useContactForm

Fetch and submit contact forms.

```tsx
import { useContactForm, useContactFormSubmit } from '@appgram/react-native'

const { form, isLoading } = useContactForm('form-id')
const { submitForm, isSubmitting } = useContactFormSubmit()
```

## Theming

The SDK automatically adapts to system dark/light mode using the Hazel design system.

```tsx
<AppgramProvider
  config={{
    projectId: 'your-project-id',
    theme: {
      mode: 'system', // 'light' | 'dark' | 'system'
      lightColors: {
        primary: '#0EA5E9', // Customize primary color
      },
      darkColors: {
        primary: '#38BDF8',
      },
    },
  }}
>
```

### Access Theme

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

## License

MIT
