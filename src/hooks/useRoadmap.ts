/**
 * useRoadmap Hook
 *
 * Fetches and manages roadmap data for custom UI implementations.
 *
 * @example
 * ```tsx
 * import { useRoadmap } from '@appgram/react-native'
 *
 * function CustomRoadmap() {
 *   const { columns, isLoading, error, refetch } = useRoadmap({
 *     refreshInterval: 60000,
 *   })
 *
 *   if (isLoading) return <ActivityIndicator />
 *   if (error) return <Text>{error}</Text>
 *
 *   return (
 *     <ScrollView horizontal>
 *       {columns.map(col => (
 *         <View key={col.id} style={styles.column}>
 *           <Text style={styles.title}>{col.title}</Text>
 *           {col.items?.map(item => (
 *             <RoadmapItem key={item.id} item={item} />
 *           ))}
 *         </View>
 *       ))}
 *     </ScrollView>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Skip initial fetch for conditional loading
 * const { columns, refetch, isLoading } = useRoadmap({ skip: true })
 *
 * useEffect(() => {
 *   if (isVisible) {
 *     refetch()
 *   }
 * }, [isVisible])
 * ```
 */

import { useState, useEffect, useCallback } from 'react'
import { useAppgramContext } from '../provider'
import { getErrorMessage } from '../utils'
import type { RoadmapData, RoadmapColumn } from '../types'

export interface UseRoadmapOptions {
  /**
   * Auto-refresh interval in milliseconds (0 to disable)
   * @default 0
   */
  refreshInterval?: number

  /**
   * Skip initial fetch
   * @default false
   */
  skip?: boolean
}

export interface UseRoadmapResult {
  /**
   * Full roadmap data object
   */
  roadmap: RoadmapData | null

  /**
   * Roadmap columns with items
   */
  columns: RoadmapColumn[]

  /**
   * Total number of items across all columns
   */
  totalItems: number

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

export function useRoadmap(options: UseRoadmapOptions = {}): UseRoadmapResult {
  const { client } = useAppgramContext()
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null)
  const [columns, setColumns] = useState<RoadmapColumn[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(!options.skip)
  const [error, setError] = useState<string | null>(null)

  const fetchRoadmap = useCallback(async () => {
    if (options.skip) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getRoadmapData()
      if (response.success && response.data) {
        setRoadmap(response.data)
        // Columns can be at top level or nested inside roadmap object
        const cols = response.data.columns || response.data.roadmap?.columns || []
        setColumns(cols)
        // Use total_items from response if available, otherwise calculate
        const itemCount = response.data.total_items || cols.reduce((sum, col) => sum + (col.items?.length || 0), 0)
        setTotalItems(itemCount)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch roadmap'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, options.skip])

  useEffect(() => { fetchRoadmap() }, [fetchRoadmap])

  useEffect(() => {
    if (!options.refreshInterval || options.refreshInterval <= 0) return
    const interval = setInterval(fetchRoadmap, options.refreshInterval)
    return () => clearInterval(interval)
  }, [options.refreshInterval, fetchRoadmap])

  return { roadmap, columns, totalItems, isLoading, error, refetch: fetchRoadmap }
}
