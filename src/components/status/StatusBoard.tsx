/**
 * StatusBoard Component
 *
 * Displays system status with services and incidents.
 */

import React from 'react'
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  type ViewStyle,
} from 'react-native'
import { useAppgramTheme } from '../../provider'
import { useStatus } from '../../hooks/useStatus'
import { Card, Badge } from '../base'

export interface StatusBoardProps {
  title?: string
  slug?: string
  refreshInterval?: number
  onIncidentPress?: (incidentId: string) => void
  style?: ViewStyle
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  operational: { bg: '#10B981', text: '#FFFFFF', label: 'Operational' },
  degraded_performance: { bg: '#F59E0B', text: '#FFFFFF', label: 'Degraded' },
  partial_outage: { bg: '#F97316', text: '#FFFFFF', label: 'Partial Outage' },
  major_outage: { bg: '#EF4444', text: '#FFFFFF', label: 'Major Outage' },
  maintenance: { bg: '#3B82F6', text: '#FFFFFF', label: 'Maintenance' },
}

const OVERALL_STATUS: Record<string, { color: string; label: string }> = {
  operational: { color: '#10B981', label: 'All Systems Operational' },
  degraded: { color: '#F59E0B', label: 'Degraded Performance' },
  partial_outage: { color: '#F97316', label: 'Partial System Outage' },
  major_outage: { color: '#EF4444', label: 'Major System Outage' },
  maintenance: { color: '#3B82F6', label: 'Under Maintenance' },
}

export function StatusBoard({
  title = 'System Status',
  slug = 'status',
  refreshInterval = 60000,
  onIncidentPress,
  style,
}: StatusBoardProps): React.ReactElement {
  const { colors, radius, typography, spacing } = useAppgramTheme()
  const { data, isLoading, error, refetch } = useStatus({ slug, refreshInterval })

  const [refreshing, setRefreshing] = React.useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  if (isLoading && !data) {
    return (
      <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, style]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (error) {
    return (
      <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }, style]}>
        <Text style={{ color: colors.error, textAlign: 'center' }}>{error}</Text>
      </View>
    )
  }

  const overallStatus = data?.overall_status || 'operational'
  const statusInfo = OVERALL_STATUS[overallStatus] || OVERALL_STATUS.operational

  return (
    <ScrollView
      style={style}
      contentContainerStyle={{ padding: spacing.lg }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Header */}
      <Text
        style={{
          fontSize: typography['2xl'],
          fontWeight: '700',
          color: colors.foreground,
          marginBottom: spacing.lg,
        }}
      >
        {title}
      </Text>

      {/* Overall Status Banner */}
      <Card
        style={{
          marginBottom: spacing.lg,
          backgroundColor: statusInfo.color + '15',
          borderColor: statusInfo.color + '30',
        }}
        variant="outlined"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: statusInfo.color,
              marginRight: spacing.md,
            }}
          />
          <Text
            style={{
              fontSize: typography.lg,
              fontWeight: '600',
              color: colors.foreground,
            }}
          >
            {statusInfo.label}
          </Text>
        </View>
      </Card>

      {/* Services */}
      {data?.components && data.components.length > 0 && (
        <View style={{ marginBottom: spacing.lg }}>
          <Text
            style={{
              fontSize: typography.lg,
              fontWeight: '600',
              color: colors.foreground,
              marginBottom: spacing.md,
            }}
          >
            Services
          </Text>
          {data.components.map((component) => {
            const compStatus = STATUS_COLORS[component.status] || STATUS_COLORS.operational
            return (
              <View
                key={component.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.base,
                    color: colors.foreground,
                    flex: 1,
                  }}
                >
                  {component.name}
                </Text>
                <View
                  style={{
                    backgroundColor: compStatus.bg,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: radius.full,
                  }}
                >
                  <Text
                    style={{
                      fontSize: typography.xs,
                      fontWeight: '500',
                      color: compStatus.text,
                    }}
                  >
                    {compStatus.label}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>
      )}

      {/* Active Incidents */}
      {data?.active_incidents && data.active_incidents.length > 0 && (
        <View>
          <Text
            style={{
              fontSize: typography.lg,
              fontWeight: '600',
              color: colors.foreground,
              marginBottom: spacing.md,
            }}
          >
            Active Incidents
          </Text>
          {data.active_incidents.map((incident) => (
            <Card
              key={incident.id}
              variant="outlined"
              style={{
                marginBottom: spacing.md,
                borderLeftWidth: 4,
                borderLeftColor: colors.warning,
              }}
            >
              <Text
                style={{
                  fontSize: typography.base,
                  fontWeight: '600',
                  color: colors.foreground,
                  marginBottom: spacing.xs,
                }}
              >
                {incident.name}
              </Text>
              <Badge variant="warning" size="sm">
                {incident.status?.replace('_', ' ') || 'investigating'}
              </Badge>
              {incident.incident_updates && incident.incident_updates.length > 0 && (
                <Text
                  style={{
                    fontSize: typography.sm,
                    color: colors.mutedForeground,
                    marginTop: spacing.sm,
                  }}
                  numberOfLines={2}
                >
                  {incident.incident_updates[0].message}
                </Text>
              )}
            </Card>
          ))}
        </View>
      )}

      {/* No incidents message */}
      {(!data?.active_incidents || data.active_incidents.length === 0) && (
        <Card variant="outlined" style={{ backgroundColor: colors.successSubtle }}>
          <Text style={{ color: colors.success, textAlign: 'center' }}>
            No active incidents
          </Text>
        </Card>
      )}
    </ScrollView>
  )
}

export default StatusBoard
