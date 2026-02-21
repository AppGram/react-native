/**
 * useVote Hook
 *
 * Manages voting on wishes with optimistic updates.
 */

import { useState, useCallback } from 'react'
import { useAppgramContext } from '../provider'
import { getErrorMessage } from '../utils'

export interface UseVoteOptions {
  onVote?: (wishId: string, hasVoted: boolean, newCount: number) => void
  onError?: (error: string) => void
}

export interface UseVoteResult {
  vote: (wishId: string, currentVoteCount: number) => Promise<boolean>
  unvote: (wishId: string, voteId: string, currentVoteCount: number) => Promise<boolean>
  checkVote: (wishId: string) => Promise<{ hasVoted: boolean; voteId?: string }>
  isVoting: boolean
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
