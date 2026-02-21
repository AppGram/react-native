/**
 * VoteButton Component
 *
 * An upvote button for wishes with Hazel design system styling.
 */

import React, { useState, useEffect } from 'react'
import {
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  type ViewStyle,
} from 'react-native'
import { useAppgramTheme } from '../../provider'
import { useVote } from '../../hooks'

export interface VoteButtonProps {
  wishId: string
  initialVoteCount: number
  initialHasVoted?: boolean
  initialVoteId?: string
  onVoteChange?: (hasVoted: boolean, newCount: number) => void
  size?: 'sm' | 'md' | 'lg'
  style?: ViewStyle
}

export function VoteButton({
  wishId,
  initialVoteCount,
  initialHasVoted = false,
  initialVoteId,
  onVoteChange,
  size = 'md',
  style,
}: VoteButtonProps): React.ReactElement {
  const { colors, radius, typography } = useAppgramTheme()
  const { vote, unvote, checkVote, isVoting } = useVote()

  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [hasVoted, setHasVoted] = useState(initialHasVoted)
  const [voteId, setVoteId] = useState<string | undefined>(initialVoteId)

  // Check vote status on mount if not provided
  useEffect(() => {
    if (!initialHasVoted && !initialVoteId) {
      checkVote(wishId).then(({ hasVoted: voted, voteId: id }) => {
        setHasVoted(voted)
        setVoteId(id)
      })
    }
  }, [wishId, initialHasVoted, initialVoteId, checkVote])

  const handlePress = async () => {
    if (isVoting) return

    if (hasVoted && voteId) {
      const success = await unvote(wishId, voteId, voteCount)
      if (success) {
        const newCount = Math.max(0, voteCount - 1)
        setVoteCount(newCount)
        setHasVoted(false)
        setVoteId(undefined)
        onVoteChange?.(false, newCount)
      }
    } else {
      const success = await vote(wishId, voteCount)
      if (success) {
        const newCount = voteCount + 1
        setVoteCount(newCount)
        setHasVoted(true)
        // Re-check to get vote ID
        checkVote(wishId).then(({ voteId: id }) => setVoteId(id))
        onVoteChange?.(true, newCount)
      }
    }
  }

  const sizeStyles: Record<string, { padding: number; iconSize: number; fontSize: number }> = {
    sm: { padding: 8, iconSize: 16, fontSize: typography.xs },
    md: { padding: 12, iconSize: 20, fontSize: typography.sm },
    lg: { padding: 16, iconSize: 24, fontSize: typography.base },
  }

  const currentSize = sizeStyles[size]

  const containerStyle: ViewStyle = {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hasVoted ? colors.primary : colors.muted,
    borderRadius: radius.md,
    padding: currentSize.padding,
    minWidth: 48,
  }

  const textColor = hasVoted ? '#FFFFFF' : colors.foreground

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isVoting}
      style={[containerStyle, style]}
      activeOpacity={0.7}
    >
      {isVoting ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {/* Upvote Arrow */}
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: currentSize.iconSize / 2,
              borderRightWidth: currentSize.iconSize / 2,
              borderBottomWidth: currentSize.iconSize * 0.6,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: textColor,
              marginBottom: 4,
            }}
          />
          <Text
            style={{
              fontSize: currentSize.fontSize,
              fontWeight: '600',
              color: textColor,
            }}
          >
            {voteCount}
          </Text>
        </>
      )}
    </TouchableOpacity>
  )
}

export default VoteButton
