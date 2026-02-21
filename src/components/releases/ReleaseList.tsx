import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import { Calendar, Tag, ChevronRight } from 'lucide-react-native'
import { useAppgramTheme } from '../../provider'
import { useReleases } from '../../hooks'
import type { Release } from '../../types'

export interface ReleaseListProps {
  title?: string
  description?: string
  limit?: number
  onReleasePress?: (release: Release) => void
}

/**
 * ReleaseList Component
 *
 * A list of product releases with version badges and dates.
 * Use this for custom navigation instead of the full Releases component.
 *
 * @example
 * ```tsx
 * import { ReleaseList } from '@appgram/react-native'
 *
 * function ChangelogScreen() {
 *   return (
 *     <ReleaseList
 *       title="Changelog"
 *       description="See what's new"
 *       limit={20}
 *       onReleasePress={(release) => {
 *         navigation.navigate('ReleaseDetail', { slug: release.slug })
 *       }}
 *     />
 *   )
 * }
 * ```
 */
export function ReleaseList({ title = 'Changelog', description, limit = 20, onReleasePress }: ReleaseListProps) {
  const { colors, radius, typography, spacing } = useAppgramTheme()
  const { releases, isLoading, error, refetch } = useReleases({ limit })
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => { setRefreshing(true); await refetch(); setRefreshing(false) }

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const renderRelease = ({ item }: { item: Release }) => (
    <TouchableOpacity
      onPress={() => onReleasePress?.(item)}
      activeOpacity={0.7}
      style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
            {item.version && (
              <View style={{ backgroundColor: colors.primary + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm }}>
                <Text style={{ fontSize: typography.xs, fontWeight: '600', color: colors.primary }}>{item.version}</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Calendar size={12} color={colors.mutedForeground} />
              <Text style={{ fontSize: typography.xs, color: colors.mutedForeground }}>{formatDate(item.published_at || item.created_at)}</Text>
            </View>
          </View>
          <Text style={{ fontSize: typography.base, fontWeight: '600', color: colors.foreground, marginBottom: spacing.xs }}>{item.title}</Text>
          {item.excerpt && <Text style={{ fontSize: typography.sm, color: colors.mutedForeground }} numberOfLines={2}>{item.excerpt}</Text>}
          {item.labels && item.labels.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm }}>
              <Tag size={12} color={colors.mutedForeground} />
              {item.labels.slice(0, 3).map((label: string, i: number) => (
                <Text key={i} style={{ fontSize: typography.xs, color: colors.mutedForeground }}>{label}{i < Math.min(item.labels.length, 3) - 1 ? ',' : ''}</Text>
              ))}
            </View>
          )}
        </View>
        <ChevronRight size={20} color={colors.mutedForeground} />
      </View>
    </TouchableOpacity>
  )

  const renderHeader = () => (
    <View style={{ marginBottom: spacing.lg }}>
      {title && <Text style={{ fontSize: typography['2xl'], fontWeight: '600', color: colors.foreground, marginBottom: spacing.xs }}>{title}</Text>}
      {description && <Text style={{ fontSize: typography.base, color: colors.mutedForeground }}>{description}</Text>}
    </View>
  )

  const renderEmpty = () => {
    if (isLoading) return <ActivityIndicator size="large" color={colors.primary} style={{ padding: spacing.xl }} />
    if (error) return <Text style={{ color: colors.error, textAlign: 'center', padding: spacing.xl }}>{error}</Text>
    return <Text style={{ color: colors.mutedForeground, textAlign: 'center', padding: spacing.xl }}>No releases yet</Text>
  }

  return (
    <FlatList
      data={releases}
      renderItem={renderRelease}
      keyExtractor={item => item.id}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      contentContainerStyle={{ paddingVertical: spacing.lg, flexGrow: 1 }}
    />
  )
}

export default ReleaseList
