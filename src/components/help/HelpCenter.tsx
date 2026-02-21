/**
 * HelpCenter Component
 *
 * Displays help center flows/collections in a grid layout.
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
import { useHelpCenter } from '../../hooks/useHelpCenter'
import { HelpFlowCard } from './HelpFlowCard'
import type { HelpFlow } from '../../types'

export interface HelpCenterProps {
  title?: string
  description?: string
  onFlowPress?: (flow: HelpFlow) => void
  emptyText?: string
  numColumns?: number
  style?: ViewStyle
  contentContainerStyle?: ViewStyle
}

export function HelpCenter({
  title = 'Help Center',
  description = 'Find answers to common questions',
  onFlowPress,
  emptyText = 'No help articles available',
  numColumns = 1,
  style,
  contentContainerStyle,
}: HelpCenterProps): React.ReactElement {
  const { colors, typography, spacing } = useAppgramTheme()
  const { flows, isLoading, error, refetch } = useHelpCenter()

  const [refreshing, setRefreshing] = React.useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const renderItem = ({ item, index }: { item: HelpFlow; index: number }) => (
    <HelpFlowCard
      flow={item}
      onPress={onFlowPress}
      style={{
        flex: 1,
        marginBottom: spacing.md,
        marginRight: numColumns > 1 && index % numColumns !== numColumns - 1 ? spacing.md : 0,
      }}
    />
  )

  const renderHeader = () => (
    <View style={{ marginBottom: spacing.lg }}>
      <Text
        style={{
          fontSize: typography['2xl'],
          fontWeight: '700',
          color: colors.foreground,
          marginBottom: spacing.xs,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: typography.base,
          color: colors.mutedForeground,
        }}
      >
        {description}
      </Text>
    </View>
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
      data={flows}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      ListHeaderComponent={renderHeader}
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
        flows.length === 0 && { flex: 1 },
        contentContainerStyle,
      ]}
    />
  )
}

export default HelpCenter
