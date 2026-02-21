import React from 'react'
import { TouchableOpacity, View, Text, type ViewStyle } from 'react-native'
import {
  ArrowBigUp,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react-native'
import { useAppgramTheme } from '../../provider'
import type { Wish } from '../../types'

export interface WishCardProps {
  wish: Wish
  onPress?: (wish: Wish) => void
  onVote?: (wishId: string) => void
  onCommentPress?: (wish: Wish) => void
  style?: ViewStyle
}

// Status configuration matching web
const STATUS_CONFIG: Record<string, {
  icon: typeof Clock
  label: string
  variant: 'default' | 'secondary' | 'outline'
}> = {
  pending: { icon: Clock, label: 'New', variant: 'secondary' },
  under_review: { icon: AlertCircle, label: 'Reviewing', variant: 'outline' },
  planned: { icon: Clock, label: 'Planned', variant: 'outline' },
  in_progress: { icon: AlertCircle, label: 'In Progress', variant: 'default' },
  completed: { icon: CheckCircle2, label: 'Shipped', variant: 'default' },
  declined: { icon: AlertCircle, label: 'Closed', variant: 'secondary' },
}

/**
 * WishCard Component
 *
 * A card displaying a wish/feature request with voting and status.
 *
 * @example
 * ```tsx
 * import { WishCard } from '@appgram/react-native'
 *
 * function WishItem({ wish }) {
 *   return (
 *     <WishCard
 *       wish={wish}
 *       onPress={(w) => navigation.navigate('WishDetail', { id: w.id })}
 *       onVote={(wishId) => console.log('Voted on:', wishId)}
 *       onCommentPress={(w) => navigation.navigate('Comments', { wishId: w.id })}
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // In a FlatList
 * <FlatList
 *   data={wishes}
 *   renderItem={({ item }) => (
 *     <WishCard wish={item} onPress={handlePress} />
 *   )}
 *   keyExtractor={(item) => item.id}
 * />
 * ```
 */
export function WishCard({
  wish,
  onPress,
  onVote,
  onCommentPress,
  style,
}: WishCardProps): React.ReactElement {
  const { colors, radius, typography, spacing } = useAppgramTheme()

  const [localVote, setLocalVote] = React.useState({
    hasVoted: wish.has_voted || false,
    count: wish.vote_count || 0,
  })

  React.useEffect(() => {
    setLocalVote({
      hasVoted: wish.has_voted || false,
      count: wish.vote_count || 0,
    })
  }, [wish.has_voted, wish.vote_count])

  const handleVote = () => {
    setLocalVote((prev) => ({
      hasVoted: !prev.hasVoted,
      count: prev.hasVoted ? prev.count - 1 : prev.count + 1,
    }))
    onVote?.(wish.id)
  }

  const handlePress = () => {
    onPress?.(wish)
  }

  const handleCommentPress = () => {
    onCommentPress?.(wish)
  }

  const status = STATUS_CONFIG[wish.status] || STATUS_CONFIG.pending
  const StatusIcon = status.icon

  // Badge colors based on variant
  const getBadgeStyles = () => {
    switch (status.variant) {
      case 'default':
        return {
          bg: colors.primary,
          text: '#FFFFFF',
        }
      case 'outline':
        return {
          bg: 'transparent',
          text: colors.foreground,
          border: colors.border,
        }
      case 'secondary':
      default:
        return {
          bg: colors.muted,
          text: colors.foreground,
        }
    }
  }

  const badgeStyles = getBadgeStyles()

  const authorName = wish.author?.name || wish.author_email?.split('@')[0] || 'Anonymous'

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.lg,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        {/* Vote Button */}
        <TouchableOpacity
          onPress={handleVote}
          activeOpacity={0.8}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: localVote.hasVoted ? colors.primary : colors.border,
            backgroundColor: localVote.hasVoted ? colors.primary + '15' : 'transparent',
            minWidth: 60,
          }}
        >
          <ArrowBigUp
            size={20}
            color={localVote.hasVoted ? colors.primary : colors.mutedForeground}
            fill={localVote.hasVoted ? colors.primary : 'transparent'}
            strokeWidth={2}
          />
          <Text
            style={{
              fontSize: typography.xs,
              fontWeight: '700',
              color: localVote.hasVoted ? colors.primary : colors.mutedForeground,
              marginTop: 2,
            }}
          >
            {localVote.count}
          </Text>
        </TouchableOpacity>

        {/* Content */}
        <View style={{ flex: 1 }}>
          {/* Title Row with Status Badge */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text
              style={{
                fontSize: typography.sm,
                fontWeight: '600',
                color: colors.foreground,
                flex: 1,
                marginRight: spacing.sm,
                lineHeight: 20,
              }}
              numberOfLines={2}
            >
              {wish.title}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: badgeStyles.bg,
                paddingHorizontal: spacing.sm,
                paddingVertical: 2,
                borderRadius: radius.md,
                borderWidth: badgeStyles.border ? 1 : 0,
                borderColor: badgeStyles.border,
              }}
            >
              <StatusIcon size={12} color={badgeStyles.text} strokeWidth={2} />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '500',
                  color: badgeStyles.text,
                }}
              >
                {status.label}
              </Text>
            </View>
          </View>

          {/* Description */}
          {wish.description && (
            <Text
              style={{
                fontSize: typography.xs,
                color: colors.mutedForeground,
                lineHeight: 18,
                marginBottom: spacing.sm,
              }}
              numberOfLines={2}
            >
              {wish.description}
            </Text>
          )}

          {/* Footer */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            {/* Category */}
            {wish.category && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: wish.category.color || colors.primary,
                  }}
                />
                <Text style={{ fontSize: typography.xs, color: colors.mutedForeground }}>
                  {wish.category.name}
                </Text>
              </View>
            )}

            {/* Author */}
            <Text style={{ fontSize: typography.xs, color: colors.mutedForeground }}>
              {authorName}
            </Text>

            {/* Comments */}
            <TouchableOpacity
              onPress={handleCommentPress}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <MessageSquare size={12} color={colors.mutedForeground} />
              <Text style={{ fontSize: typography.xs, color: colors.mutedForeground }}>
                {wish.comment_count ?? 0}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default WishCard
