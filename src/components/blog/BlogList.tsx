import React, { useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Keyboard,
  type ViewStyle,
  type TextInput as TextInputType,
} from 'react-native'
import { Search, X, SlidersHorizontal } from 'lucide-react-native'
import { useAppgramTheme } from '../../provider'
import { useBlogPosts, useBlogCategories } from '../../hooks/useBlog'
import { BlogCard } from './BlogCard'
import type { BlogPost } from '../../types'

export interface BlogListProps {
  title?: string
  description?: string
  initialCategory?: string
  initialSearch?: string
  postsPerPage?: number
  showSearch?: boolean
  showCategories?: boolean
  cardVariant?: 'default' | 'compact' | 'large'
  onPostPress?: (post: BlogPost) => void
  onBookmark?: (post: BlogPost) => void
  onFilterPress?: () => void
  bookmarkedIds?: string[]
  renderLoading?: () => React.ReactNode
  renderEmpty?: () => React.ReactNode
  renderError?: (error: string, retry: () => void) => React.ReactNode
  style?: ViewStyle
}

/**
 * BlogList Component
 *
 * Blog list with search, filter, and category pills.
 * Use this for custom navigation instead of the full Blog component.
 *
 * @example
 * ```tsx
 * import { BlogList } from '@appgram/react-native'
 *
 * function BlogScreen({ navigation }) {
 *   return (
 *     <BlogList
 *       title="Blog"
 *       description="Latest news and updates"
 *       showSearch
 *       showCategories
 *       postsPerPage={10}
 *       onPostPress={(post) => {
 *         navigation.navigate('BlogPost', { slug: post.slug })
 *       }}
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With bookmarks and filters
 * <BlogList
 *   initialCategory="tutorials"
 *   bookmarkedIds={bookmarks}
 *   onBookmark={(post) => toggleBookmark(post.id)}
 *   onFilterPress={() => setShowFilters(true)}
 * />
 * ```
 */
export function BlogList({
  title,
  description,
  initialCategory,
  initialSearch = '',
  postsPerPage = 10,
  showSearch = true,
  showCategories = true,
  cardVariant = 'default',
  onPostPress,
  onBookmark,
  onFilterPress,
  bookmarkedIds = [],
  renderLoading,
  renderEmpty,
  renderError,
  style,
}: BlogListProps): React.ReactElement {
  const { colors } = useAppgramTheme()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null)
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [activeSearch, setActiveSearch] = useState(initialSearch)
  const [refreshing, setRefreshing] = useState(false)
  const searchInputRef = useRef<TextInputType>(null)

  const {
    posts,
    isLoading,
    error,
    page,
    totalPages,
    setPage,
    setFilters,
    refetch,
  } = useBlogPosts({
    category: selectedCategory || undefined,
    search: activeSearch || undefined,
    per_page: postsPerPage,
  })

  const { categories, isLoading: categoriesLoading } = useBlogCategories()

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const handleCategoryChange = useCallback((category: string | null) => {
    setSelectedCategory(category)
    setFilters({ category: category || undefined })
  }, [setFilters])

  const handleSearch = useCallback(() => {
    Keyboard.dismiss()
    setActiveSearch(searchInput)
    setFilters({ search: searchInput || undefined })
  }, [searchInput, setFilters])

  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setActiveSearch('')
    setFilters({ search: undefined })
  }, [setFilters])

  const renderHeader = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
      {/* Title */}
      {title && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground }}>
            {title}
          </Text>
          {description && (
            <Text style={{ fontSize: 15, color: colors.mutedForeground, marginTop: 4 }}>
              {description}
            </Text>
          )}
        </View>
      )}

      {/* Search Bar */}
      {showSearch && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.card,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              paddingLeft: 14,
              paddingRight: 8,
              height: 48,
            }}
          >
            <Search size={20} color={colors.mutedForeground} />
            <TextInput
              ref={searchInputRef}
              placeholder="Search here"
              placeholderTextColor={colors.mutedForeground}
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="never"
              style={{
                flex: 1,
                marginLeft: 10,
                fontSize: 16,
                color: colors.foreground,
                paddingVertical: 12,
              }}
            />
            {searchInput.length > 0 && (
              <TouchableOpacity
                onPress={handleClearSearch}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: colors.muted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={14} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Button */}
          {onFilterPress && (
            <TouchableOpacity
              onPress={onFilterPress}
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 12,
              }}
            >
              <SlidersHorizontal size={20} color={colors.foreground} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Category Pills */}
      {showCategories && categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          {/* All category */}
          <TouchableOpacity
            onPress={() => handleCategoryChange(null)}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 24,
              backgroundColor: !selectedCategory ? colors.foreground : 'transparent',
              borderWidth: 1,
              borderColor: !selectedCategory ? colors.foreground : colors.border,
              marginRight: 10,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: !selectedCategory ? colors.background : colors.foreground,
              }}
            >
              All
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => handleCategoryChange(cat.slug)}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 24,
                  backgroundColor: isSelected ? colors.foreground : 'transparent',
                  borderWidth: 1,
                  borderColor: isSelected ? colors.foreground : colors.border,
                  marginRight: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: isSelected ? colors.background : colors.foreground,
                  }}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      )}
    </View>
  )

  const renderPost = ({ item, index }: { item: BlogPost; index: number }) => (
    <View style={{ marginBottom: 16, paddingHorizontal: 8 }}>
      <BlogCard
        post={item}
        onPress={onPostPress}
        onBookmark={onBookmark}
        isBookmarked={bookmarkedIds.includes(item.id)}
        variant={index === 0 && cardVariant === 'large' ? 'large' : cardVariant}
      />
    </View>
  )

  const renderEmptyState = () => {
    if (isLoading || categoriesLoading) {
      if (renderLoading) return <>{renderLoading()}</>
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )
    }

    if (error) {
      if (renderError) return <>{renderError(error, refetch)}</>
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 }}>
          <Text style={{ fontSize: 17, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 15, color: colors.mutedForeground, textAlign: 'center', marginBottom: 20 }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={refetch}
            style={{
              paddingHorizontal: 24,
              paddingVertical: 12,
              backgroundColor: colors.primary,
              borderRadius: 24,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (renderEmpty) return <>{renderEmpty()}</>

    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 }}>
        <Text style={{ fontSize: 17, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
          No articles found
        </Text>
        <Text style={{ fontSize: 15, color: colors.mutedForeground, textAlign: 'center' }}>
          {activeSearch || selectedCategory
            ? 'Try adjusting your search or filters'
            : 'Check back later for new content'}
        </Text>
      </View>
    )
  }

  const renderFooter = () => {
    if (totalPages <= 1 || posts.length === 0) return null

    return (
      <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 20, gap: 8 }}>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setPage(p)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: p === page ? colors.foreground : colors.card,
              borderWidth: 1,
              borderColor: p === page ? colors.foreground : colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: p === page ? colors.background : colors.foreground,
              }}
            >
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={renderFooter}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
      contentContainerStyle={[{ flexGrow: 1, paddingBottom: 20 }, style]}
      showsVerticalScrollIndicator={false}
    />
  )
}

export default BlogList
