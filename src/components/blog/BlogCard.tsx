import React from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native'
import { Clock, Bookmark } from 'lucide-react-native'
import { useAppgramTheme } from '../../provider'
import type { BlogPost } from '../../types'

export interface BlogCardProps {
  post: BlogPost
  onPress?: (post: BlogPost) => void
  onBookmark?: (post: BlogPost) => void
  isBookmarked?: boolean
  variant?: 'default' | 'compact' | 'large'
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
 * BlogCard Component
 *
 * Modern card with image overlay text.
 * Supports default, compact, and large variants.
 *
 * @example
 * ```tsx
 * import { BlogCard } from '@appgram/react-native'
 *
 * function FeaturedPost({ post }) {
 *   return (
 *     <BlogCard
 *       post={post}
 *       variant="large"
 *       onPress={(p) => navigation.navigate('BlogPost', { slug: p.slug })}
 *       onBookmark={(p) => toggleBookmark(p.id)}
 *       isBookmarked={bookmarks.includes(post.id)}
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Compact variant for sidebars or lists
 * <BlogCard
 *   post={post}
 *   variant="compact"
 *   onPress={handlePostPress}
 * />
 * ```
 */
export function BlogCard({
  post,
  onPress,
  onBookmark,
  isBookmarked = false,
  variant = 'default',
  style,
}: BlogCardProps): React.ReactElement {
  const { colors, radius } = useAppgramTheme()

  const cardHeight = variant === 'large' ? 220 : variant === 'compact' ? 120 : 180

  // Compact - small horizontal card
  if (variant === 'compact') {
    return (
      <TouchableOpacity
        onPress={() => onPress?.(post)}
        activeOpacity={0.9}
        style={[
          {
            flexDirection: 'row',
            backgroundColor: colors.card,
            borderRadius: 16,
            overflow: 'hidden',
            height: cardHeight,
          },
          style,
        ]}
      >
        {post.og_image_url && (
          <Image
            source={{ uri: post.og_image_url }}
            style={{ width: 120, height: '100%' }}
            resizeMode="cover"
          />
        )}
        <View style={{ flex: 1, padding: 12, justifyContent: 'center' }}>
          {post.category && (
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: post.category.color || colors.primary,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 4,
              }}
            >
              {post.category.name}
            </Text>
          )}
          <Text
            style={{ fontSize: 15, fontWeight: '600', color: colors.foreground, lineHeight: 20 }}
            numberOfLines={2}
          >
            {post.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Clock size={12} color={colors.mutedForeground} />
            <Text style={{ fontSize: 12, color: colors.mutedForeground, marginLeft: 4 }}>
              {formatTimeAgo(post.published_at)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  // Default & Large - Image with overlay
  return (
    <TouchableOpacity
      onPress={() => onPress?.(post)}
      activeOpacity={0.95}
      style={[
        {
          borderRadius: 16,
          overflow: 'hidden',
          height: cardHeight,
          backgroundColor: colors.muted,
        },
        style,
      ]}
    >
      {/* Background Image */}
      {post.og_image_url && (
        <Image
          source={{ uri: post.og_image_url }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          resizeMode="cover"
        />
      )}

      {/* Gradient Overlay - Semi-transparent bottom */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '60%',
        }}
      >
        <View style={{ flex: 1, backgroundColor: 'transparent' }} />
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' }} />
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} />
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }} />
      </View>

      {/* Bookmark Button */}
      {onBookmark && (
        <TouchableOpacity
          onPress={() => onBookmark(post)}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: 'rgba(255,255,255,0.95)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bookmark
            size={18}
            color={colors.foreground}
            fill={isBookmarked ? colors.foreground : 'transparent'}
          />
        </TouchableOpacity>
      )}

      {/* Content Overlay */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: 16,
        }}
      >
        {/* Title */}
        <Text
          style={{
            fontSize: variant === 'large' ? 22 : 18,
            fontWeight: '700',
            color: '#fff',
            marginBottom: 8,
            lineHeight: variant === 'large' ? 28 : 24,
            textShadowColor: 'rgba(0,0,0,0.3)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3,
          }}
          numberOfLines={2}
        >
          {post.title}
        </Text>

        {/* Meta Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {post.category && (
            <>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: post.category.color || '#fff',
                  marginRight: 6,
                }}
              />
              <Text
                style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.9)',
                  marginRight: 12,
                }}
              >
                {post.category.name}
              </Text>
            </>
          )}
          <Clock size={13} color="rgba(255,255,255,0.8)" />
          <Text
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.8)',
              marginLeft: 4,
            }}
          >
            {formatTimeAgo(post.published_at)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default BlogCard
