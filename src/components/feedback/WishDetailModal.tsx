import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Modal, View, Text, ScrollView, TouchableOpacity, TouchableWithoutFeedback, TextInput, ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform, Animated, PanResponder } from 'react-native'
import { X, ArrowBigUp, MessageSquare, Send } from 'lucide-react-native'
import { useAppgramTheme } from '../../provider'
import { useComments } from '../../hooks/useComments'
import { useVote } from '../../hooks/useVote'
import type { Wish, Comment } from '../../types'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85
const DISMISS_THRESHOLD = 150

export interface WishDetailModalProps {
  wish: Wish | null
  visible: boolean
  onClose: () => void
  onVote?: (wishId: string) => void
}

const STATUS = {
  pending: { label: 'New', color: '#6B7280' },
  under_review: { label: 'Reviewing', color: '#F59E0B' },
  planned: { label: 'Planned', color: '#3B82F6' },
  in_progress: { label: 'In Progress', color: '#8B5CF6' },
  completed: { label: 'Shipped', color: '#10B981' },
  declined: { label: 'Closed', color: '#EF4444' },
} as const

const CommentItem = ({ comment, colors, typography, spacing }: { comment: Comment; colors: any; typography: any; spacing: any }) => {
  const isTeam = comment.is_official || comment.author_type === 'team_member'
  return (
    <View style={{ paddingVertical: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 4 }}>
        <Text style={{ fontSize: typography.sm, fontWeight: '500', color: colors.foreground }}>{comment.author_name || 'Anonymous'}</Text>
        {isTeam && <View style={{ backgroundColor: colors.primary, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 }}><Text style={{ fontSize: 9, fontWeight: '600', color: '#FFF' }}>Team</Text></View>}
        <Text style={{ fontSize: typography.xs, color: colors.mutedForeground }}>{new Date(comment.created_at).toLocaleDateString()}</Text>
      </View>
      <Text style={{ fontSize: typography.sm, color: colors.foreground, lineHeight: 20 }}>{comment.content}</Text>
    </View>
  )
}

/**
 * WishDetailModal Component
 *
 * A bottom sheet modal displaying wish details, voting, and comments.
 * Supports swipe-to-dismiss and inline comment submission.
 *
 * @example
 * ```tsx
 * import { WishDetailModal } from '@appgram/react-native'
 *
 * function WishListScreen() {
 *   const [selectedWish, setSelectedWish] = useState<Wish | null>(null)
 *
 *   return (
 *     <>
 *       <FlatList
 *         data={wishes}
 *         renderItem={({ item }) => (
 *           <WishCard wish={item} onPress={() => setSelectedWish(item)} />
 *         )}
 *       />
 *       <WishDetailModal
 *         wish={selectedWish}
 *         visible={!!selectedWish}
 *         onClose={() => setSelectedWish(null)}
 *         onVote={(wishId) => console.log('Voted:', wishId)}
 *       />
 *     </>
 *   )
 * }
 * ```
 */
export function WishDetailModal({ wish, visible, onClose, onVote }: WishDetailModalProps): React.ReactElement | null {
  const { colors, radius, typography, spacing } = useAppgramTheme()
  const [voteState, setVoteState] = useState({ voted: wish?.has_voted || false, count: wish?.vote_count || 0, voteId: '' })
  const [text, setText] = useState('')
  const { comments, isLoading, error, addComment, isSubmitting } = useComments({ wishId: visible && wish ? wish.id : null })
  const { vote: apiVote, unvote: apiUnvote, checkVote, isVoting } = useVote()

  const translateY = useRef(new Animated.Value(0)).current

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) translateY.setValue(gestureState.dy)
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DISMISS_THRESHOLD) {
          Animated.timing(translateY, { toValue: SHEET_HEIGHT, duration: 200, useNativeDriver: true }).start(onClose)
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 8 }).start()
        }
      },
    })
  ).current

  useEffect(() => {
    if (visible) translateY.setValue(0)
  }, [visible, translateY])

  // Initialize vote state from wish and check actual vote status
  useEffect(() => {
    if (wish && visible) {
      setVoteState({ voted: wish.has_voted || false, count: wish.vote_count || 0, voteId: '' })
      // Check actual vote status from API
      checkVote(wish.id).then(result => {
        if (result.hasVoted) {
          setVoteState(v => ({ ...v, voted: true, voteId: result.voteId || '' }))
        }
      })
    }
  }, [wish, visible, checkVote])

  const handleVote = useCallback(async () => {
    if (!wish || isVoting) return

    if (voteState.voted && voteState.voteId) {
      // Unvote - optimistic update
      setVoteState(v => ({ ...v, voted: false, count: Math.max(0, v.count - 1) }))
      const success = await apiUnvote(wish.id, voteState.voteId, voteState.count)
      if (!success) {
        // Revert on failure
        setVoteState(v => ({ ...v, voted: true, count: v.count + 1 }))
      } else {
        setVoteState(v => ({ ...v, voteId: '' }))
        onVote?.(wish.id)
      }
    } else {
      // Vote - optimistic update
      setVoteState(v => ({ ...v, voted: true, count: v.count + 1 }))
      const success = await apiVote(wish.id, voteState.count)
      if (!success) {
        // Revert on failure
        setVoteState(v => ({ ...v, voted: false, count: Math.max(0, v.count - 1) }))
      } else {
        // Fetch the voteId for potential unvote later
        const result = await checkVote(wish.id)
        if (result.voteId) {
          setVoteState(v => ({ ...v, voteId: result.voteId || '' }))
        }
        onVote?.(wish.id)
      }
    }
  }, [wish, voteState, isVoting, apiVote, apiUnvote, checkVote, onVote])

  if (!wish) return null

  const status = STATUS[wish.status as keyof typeof STATUS] || STATUS.pending
  const handleComment = async () => { if (text.trim() && await addComment(text.trim())) setText('') }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <TouchableWithoutFeedback onPress={onClose}><View style={{ flex: 1 }} /></TouchableWithoutFeedback>
          <Animated.View style={{ backgroundColor: colors.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, height: SHEET_HEIGHT, transform: [{ translateY }] }}>
            {/* Drag Handle */}
            <View {...panResponder.panHandlers} style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
              <View style={{ width: 40, height: 5, backgroundColor: colors.border, borderRadius: 3 }} />
            </View>

            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
              <Text style={{ fontSize: typography.lg, fontWeight: '600', color: colors.foreground, flex: 1 }}>{wish.title}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={{ marginLeft: spacing.md }}>
                <X size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }} bounces>
              {/* Status + Meta */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
                <View style={{ backgroundColor: status.color + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm }}>
                  <Text style={{ fontSize: typography.xs, fontWeight: '600', color: status.color }}>{status.label}</Text>
                </View>
                <Text style={{ fontSize: typography.xs, color: colors.mutedForeground }}>
                  {wish.category ? `${wish.category.name} · ` : ''}by {wish.author?.name || wish.author_email?.split('@')[0] || 'Anonymous'}
                </Text>
              </View>

              {/* Description */}
              {wish.description && <Text style={{ fontSize: typography.sm, color: colors.foreground, lineHeight: 22, marginBottom: spacing.md }}>{wish.description}</Text>}

              {/* Actions */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.lg, paddingTop: spacing.sm }}>
                <TouchableOpacity onPress={handleVote} disabled={isVoting} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, opacity: isVoting ? 0.6 : 1 }}>
                  {isVoting ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <ArrowBigUp size={20} color={voteState.voted ? colors.primary : colors.mutedForeground} fill={voteState.voted ? colors.primary : 'transparent'} />
                  )}
                  <Text style={{ fontSize: typography.sm, fontWeight: '500', color: voteState.voted ? colors.primary : colors.mutedForeground }}>{voteState.count} votes</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MessageSquare size={18} color={colors.mutedForeground} />
                  <Text style={{ fontSize: typography.sm, color: colors.mutedForeground }}>{comments.length} comments</Text>
                </View>
              </View>

              {/* Comments */}
              <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md }}>
                {isLoading ? <ActivityIndicator color={colors.primary} style={{ padding: spacing.lg }} />
                  : error ? <Text style={{ color: colors.error }}>{error}</Text>
                  : comments.length === 0 ? <Text style={{ color: colors.mutedForeground, fontSize: typography.sm }}>No comments yet</Text>
                  : comments.map(c => <CommentItem key={c.id} comment={c} colors={colors} typography={typography} spacing={spacing} />)}
              </View>
            </ScrollView>

            {/* Input */}
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.lg + 34, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm }}>
              <TextInput style={{ flex: 1, backgroundColor: colors.muted, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.sm, color: colors.foreground, maxHeight: 80 }} placeholder="Add a comment..." placeholderTextColor={colors.mutedForeground} value={text} onChangeText={setText} multiline />
              <TouchableOpacity onPress={handleComment} disabled={!text.trim() || isSubmitting} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: text.trim() ? colors.primary : colors.muted, alignItems: 'center', justifyContent: 'center' }}>
                {isSubmitting ? <ActivityIndicator size="small" color="#FFF" /> : <Send size={18} color={text.trim() ? '#FFF' : colors.mutedForeground} />}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export default WishDetailModal
