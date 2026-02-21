import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  Clock,
  Activity,
} from 'lucide-react-native'
import Markdown from 'react-native-markdown-display'
import { useAppgramTheme } from '../../provider'
import { useStatus } from '../../hooks/useStatus'
import type { StatusUpdate, StatusPageService } from '../../types'

export interface StatusBoardProps {
  title?: string
  subtitle?: string
  slug?: string
  refreshInterval?: number
  onIncidentPress?: (incidentId: string) => void
  onSubscribe?: () => void
  style?: ViewStyle
}

// Status configuration
const STATUS_CONFIG: Record<string, {
  dot: string
  bg: string
  iconColor: string
  label: string
  description: string
  icon: 'check' | 'warning' | 'error'
}> = {
  operational: {
    dot: '#10B981',
    bg: '#10B98115',
    iconColor: '#10B981',
    label: 'All Systems Operational',
    description: 'All services are running smoothly',
    icon: 'check',
  },
  degraded_performance: {
    dot: '#F59E0B',
    bg: '#F59E0B15',
    iconColor: '#F59E0B',
    label: 'Degraded Performance',
    description: 'Performance issues detected',
    icon: 'warning',
  },
  degraded: {
    dot: '#F59E0B',
    bg: '#F59E0B15',
    iconColor: '#F59E0B',
    label: 'Degraded Performance',
    description: 'Performance issues detected',
    icon: 'warning',
  },
  partial_outage: {
    dot: '#F97316',
    bg: '#F9731615',
    iconColor: '#F97316',
    label: 'Partial Outage',
    description: 'Some services unavailable',
    icon: 'warning',
  },
  major_outage: {
    dot: '#EF4444',
    bg: '#EF444415',
    iconColor: '#EF4444',
    label: 'Major Outage',
    description: 'Critical systems down',
    icon: 'error',
  },
  maintenance: {
    dot: '#3B82F6',
    bg: '#3B82F615',
    iconColor: '#3B82F6',
    label: 'Maintenance',
    description: 'Scheduled maintenance in progress',
    icon: 'warning',
  },
}

const COMPONENT_STATUS_LABELS: Record<string, string> = {
  operational: 'Operational',
  degraded_performance: 'Degraded Performance',
  degraded: 'Degraded',
  partial_outage: 'Partial Outage',
  major_outage: 'Major Outage',
  maintenance: 'Maintenance',
}

// Status Icon Component
function StatusIcon({ type, color, size = 20 }: { type: 'check' | 'warning' | 'error'; color: string; size?: number }) {
  switch (type) {
    case 'check':
      return <CheckCircle2 size={size} color={color} />
    case 'warning':
      return <AlertTriangle size={size} color={color} />
    case 'error':
      return <XCircle size={size} color={color} />
  }
}

// Incident Card Component
function IncidentCard({
  incident,
  colors,
  typography,
  spacing,
  radius,
  defaultExpanded = true,
}: {
  incident: StatusUpdate
  colors: any
  typography: any
  spacing: any
  radius: any
  defaultExpanded?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const statusLabel = incident.status_type?.replace('_', ' ') || 'Investigating'
  const isResolved = incident.state === 'resolved'

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        marginBottom: spacing.sm,
      }}
    >
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
        style={{
          padding: spacing.lg,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            {/* Badges row */}
            <View style={{ flexDirection: 'row', marginBottom: spacing.sm, gap: spacing.xs }}>
              <View
                style={{
                  backgroundColor: isResolved ? '#10B981' : '#F59E0B',
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 4,
                  borderRadius: radius.md,
                }}
              >
                <Text style={{ fontSize: typography.xs, fontWeight: '600', color: '#FFFFFF', textTransform: 'capitalize' }}>
                  {statusLabel}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: 'transparent',
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 4,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: typography.xs, fontWeight: '500', color: colors.foreground }}>
                  {isResolved ? 'Resolved' : 'Active'}
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: typography.sm,
                fontWeight: '600',
                color: colors.foreground,
                marginBottom: spacing.xs,
              }}
            >
              {incident.title}
            </Text>

            {/* Date */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Clock size={12} color={colors.mutedForeground} />
              <Text style={{ fontSize: typography.xs, color: colors.mutedForeground, marginLeft: 4 }}>
                {new Date(incident.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>

          {/* Expand indicator */}
          <ChevronDown
            size={20}
            color={colors.mutedForeground}
            style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
          />
        </View>
      </TouchableOpacity>

      {/* Expanded content */}
      {isExpanded && incident.description && (
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.lg,
            paddingTop: spacing.sm,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Markdown
            style={{
              body: {
                fontSize: typography.sm,
                color: colors.foreground,
                lineHeight: 20,
              },
              paragraph: {
                marginBottom: spacing.sm,
              },
              heading1: {
                fontSize: typography.lg,
                fontWeight: '700',
                color: colors.foreground,
                marginBottom: spacing.sm,
              },
              heading2: {
                fontSize: typography.base,
                fontWeight: '600',
                color: colors.foreground,
                marginBottom: spacing.xs,
              },
              link: {
                color: colors.primary,
              },
              code_inline: {
                backgroundColor: colors.muted,
                paddingHorizontal: 4,
                borderRadius: 4,
              },
              code_block: {
                backgroundColor: colors.muted,
                padding: spacing.sm,
                borderRadius: 8,
              },
              bullet_list: {
                marginBottom: spacing.sm,
              },
              ordered_list: {
                marginBottom: spacing.sm,
              },
              table: {
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                marginVertical: spacing.sm,
              },
              thead: {
                backgroundColor: colors.muted,
              },
              th: {
                padding: spacing.sm,
                borderBottomWidth: 1,
                borderRightWidth: 1,
                borderColor: colors.border,
                fontWeight: '600',
              },
              tr: {
                borderBottomWidth: 1,
                borderColor: colors.border,
              },
              td: {
                padding: spacing.sm,
                borderRightWidth: 1,
                borderColor: colors.border,
              },
            }}
          >
            {incident.description}
          </Markdown>
          {incident.resolved_at && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}>
              <Clock size={12} color={colors.mutedForeground} />
              <Text
                style={{
                  fontSize: typography.xs,
                  color: colors.mutedForeground,
                  marginLeft: 4,
                }}
              >
                Resolved: {new Date(incident.resolved_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

// Component Card
function ComponentCard({
  service,
  status,
  colors,
  typography,
  spacing,
  radius,
}: {
  service: StatusPageService
  status: string
  colors: any
  typography: any
  spacing: any
  radius: any
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.operational
  const label = COMPONENT_STATUS_LABELS[status] || 'Operational'

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: config.dot,
          marginRight: spacing.md,
        }}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: typography.sm,
            fontWeight: '500',
            color: colors.foreground,
          }}
          numberOfLines={1}
        >
          {service.name}
        </Text>
        {service.description && (
          <Text
            style={{
              fontSize: typography.xs,
              color: colors.mutedForeground,
            }}
            numberOfLines={1}
          >
            {service.description}
          </Text>
        )}
      </View>
      <View
        style={{
          backgroundColor: colors.muted,
          paddingHorizontal: spacing.sm,
          paddingVertical: 4,
          borderRadius: radius.md,
        }}
      >
        <Text
          style={{
            fontSize: typography.xs,
            fontWeight: '500',
            color: colors.foreground,
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  )
}

// Section Header
function SectionHeader({
  icon,
  iconBg,
  title,
  subtitle,
  colors,
  typography,
  spacing,
  radius,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  subtitle?: string
  colors: any
  typography: any
  spacing: any
  radius: any
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radius.md,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: spacing.sm,
        }}
      >
        {icon}
      </View>
      <View>
        <Text
          style={{
            fontSize: typography.sm,
            fontWeight: '600',
            color: colors.foreground,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: typography.xs,
              color: colors.mutedForeground,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  )
}

/**
 * StatusBoard Component
 *
 * Displays system status with services and incidents.
 *
 * @example
 * ```tsx
 * import { StatusBoard } from '@appgram/react-native'
 *
 * function StatusScreen() {
 *   return (
 *     <StatusBoard
 *       title="System Status"
 *       subtitle="Real-time service health"
 *       refreshInterval={60000}
 *       onSubscribe={() => setShowSubscribe(true)}
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Minimal status badge
 * <StatusBoard slug="status" refreshInterval={30000} />
 * ```
 */
export function StatusBoard({
  title = 'Service Status',
  subtitle = 'Real-time status updates for our services',
  slug = 'status',
  refreshInterval = 60000,
  onSubscribe,
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

  const overallStatus = data?.current_status || 'operational'
  const statusConfig = STATUS_CONFIG[overallStatus] || STATUS_CONFIG.operational

  const services = data?.services || []
  const operationalCount = services.filter(s => {
    const status = data?.services_status?.[s.name] || 'operational'
    return status === 'operational'
  }).length
  const totalCount = services.length

  const activeIncidents = data?.active_updates?.filter(u => u.state === 'active') || []
  const recentIncidents = data?.recent_updates?.filter(u => u.state === 'resolved')?.slice(0, 5) || []

  return (
    <ScrollView
      style={style}
      contentContainerStyle={{ paddingVertical: spacing.lg }}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
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
          textAlign: 'center',
          marginBottom: spacing.xs,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: typography.base,
          color: colors.mutedForeground,
          textAlign: 'center',
          marginBottom: spacing.xl,
        }}
      >
        {subtitle}
      </Text>

      {/* Overall Status Banner */}
      <View
        style={{
          backgroundColor: statusConfig.bg,
          borderRadius: radius.lg,
          padding: spacing.lg,
          marginBottom: spacing.xl,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: statusConfig.iconColor + '30',
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.md,
            backgroundColor: statusConfig.iconColor + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.md,
          }}
        >
          <StatusIcon type={statusConfig.icon} color={statusConfig.iconColor} size={20} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: typography.sm,
              fontWeight: '600',
              color: colors.foreground,
            }}
          >
            {statusConfig.label}
          </Text>
          <Text
            style={{
              fontSize: typography.xs,
              color: colors.mutedForeground,
            }}
          >
            {statusConfig.description}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={{
              fontSize: typography.sm,
              fontWeight: '600',
              color: colors.foreground,
            }}
          >
            {operationalCount}/{totalCount}
          </Text>
          <Text
            style={{
              fontSize: typography.xs,
              color: colors.mutedForeground,
            }}
          >
            operational
          </Text>
        </View>
      </View>

      {/* System Components */}
      {services.length > 0 && (
        <View style={{ marginBottom: spacing.xl }}>
          <SectionHeader
            icon={<Activity size={16} color={colors.mutedForeground} />}
            iconBg={colors.muted}
            title="System Components"
            subtitle={`${operationalCount} of ${totalCount} operational`}
            colors={colors}
            typography={typography}
            spacing={spacing}
            radius={radius}
          />
          {services.map((service) => {
            const serviceStatus = data?.services_status?.[service.name] || 'operational'
            return (
              <ComponentCard
                key={service.id}
                service={service}
                status={serviceStatus}
                colors={colors}
                typography={typography}
                spacing={spacing}
                radius={radius}
              />
            )
          })}
        </View>
      )}

      {/* Active Incidents */}
      {activeIncidents.length > 0 && (
        <View style={{ marginBottom: spacing.xl }}>
          <SectionHeader
            icon={<AlertTriangle size={16} color="#F59E0B" />}
            iconBg="#F59E0B20"
            title="Active Incidents"
            subtitle={`${activeIncidents.length} ongoing issue${activeIncidents.length > 1 ? 's' : ''}`}
            colors={colors}
            typography={typography}
            spacing={spacing}
            radius={radius}
          />
          {activeIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              colors={colors}
              typography={typography}
              spacing={spacing}
              radius={radius}
              defaultExpanded={true}
            />
          ))}
        </View>
      )}

      {/* Past Incidents */}
      <View style={{ marginBottom: spacing.lg }}>
        <SectionHeader
          icon={<Clock size={16} color={colors.mutedForeground} />}
          iconBg={colors.muted}
          title="Past Incidents"
          colors={colors}
          typography={typography}
          spacing={spacing}
          radius={radius}
        />
        {recentIncidents.length > 0 ? (
          recentIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              colors={colors}
              typography={typography}
              spacing={spacing}
              radius={radius}
              defaultExpanded={false}
            />
          ))
        ) : (
          <Text
            style={{
              fontSize: typography.sm,
              color: colors.mutedForeground,
              paddingVertical: spacing.lg,
            }}
          >
            No recent incidents.
          </Text>
        )}
      </View>

      {/* Subscribe button */}
      {onSubscribe && (
        <TouchableOpacity
          onPress={onSubscribe}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: typography.sm, fontWeight: '600', color: '#FFFFFF' }}>
            Subscribe to updates
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  )
}

export default StatusBoard
