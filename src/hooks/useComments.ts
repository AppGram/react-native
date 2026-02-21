/**
 * useComments Hook
 *
 * Fetches and manages comments for a wish.
 *
 * @example
 * ```tsx
 * import { useComments } from '@appgram/react-native'
 *
 * function WishComments({ wishId }) {
 *   const {
 *     comments,
 *     isLoading,
 *     error,
 *     addComment,
 *     isSubmitting,
 *     refetch,
 *   } = useComments({ wishId })
 *
 *   const [newComment, setNewComment] = useState('')
 *
 *   const handleSubmit = async () => {
 *     const success = await addComment(newComment, 'John Doe', 'john@example.com')
 *     if (success) {
 *       setNewComment('')
 *     }
 *   }
 *
 *   if (isLoading) return <ActivityIndicator />
 *   if (error) return <Text>{error}</Text>
 *
 *   return (
 *     <View>
 *       <FlatList
 *         data={comments}
 *         renderItem={({ item }) => (
 *           <View style={styles.comment}>
 *             <Text style={styles.author}>{item.author_name}</Text>
 *             <Text>{item.content}</Text>
 *           </View>
 *         )}
 *         keyExtractor={(item) => item.id}
 *       />
 *       <TextInput
 *         value={newComment}
 *         onChangeText={setNewComment}
 *         placeholder="Add a comment..."
 *       />
 *       <Button
 *         title={isSubmitting ? 'Posting...' : 'Post'}
 *         onPress={handleSubmit}
 *         disabled={isSubmitting || !newComment.trim()}
 *       />
 *     </View>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Lazy loading comments
 * const { comments, refetch } = useComments({
 *   wishId: wish.id,
 *   autoFetch: false, // Don't fetch on mount
 * })
 *
 * // Fetch when needed
 * const handleExpandComments = () => {
 *   refetch()
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react'
import { useAppgramContext } from '../provider'
import { getErrorMessage } from '../utils'
import type { Comment } from '../types'

export interface UseCommentsOptions {
  /**
   * The wish ID to fetch comments for
   */
  wishId: string | null

  /**
   * Whether to fetch comments automatically on mount
   * @default true
   */
  autoFetch?: boolean
}

export interface UseCommentsResult {
  /**
   * List of comments
   */
  comments: Comment[]

  /**
   * Loading state for initial fetch
   */
  isLoading: boolean

  /**
   * Error message if any
   */
  error: string | null

  /**
   * Manually refetch comments
   */
  refetch: () => Promise<void>

  /**
   * Add a new comment
   * @returns true if successful
   */
  addComment: (content: string, authorName?: string, authorEmail?: string) => Promise<boolean>

  /**
   * Loading state while submitting a comment
   */
  isSubmitting: boolean
}

export function useComments({
  wishId,
  autoFetch = true,
}: UseCommentsOptions): UseCommentsResult {
  const { client } = useAppgramContext()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    if (!wishId) {
      setComments([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getComments(wishId)

      if (response.success && response.data) {
        const commentsData = response.data.data || []
        setComments(commentsData)
      } else {
        setError(getErrorMessage(response.error, 'Failed to load comments'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, wishId])

  const addComment = useCallback(async (
    content: string,
    authorName?: string,
    authorEmail?: string
  ): Promise<boolean> => {
    if (!wishId) return false

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await client.createComment({
        wish_id: wishId,
        content,
        author_name: authorName,
        author_email: authorEmail,
      })

      if (response.success && response.data) {
        // Add new comment to the list
        setComments(prev => [response.data!, ...prev])
        return true
      } else {
        setError(getErrorMessage(response.error, 'Failed to post comment'))
        return false
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [client, wishId])

  useEffect(() => {
    if (autoFetch && wishId) {
      fetchComments()
    }
  }, [autoFetch, wishId, fetchComments])

  return {
    comments,
    isLoading,
    error,
    refetch: fetchComments,
    addComment,
    isSubmitting,
  }
}
