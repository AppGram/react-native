/**
 * WishList Component
 *
 * A list of wishes with loading and empty states.
 */

import React from 'react'
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  type ViewStyle,
} from 'react-native'
import { useAppgramTheme } from '../../provider'
import { useWishes } from '../../hooks'
import { WishCard } from './WishCard'
import type { Wish, WishFilters } from '../../types'

export interface WishListProps {
  filters?: WishFilters
  onWishPress?: (wish: Wish) => void
  onVoteChange?: (wishId: string, hasVoted: boolean, newCount: number) => void
  emptyText?: string
  refreshInterval?: number
  style?: ViewStyle
  contentContainerStyle?: ViewStyle
}

export function WishList({
  filters,
  onWishPress,
  onVoteChange,
  emptyText = 'No wishes yet',
  refreshInterval = 0,
  style,
  contentContainerStyle,
}: WishListProps): React.ReactElement {
  const { colors, typography, spacing } = useAppgramTheme()
  const { wishes, isLoading, error, refetch } = useWishes({ filters, refreshInterval })

  const [refreshing, setRefreshing] = React.useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const renderItem = ({ item }: { item: Wish }) => (
    <WishCard
      wish={item}
      onPress={onWishPress}
      onVoteChange={onVoteChange}
      style={{ marginBottom: spacing.md }}
    />
  )

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )
    }

    if (error) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
          <Text style={{ fontSize: typography.base, color: colors.error, textAlign: 'center' }}>
            {error}
          </Text>
        </View>
      )
    }

    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
        <Text style={{ fontSize: typography.base, color: colors.mutedForeground, textAlign: 'center' }}>
          {emptyText}
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      data={wishes}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      style={style}
      contentContainerStyle={[
        { padding: spacing.lg },
        wishes.length === 0 && { flex: 1 },
        contentContainerStyle,
      ]}
    />
  )
}

export default WishList
