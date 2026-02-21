import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native'

const SCREEN_HEIGHT = Dimensions.get('window').height
import { ArrowBigUp, MessageSquare } from 'lucide-react-native'
import { useAppgramTheme } from '../../provider'
import { useRoadmap } from '../../hooks'
import { WishDetailModal } from '../feedback/WishDetailModal'
import type { RoadmapItem, RoadmapColumn, Wish } from '../../types'

export interface RoadmapBoardProps {
  title?: string
  description?: string
  showVoteCounts?: boolean
  onItemPress?: (item: RoadmapItem) => void
}

const COLUMN_COLORS = ['#6B7280', '#F59E0B', '#3B82F6', '#10B981'] as const

/**
 * RoadmapBoard Component
 *
 * A horizontal scrollable Kanban-style roadmap displaying columns and items.
 * Tapping an item opens the WishDetailModal for voting and comments.
 *
 * @example
 * ```tsx
 * import { RoadmapBoard } from '@appgram/react-native'
 *
 * function RoadmapScreen() {
 *   return (
 *     <RoadmapBoard
 *       title="Product Roadmap"
 *       description="See what we're working on"
 *       showVoteCounts
 *       onItemPress={(item) => console.log('Selected:', item.title)}
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Minimal usage
 * <RoadmapBoard />
 * ```
 */
export function RoadmapBoard({ title = 'Roadmap', description, showVoteCounts = true, onItemPress }: RoadmapBoardProps) {
  const { colors, radius, typography, spacing } = useAppgramTheme()
  const { columns: fetchedColumns, isLoading, error } = useRoadmap()
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [localColumns, setLocalColumns] = useState<RoadmapColumn[]>([])

  // Sync fetched columns to local state
  useEffect(() => {
    setLocalColumns(fetchedColumns)
  }, [fetchedColumns])

  const handleItemPress = (item: RoadmapItem) => {
    onItemPress?.(item)
    if (item.wish) {
      setSelectedWish(item.wish)
      setSelectedItemId(item.id)
    }
  }

  const handleVote = useCallback((wishId: string) => {
    // Update vote count in local columns when vote changes
    setLocalColumns(cols => cols.map(col => ({
      ...col,
      items: col.items?.map(item => {
        if (item.wish?.id === wishId || item.wish_id === wishId) {
          const currentCount = item.vote_count || item.wish?.vote_count || 0
          return {
            ...item,
            vote_count: currentCount + 1,
            wish: item.wish ? { ...item.wish, vote_count: (item.wish.vote_count || 0) + 1 } : item.wish
          }
        }
        return item
      })
    })))
  }, [])

  const getItemVoteCount = (item: RoadmapItem): number => {
    return item.vote_count ?? item.wish?.vote_count ?? 0
  }

  const getItemCommentCount = (item: RoadmapItem): number => {
    return item.comment_count ?? item.wish?.comment_count ?? 0
  }

  const renderItem = (item: RoadmapItem) => {
    const voteCount = getItemVoteCount(item)
    const commentCount = getItemCommentCount(item)

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.8}
        style={{
          backgroundColor: colors.card,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
        }}
      >
        <Text style={{ fontSize: typography.sm, fontWeight: '600', color: colors.foreground, marginBottom: spacing.xs, lineHeight: 20 }}>{item.title}</Text>
        {item.description && (
          <Text style={{ fontSize: typography.xs, color: colors.mutedForeground, marginBottom: spacing.sm, lineHeight: 18 }} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        {showVoteCounts && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingTop: spacing.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.muted, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm }}>
              <ArrowBigUp size={14} color={colors.primary} />
              <Text style={{ fontSize: typography.xs, fontWeight: '600', color: colors.foreground }}>{voteCount}</Text>
            </View>
            {commentCount > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MessageSquare size={12} color={colors.mutedForeground} />
                <Text style={{ fontSize: typography.xs, color: colors.mutedForeground }}>{commentCount}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    )
  }

  if (isLoading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={colors.primary} /></View>
  if (error) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: colors.error }}>{error}</Text></View>
  if (localColumns.length === 0) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
      <Text style={{ color: colors.mutedForeground, fontSize: typography.base, textAlign: 'center' }}>No roadmap data available</Text>
    </View>
  )

  return (
    <View style={{ flex: 1 }}>
      {(title || description) && (
        <View style={{ paddingVertical: spacing.lg, paddingBottom: 0 }}>
          {title && <Text style={{ fontSize: typography['2xl'], fontWeight: '600', color: colors.foreground, marginBottom: spacing.xs }}>{title}</Text>}
          {description && <Text style={{ fontSize: typography.base, color: colors.mutedForeground }}>{description}</Text>}
        </View>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: spacing.lg }}
      >
        {localColumns.map((column, index) => {
          // Calculate column height: screen height minus header, title section, padding, and column header
          const columnHeight = SCREEN_HEIGHT - 200
          return (
            <View key={column.id} style={{ width: 280, marginRight: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLUMN_COLORS[index % COLUMN_COLORS.length] }} />
                <Text style={{ fontSize: typography.lg, fontWeight: '600', color: colors.foreground }}>{column.name}</Text>
                <View style={{ backgroundColor: colors.muted, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full }}>
                  <Text style={{ fontSize: typography.xs, fontWeight: '500', color: colors.mutedForeground }}>{column.items?.length || 0}</Text>
                </View>
              </View>
              <ScrollView
                style={{ backgroundColor: colors.muted, borderRadius: radius.lg, maxHeight: columnHeight }}
                contentContainerStyle={{ padding: spacing.md }}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {column.items && column.items.length > 0
                  ? column.items.map(item => renderItem(item))
                  : <Text style={{ fontSize: typography.sm, color: colors.mutedForeground, textAlign: 'center', padding: spacing.xl }}>No items</Text>
                }
              </ScrollView>
            </View>
          )
        })}
      </ScrollView>

      <WishDetailModal
        wish={selectedWish}
        visible={!!selectedWish}
        onClose={() => { setSelectedWish(null); setSelectedItemId(null) }}
        onVote={handleVote}
      />
    </View>
  )
}

export default RoadmapBoard
