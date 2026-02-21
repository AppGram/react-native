import React, { useState } from 'react'
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

/**
 * HelpCenter Component
 *
 * Displays help center flows/collections list.
 * Use onFlowPress to navigate to flow detail in your app.
 *
 * @example
 * ```tsx
 * import { HelpCenter } from '@appgram/react-native'
 *
 * function HelpScreen() {
 *   return (
 *     <HelpCenter
 *       title="Help Center"
 *       description="Find answers to common questions"
 *       onFlowPress={(flow) => {
 *         navigation.navigate('HelpFlow', { slug: flow.slug })
 *       }}
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With grid layout
 * <HelpCenter
 *   numColumns={2}
 *   emptyText="No help articles available yet"
 * />
 * ```
 */
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
  const [refreshing, setRefreshing] = useState(false)

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
      <Text style={{ fontSize: typography['2xl'], fontWeight: '600', color: colors.foreground, marginBottom: spacing.xs }}>
        {title}
      </Text>
      <Text style={{ fontSize: typography.base, color: colors.mutedForeground }}>
        {description}
      </Text>
    </View>
  )

  const renderEmpty = () => {
    if (isLoading) return <ActivityIndicator size="large" color={colors.primary} style={{ padding: spacing.lg }} />
    if (error) return <Text style={{ color: colors.error, textAlign: 'center', padding: spacing.lg }}>{error}</Text>
    return <Text style={{ color: colors.mutedForeground, textAlign: 'center', padding: spacing.lg }}>{emptyText}</Text>
  }

  return (
    <FlatList
      key={`flows-list-${numColumns}`}
      data={flows}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      style={style}
      contentContainerStyle={[{ paddingVertical: spacing.lg, flexGrow: 1 }, contentContainerStyle]}
    />
  )
}

export default HelpCenter
