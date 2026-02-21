import React, { useState, useCallback } from 'react'
import { View, type ViewStyle } from 'react-native'
import { BlogList } from './BlogList'
import { BlogPostDetail } from './BlogPostDetail'
import type { BlogPost } from '../../types'

export interface BlogProps {
  title?: string
  description?: string
  initialCategory?: string
  initialSearch?: string
  postsPerPage?: number
  showSearch?: boolean
  showCategories?: boolean
  showRelatedPosts?: boolean
  cardVariant?: 'default' | 'compact' | 'large'
  onPostView?: (post: BlogPost) => void
  onBackToList?: () => void
  onBookmark?: (post: BlogPost) => void
  onFilterPress?: () => void
  bookmarkedIds?: string[]
  renderLoading?: () => React.ReactNode
  renderEmpty?: () => React.ReactNode
  renderError?: (error: string, retry: () => void) => React.ReactNode
  style?: ViewStyle
}

type ViewState =
  | { type: 'list' }
  | { type: 'detail'; post: BlogPost }

/**
 * Blog Component
 *
 * Full-featured blog with list and detail views.
 * Note: For app navigation, use BlogList and BlogPostDetail separately.
 *
 * @example
 * ```tsx
 * import { Blog } from '@appgram/react-native'
 *
 * function BlogScreen() {
 *   return (
 *     <Blog
 *       title="Blog"
 *       description="Latest news and updates"
 *       showSearch
 *       showCategories
 *       postsPerPage={10}
 *       onPostView={(post) => console.log('Viewing:', post.title)}
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With bookmarks
 * const [bookmarks, setBookmarks] = useState<string[]>([])
 *
 * <Blog
 *   bookmarkedIds={bookmarks}
 *   onBookmark={(post) => {
 *     setBookmarks(prev =>
 *       prev.includes(post.id)
 *         ? prev.filter(id => id !== post.id)
 *         : [...prev, post.id]
 *     )
 *   }}
 * />
 * ```
 */
export function Blog({
  title,
  description,
  initialCategory,
  initialSearch,
  postsPerPage = 10,
  showSearch = true,
  showCategories = true,
  showRelatedPosts = true,
  cardVariant = 'default',
  onPostView,
  onBackToList,
  onBookmark,
  onFilterPress,
  bookmarkedIds = [],
  renderLoading,
  renderEmpty,
  renderError,
  style,
}: BlogProps): React.ReactElement {
  const [viewState, setViewState] = useState<ViewState>({ type: 'list' })

  const handlePostPress = useCallback((post: BlogPost) => {
    setViewState({ type: 'detail', post })
    onPostView?.(post)
  }, [onPostView])

  const handleRelatedPostPress = useCallback((post: BlogPost) => {
    setViewState({ type: 'detail', post })
    onPostView?.(post)
  }, [onPostView])

  // Detail view
  if (viewState.type === 'detail') {
    return (
      <View style={[{ flex: 1 }, style]}>
        <BlogPostDetail
          post={viewState.post}
          onBookmark={onBookmark}
          isBookmarked={bookmarkedIds.includes(viewState.post.id)}
          showRelatedPosts={showRelatedPosts}
          onRelatedPostPress={handleRelatedPostPress}
          renderLoading={renderLoading}
          renderError={renderError}
        />
      </View>
    )
  }

  // List view
  return (
    <View style={[{ flex: 1 }, style]}>
      <BlogList
        title={title}
        description={description}
        initialCategory={initialCategory}
        initialSearch={initialSearch}
        postsPerPage={postsPerPage}
        showSearch={showSearch}
        showCategories={showCategories}
        cardVariant={cardVariant}
        onPostPress={handlePostPress}
        onBookmark={onBookmark}
        onFilterPress={onFilterPress}
        bookmarkedIds={bookmarkedIds}
        renderLoading={renderLoading}
        renderEmpty={renderEmpty}
        renderError={renderError}
      />
    </View>
  )
}

export default Blog
