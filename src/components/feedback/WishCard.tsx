/**
 * WishCard Component
 *
 * A card displaying a wish/feature request with Hazel design system styling.
 */

import React from 'react'
import { View, Text, TouchableOpacity, type ViewStyle } from 'react-native'
import { useAppgramTheme } from '../../provider'
import { Badge } from '../base'
import { VoteButton } from './VoteButton'
import type { Wish } from '../../types'

export interface WishCardProps {
  wish: Wish
  onPress?: (wish: Wish) => void
  onVoteChange?: (wishId: string, hasVoted: boolean, newCount: number) => void
  showStatus?: boolean
  showCategory?: boolean
  style?: ViewStyle
}

const STATUS_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
  pending: 'default',
  planned: 'info',
  in_progress: 'warning',
  completed: 'success',
}

export function WishCard({
  wish,
  onPress,
  onVoteChange,
  showStatus = true,
  showCategory = true,
  style,
}: WishCardProps): React.ReactElement {
  const { colors, radius, typography, spacing } = useAppgramTheme()

  const containerStyle: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
  }

  const handlePress = () => {
    onPress?.(wish)
  }

  const handleVoteChange = (hasVoted: boolean, newCount: number) => {
    onVoteChange?.(wish.id, hasVoted, newCount)
  }

  const statusLabel = wish.status?.replace('_', ' ') || 'pending'

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[containerStyle, style]}
    >
      {/* Vote Button */}
      <VoteButton
        wishId={wish.id}
        initialVoteCount={wish.vote_count || 0}
        initialHasVoted={wish.has_voted}
        onVoteChange={handleVoteChange}
        size="md"
        style={{ marginRight: spacing.md }}
      />

      {/* Content */}
      <View style={{ flex: 1 }}>
        {/* Title */}
        <Text
          style={{
            fontSize: typography.base,
            fontWeight: '600',
            color: colors.foreground,
            marginBottom: spacing.xs,
          }}
          numberOfLines={2}
        >
          {wish.title}
        </Text>

        {/* Description */}
        {wish.description && (
          <Text
            style={{
              fontSize: typography.sm,
              color: colors.mutedForeground,
              marginBottom: spacing.sm,
            }}
            numberOfLines={2}
          >
            {wish.description}
          </Text>
        )}

        {/* Meta */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {showStatus && (
            <Badge variant={STATUS_VARIANTS[wish.status || 'pending'] || 'default'}>
              {statusLabel}
            </Badge>
          )}
          {showCategory && wish.category?.name && (
            <Badge variant="default">{wish.category.name}</Badge>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default WishCard
