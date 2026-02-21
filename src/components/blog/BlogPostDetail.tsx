import React from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  type ViewStyle,
  Platform,
} from 'react-native'
import RenderHtml, { type MixedStyleDeclaration } from 'react-native-render-html'
import { Bookmark, Clock, User } from 'lucide-react-native'
import { useAppgramTheme } from '../../provider'
import { useBlogPost } from '../../hooks/useBlog'
import type { BlogPost } from '../../types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export interface BlogPostDetailProps {
  post?: BlogPost
  postSlug?: string
  onBookmark?: (post: BlogPost) => void
  isBookmarked?: boolean
  showRelatedPosts?: boolean
  onRelatedPostPress?: (post: BlogPost) => void
  renderLoading?: () => React.ReactNode
  renderError?: (error: string, retry: () => void) => React.ReactNode
  style?: ViewStyle
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * BlogPostDetail Component
 *
 * Blog detail view with full-width hero image.
 * Can receive post data directly or fetch by slug.
 *
 * @example
 * ```tsx
 * import { BlogPostDetail } from '@appgram/react-native'
 *
 * function BlogPostScreen({ route }) {
 *   return (
 *     <BlogPostDetail
 *       postSlug={route.params.slug}
 *       showRelatedPosts
 *       onRelatedPostPress={(post) => {
 *         navigation.push('BlogPost', { slug: post.slug })
 *       }}
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With pre-fetched post data and bookmarks
 * <BlogPostDetail
 *   post={selectedPost}
 *   onBookmark={(post) => toggleBookmark(post.id)}
 *   isBookmarked={bookmarks.includes(selectedPost.id)}
 * />
 * ```
 */
export function BlogPostDetail({
  post: providedPost,
  postSlug,
  onBookmark,
  isBookmarked = false,
  showRelatedPosts = true,
  onRelatedPostPress,
  renderLoading,
  renderError,
  style,
}: BlogPostDetailProps): React.ReactElement | null {
  const { colors } = useAppgramTheme()

  const {
    post: fetchedPost,
    relatedPosts,
    isLoading,
    error,
    refetch,
  } = useBlogPost({
    slug: postSlug || '',
    skip: !postSlug || !!providedPost,
  })

  const post = providedPost || fetchedPost
  const contentWidth = SCREEN_WIDTH - 32

  const tagsStyles: Record<string, MixedStyleDeclaration> = {
    body: {
      color: colors.foreground,
      fontSize: 16,
      lineHeight: 26,
    },
    p: { marginBottom: 16, marginTop: 0 },
    h1: { fontSize: 24, fontWeight: '700', marginTop: 24, marginBottom: 12, color: colors.foreground },
    h2: { fontSize: 20, fontWeight: '600', marginTop: 20, marginBottom: 10, color: colors.foreground },
    h3: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8, color: colors.foreground },
    a: { color: colors.primary },
    strong: { fontWeight: '600' },
    em: { fontStyle: 'italic' },
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      paddingLeft: 16,
      marginVertical: 16,
      fontStyle: 'italic',
    },
    code: {
      backgroundColor: colors.muted,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: 14,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    pre: {
      backgroundColor: colors.muted,
      padding: 16,
      borderRadius: 12,
      marginVertical: 16,
    },
    ul: { marginVertical: 12 },
    ol: { marginVertical: 12 },
    li: { marginBottom: 6 },
    img: { borderRadius: 12, marginVertical: 16 },
  }

  // Loading
  if (isLoading && !post) {
    if (renderLoading) return <>{renderLoading()}</>
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  // Error
  if (error && !post) {
    if (renderError) return <>{renderError(error, refetch)}</>
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={{ fontSize: 17, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
          Couldn't load article
        </Text>
        <Text style={{ fontSize: 15, color: colors.mutedForeground, textAlign: 'center', marginBottom: 24 }}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={refetch}
          style={{ paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: 24 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!post) return null

  return (
    <ScrollView
      style={[{ flex: 1 }, style]}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      bounces
    >
      {/* Hero Image - Full Width, Edge to Edge */}
      {post.og_image_url && (
        <View>
          <Image
            source={{ uri: post.og_image_url }}
            style={{ width: '100%', aspectRatio: 4 / 3 }}
            resizeMode="cover"
          />

          {/* Tags on Image */}
          {post.tags && post.tags.length > 0 && (
            <View
              style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {post.tags.slice(0, 3).map((tag) => (
                <View
                  key={tag}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '500', color: '#1a1a2e' }}>
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Bookmark Button */}
          {onBookmark && (
            <TouchableOpacity
              onPress={() => onBookmark(post)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.95)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bookmark
                size={20}
                color="#1a1a2e"
                fill={isBookmarked ? '#1a1a2e' : 'transparent'}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Content */}
      <View style={{ padding: 16 }}>
        {/* Author Row */}
        {post.author_name && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.muted,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <User size={24} color={colors.mutedForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                {post.author_name}
              </Text>
              {post.view_count > 0 && (
                <Text style={{ fontSize: 13, color: colors.mutedForeground, marginTop: 2 }}>
                  {post.view_count.toLocaleString()} readers
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                backgroundColor: colors.foreground,
                borderRadius: 20,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.background }}>
                Follow
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Title */}
        <Text
          style={{
            fontSize: 26,
            fontWeight: '700',
            color: colors.foreground,
            lineHeight: 34,
            marginBottom: 12,
          }}
        >
          {post.title}
        </Text>

        {/* Meta Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          {post.category && (
            <>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: post.category.color || colors.primary,
                  marginRight: 6,
                }}
              />
              <Text style={{ fontSize: 14, color: colors.mutedForeground, marginRight: 16 }}>
                {post.category.name}
              </Text>
            </>
          )}
          <Clock size={14} color={colors.mutedForeground} />
          <Text style={{ fontSize: 14, color: colors.mutedForeground, marginLeft: 6 }}>
            {formatTimeAgo(post.published_at)}
          </Text>
        </View>

        {/* Excerpt */}
        {post.excerpt && (
          <Text
            style={{
              fontSize: 17,
              color: colors.mutedForeground,
              lineHeight: 26,
              marginBottom: 24,
              fontStyle: 'italic',
            }}
          >
            {post.excerpt}
          </Text>
        )}

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 24 }} />

        {/* Article Content */}
        <RenderHtml
          contentWidth={contentWidth}
          source={{ html: post.content }}
          tagsStyles={tagsStyles}
          enableExperimentalMarginCollapsing
        />

        {/* Related Posts */}
        {showRelatedPosts && relatedPosts.length > 0 && (
          <View style={{ marginTop: 32, marginBottom: 40 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.foreground, marginBottom: 16 }}>
              Related Articles
            </Text>
            {relatedPosts.slice(0, 3).map((related) => (
              <TouchableOpacity
                key={related.id}
                onPress={() => onRelatedPostPress?.(related)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                {related.og_image_url && (
                  <Image
                    source={{ uri: related.og_image_url }}
                    style={{ width: 72, height: 72, borderRadius: 12, marginRight: 12 }}
                    resizeMode="cover"
                  />
                )}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 15, fontWeight: '600', color: colors.foreground, marginBottom: 4 }}
                    numberOfLines={2}
                  >
                    {related.title}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Clock size={12} color={colors.mutedForeground} />
                    <Text style={{ fontSize: 13, color: colors.mutedForeground, marginLeft: 4 }}>
                      {formatTimeAgo(related.published_at)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default BlogPostDetail
