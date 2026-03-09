# Practical snippets

## Stack with wishlist + detail + support
```tsx
function App() {
  return (
    <AppgramProvider config={{ projectId: 'YOUR_PROJECT', orgSlug: 'org', projectSlug: 'project' }}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Wishes" component={WishesScreen} />
          <Stack.Screen name="WishDetail" component={WishDetailScreen} />
          <Stack.Screen name="Support" component={SupportScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppgramProvider>
  )
}

function WishesScreen({ navigation }) {
  return (
    <WishList
      title="Feature requests"
      onWishPress={(wish) => navigation.navigate('WishDetail', { id: wish.id })}
      onWishSubmitted={() => navigation.navigate('Support')}
    />
  )
}

function WishDetailScreen({ route, navigation }) {
  return (
    <WishDetailModal
      wishId={route.params.id}
      visible
      onClose={() => navigation.goBack()}
      onComment={() => {}}
    />
  )
}

function SupportScreen() {
  return (
    <SupportForm
      title="Contact support"
      onSuccess={() => Alert.alert('Sent')}
      onError={(err) => Alert.alert('Error', err)}
    />
  )
}
```

## Custom vote button with hook
```tsx
function MiniVote({ wish }) {
  const { vote, unvote, checkVote, isVoting } = useVote()
  const [state, set] = useState({ has: wish.has_voted, count: wish.vote_count, id: undefined as string | undefined })

  useEffect(() => { checkVote(wish.id).then(r => set(s => ({ ...s, has: r.hasVoted, id: r.voteId }))) }, [wish.id])

  const toggle = async () => {
    if (state.has && state.id) {
      const ok = await unvote(wish.id, state.id, state.count)
      if (ok) set(s => ({ ...s, has: false, count: Math.max(0, s.count - 1) }))
    } else {
      const ok = await vote(wish.id, state.count)
      if (ok) set(s => ({ ...s, has: true, count: s.count + 1 }))
    }
  }

  return (
    <Button disabled={isVoting} onPress={toggle} title={`${state.has ? 'Voted' : 'Vote'} (${state.count})`} />
  )
}
```

## Blog list with pagination
```tsx
function BlogIndex({ navigation }) {
  const { posts, page, totalPages, setPage, isLoading } = useBlogPosts({ per_page: 10 })
  return (
    <FlatList
      data={posts}
      refreshing={isLoading}
      onRefresh={() => setPage(1)}
      renderItem={({ item }) => (
        <BlogCard post={item} onPress={() => navigation.navigate('Post', { slug: item.slug })} />
      )}
      ListFooterComponent={() => (
        <Button disabled={page >= totalPages} onPress={() => setPage(page + 1)} title="Load more" />
      )}
    />
  )
}
```

## Status banner
```tsx
function StatusBanner() {
  const { data, isLoading } = useStatus({ slug: 'status', refreshInterval: 60000 })
  if (isLoading || !data) return null
  const ok = data.status?.toLowerCase() === 'operational'
  return (
    <View style={{ padding: 12, backgroundColor: ok ? '#DCFCE7' : '#FEE2E2' }}>
      <Text>{ok ? 'All systems operational' : data.status}</Text>
    </View>
  )
}
```

## Themed card wrapper
```tsx
function ThemedCard({ children }) {
  const { colors, spacing, radius } = useAppgramTheme()
  return (
    <View style={{
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.md,
    }}>
      {children}
    </View>
  )
}
```
