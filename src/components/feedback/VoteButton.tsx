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

/**
 * VoteButton Component
 *
 * An upvote button for wishes with optimistic updates.
 *
 * @example
 * ```tsx
 * import { VoteButton } from '@appgram/react-native'
 *
 * function WishItem({ wish }) {
 *   return (
 *     <View style={styles.row}>
 *       <VoteButton
 *         wishId={wish.id}
 *         initialVoteCount={wish.vote_count}
 *         initialHasVoted={wish.has_voted}
 *         onVoteChange={(hasVoted, newCount) => {
 *           console.log('Vote changed:', { hasVoted, newCount })
 *         }}
 *       />
 *       <Text>{wish.title}</Text>
 *     </View>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Different sizes
 * <VoteButton wishId={id} initialVoteCount={10} size="sm" />
 * <VoteButton wishId={id} initialVoteCount={10} size="md" />
 * <VoteButton wishId={id} initialVoteCount={10} size="lg" />
 * ```
 */
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
        checkVote(wishId).then(({ voteId: id }) => setVoteId(id))
        onVoteChange?.(true, newCount)
      }
    }
  }

  const sizeConfig = {
    sm: { padding: 8, iconSize: 16, fontSize: typography.xs },
    md: { padding: 12, iconSize: 20, fontSize: typography.sm },
    lg: { padding: 16, iconSize: 24, fontSize: typography.base },
  }

  const config = sizeConfig[size]
  const textColor = hasVoted ? '#FFFFFF' : colors.foreground

  const containerStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hasVoted ? colors.primary : colors.muted,
    borderRadius: radius.md,
    padding: config.padding,
    minWidth: 48,
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isVoting}
      activeOpacity={0.7}
      style={style}
    >
      <View style={containerStyle}>
        {isVoting ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <>
            <View
              style={{
                width: 0,
                height: 0,
                borderLeftWidth: config.iconSize / 2,
                borderRightWidth: config.iconSize / 2,
                borderBottomWidth: config.iconSize * 0.6,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: textColor,
                marginBottom: 4,
              }}
            />
            <Text
              style={{
                fontSize: config.fontSize,
                fontWeight: '600',
                color: textColor,
              }}
            >
              {voteCount}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default VoteButton
