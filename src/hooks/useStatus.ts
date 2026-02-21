/**
 * useStatus Hook
 *
 * Fetches status page data with auto-refresh support.
 *
 * @example
 * ```tsx
 * import { useStatus } from '@appgram/react-native'
 *
 * function StatusPageScreen() {
 *   const { data, isLoading, error, refetch } = useStatus({
 *     slug: 'status',
 *     refreshInterval: 60000, // Refresh every minute
 *   })
 *
 *   if (isLoading) return <ActivityIndicator />
 *   if (error) return <Text>{error}</Text>
 *   if (!data) return null
 *
 *   return (
 *     <ScrollView>
 *       <StatusHeader overall={data.overall_status} />
 *       {data.services?.map(service => (
 *         <ServiceStatusCard
 *           key={service.id}
 *           name={service.name}
 *           status={service.status}
 *           description={service.description}
 *         />
 *       ))}
 *       {data.active_incidents?.map(incident => (
 *         <IncidentCard key={incident.id} incident={incident} />
 *       ))}
 *     </ScrollView>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Minimal status badge
 * function StatusBadge() {
 *   const { data, isLoading } = useStatus({ refreshInterval: 30000 })
 *
 *   if (isLoading || !data) return null
 *
 *   const isOperational = data.overall_status === 'operational'
 *
 *   return (
 *     <View style={[styles.badge, isOperational ? styles.green : styles.red]}>
 *       <Text>{isOperational ? 'All Systems Operational' : 'Issues Detected'}</Text>
 *     </View>
 *   )
 * }
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppgramContext } from '../provider'
import { getErrorMessage } from '../utils'
import type { StatusPageOverview } from '../types'

export interface UseStatusOptions {
  /**
   * Status page slug
   * @default 'status'
   */
  slug?: string

  /**
   * Auto-refresh interval in milliseconds (0 to disable)
   * @default 0
   */
  refreshInterval?: number
}

export interface UseStatusResult {
  /**
   * Status page data including services and incidents
   */
  data: StatusPageOverview | null

  /**
   * Loading state
   */
  isLoading: boolean

  /**
   * Error message if any
   */
  error: string | null

  /**
   * Manually refetch data
   */
  refetch: () => Promise<void>
}

export function useStatus(options: UseStatusOptions = {}): UseStatusResult {
  const { slug = 'status', refreshInterval = 0 } = options
  const { client } = useAppgramContext()
  const [data, setData] = useState<StatusPageOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getPublicStatusOverview(slug)

      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch status'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, slug])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, refreshInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [refreshInterval, fetchData])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  }
}
