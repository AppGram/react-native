/**
 * useVote Hook
 *
 * Manages voting state and actions for wishes.
 * Provides imperative vote/unvote/check methods for custom implementations.
 *
 * @example
 * ```tsx
 * import { useVote } from '@appgram/react-native'
 *
 * function CustomVoteButton({ wish }) {
 *   const { vote, unvote, checkVote, isVoting } = useVote({
 *     onVote: (wishId, hasVoted, newCount) => {
 *       console.log('Vote changed:', { wishId, hasVoted, newCount })
 *     },
 *   })
 *
 *   const [hasVoted, setHasVoted] = useState(wish.has_voted)
 *   const [count, setCount] = useState(wish.vote_count)
 *   const [voteId, setVoteId] = useState<string>()
 *
 *   const handlePress = async () => {
 *     if (hasVoted && voteId) {
 *       const success = await unvote(wish.id, voteId, count)
 *       if (success) {
 *         setHasVoted(false)
 *         setCount(c => c - 1)
 *       }
 *     } else {
 *       const success = await vote(wish.id, count)
 *       if (success) {
 *         setHasVoted(true)
 *         setCount(c => c + 1)
 *       }
 *     }
 *   }
 *
 *   return (
 *     <TouchableOpacity onPress={handlePress} disabled={isVoting}>
 *       <Text>{hasVoted ? '✓' : '▲'} {count}</Text>
 *     </TouchableOpacity>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Check vote status on mount
 * useEffect(() => {
 *   checkVote(wish.id).then(({ hasVoted, voteId }) => {
 *     setHasVoted(hasVoted)
 *     setVoteId(voteId)
 *   })
 * }, [wish.id])
 * ```
 */

import { useState, useCallback } from 'react'
import { useAppgramContext } from '../provider'
import { getErrorMessage } from '../utils'

export interface UseVoteOptions {
  /**
   * Callback when a vote action completes successfully
   */
  onVote?: (wishId: string, hasVoted: boolean, newCount: number) => void

  /**
   * Callback when a vote action fails
   */
  onError?: (error: string) => void
}

export interface UseVoteResult {
  /**
   * Cast a vote on a wish
   * @returns true if successful
   */
  vote: (wishId: string, currentVoteCount: number) => Promise<boolean>

  /**
   * Remove a vote from a wish
   * @returns true if successful
   */
  unvote: (wishId: string, voteId: string, currentVoteCount: number) => Promise<boolean>

  /**
   * Check if the current user has voted on a wish
   * @returns vote status and vote ID if voted
   */
  checkVote: (wishId: string) => Promise<{ hasVoted: boolean; voteId?: string }>

  /**
   * Loading state for vote operations
   */
  isVoting: boolean

  /**
   * Error message if any
   */
  error: string | null
}

export function useVote(options: UseVoteOptions = {}): UseVoteResult {
  const { client, fingerprint } = useAppgramContext()
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const vote = useCallback(async (wishId: string, currentVoteCount: number): Promise<boolean> => {
    if (!fingerprint) {
      setError('Unable to vote: fingerprint not available')
      return false
    }

    setIsVoting(true)
    setError(null)

    try {
      const response = await client.createVote(wishId, fingerprint)

      if (response.success) {
        options.onVote?.(wishId, true, currentVoteCount + 1)
        return true
      } else {
        const errorMsg = getErrorMessage(response.error, 'Failed to vote')
        setError(errorMsg)
        options.onError?.(errorMsg)
        return false
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err, 'An error occurred')
      setError(errorMsg)
      options.onError?.(errorMsg)
      return false
    } finally {
      setIsVoting(false)
    }
  }, [client, fingerprint, options])

  const unvote = useCallback(async (
    wishId: string,
    voteId: string,
    currentVoteCount: number
  ): Promise<boolean> => {
    setIsVoting(true)
    setError(null)

    try {
      const response = await client.deleteVote(voteId)

      if (response.success) {
        options.onVote?.(wishId, false, Math.max(0, currentVoteCount - 1))
        return true
      } else {
        const errorMsg = getErrorMessage(response.error, 'Failed to remove vote')
        setError(errorMsg)
        options.onError?.(errorMsg)
        return false
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err, 'An error occurred')
      setError(errorMsg)
      options.onError?.(errorMsg)
      return false
    } finally {
      setIsVoting(false)
    }
  }, [client, options])

  const checkVote = useCallback(async (wishId: string): Promise<{ hasVoted: boolean; voteId?: string }> => {
    if (!fingerprint) {
      return { hasVoted: false }
    }

    try {
      const response = await client.checkVote(wishId, fingerprint)

      if (response.success && response.data) {
        return {
          hasVoted: response.data.has_voted,
          voteId: response.data.vote_id,
        }
      }
      return { hasVoted: false }
    } catch {
      return { hasVoted: false }
    }
  }, [client, fingerprint])

  return {
    vote,
    unvote,
    checkVote,
    isVoting,
    error,
  }
}
