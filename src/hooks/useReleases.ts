/**
 * useReleases / useRelease Hooks
 *
 * Fetch and manage changelog releases for custom UI implementations.
 *
 * @example
 * ```tsx
 * import { useReleases } from '@appgram/react-native'
 *
 * function ChangelogScreen() {
 *   const { releases, isLoading, error, refetch } = useReleases({ limit: 20 })
 *
 *   if (isLoading) return <ActivityIndicator />
 *   if (error) return <Text>{error}</Text>
 *
 *   return (
 *     <FlatList
 *       data={releases}
 *       renderItem={({ item }) => (
 *         <TouchableOpacity onPress={() => navigation.navigate('Release', { slug: item.slug })}>
 *           <Text style={styles.version}>{item.version}</Text>
 *           <Text style={styles.title}>{item.title}</Text>
 *           <Text style={styles.date}>{item.published_at}</Text>
 *         </TouchableOpacity>
 *       )}
 *       keyExtractor={(item) => item.id}
 *       onRefresh={refetch}
 *       refreshing={isLoading}
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Fetch a single release with its features
 * import { useRelease } from '@appgram/react-native'
 *
 * function ReleaseDetailScreen({ route }) {
 *   const { release, features, isLoading } = useRelease({
 *     releaseSlug: route.params.slug,
 *   })
 *
 *   if (isLoading || !release) return <ActivityIndicator />
 *
 *   return (
 *     <ScrollView>
 *       <Text style={styles.title}>{release.title}</Text>
 *       <Markdown>{release.description}</Markdown>
 *       {features.map(feature => (
 *         <FeatureItem key={feature.id} feature={feature} />
 *       ))}
 *     </ScrollView>
 *   )
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react'
import { useAppgramContext } from '../provider'
import { getErrorMessage } from '../utils'
import type { Release, ReleaseFeature } from '../types'

export interface UseReleasesOptions {
  /**
   * Maximum number of releases to fetch
   * @default 50
   */
  limit?: number

  /**
   * Skip initial fetch
   * @default false
   */
  skip?: boolean
}

export interface UseReleasesResult {
  /**
   * List of releases
   */
  releases: Release[]

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

export function useReleases(options: UseReleasesOptions = {}): UseReleasesResult {
  const { client } = useAppgramContext()
  const [releases, setReleases] = useState<Release[]>([])
  const [isLoading, setIsLoading] = useState(!options.skip)
  const [error, setError] = useState<string | null>(null)

  const fetchReleases = useCallback(async () => {
    if (options.skip) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getReleases({ limit: options.limit || 50 })
      if (response.success && response.data) {
        setReleases(response.data)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch releases'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, options.skip, options.limit])

  useEffect(() => { fetchReleases() }, [fetchReleases])

  return { releases, isLoading, error, refetch: fetchReleases }
}

export interface UseReleaseOptions {
  /**
   * The release slug to fetch
   */
  releaseSlug: string

  /**
   * Skip initial fetch
   * @default false
   */
  skip?: boolean
}

export interface UseReleaseResult {
  /**
   * The release data
   */
  release: Release | null

  /**
   * Features included in this release
   */
  features: ReleaseFeature[]

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

export function useRelease(options: UseReleaseOptions): UseReleaseResult {
  const { client } = useAppgramContext()
  const [release, setRelease] = useState<Release | null>(null)
  const [features, setFeatures] = useState<ReleaseFeature[]>([])
  const [isLoading, setIsLoading] = useState(!options.skip)
  const [error, setError] = useState<string | null>(null)

  const fetchRelease = useCallback(async () => {
    if (options.skip || !options.releaseSlug) return
    setIsLoading(true)
    setError(null)

    try {
      const [releaseRes, featuresRes] = await Promise.all([
        client.getRelease(options.releaseSlug),
        client.getReleaseFeatures(options.releaseSlug),
      ])

      if (releaseRes.success && releaseRes.data) {
        setRelease(releaseRes.data)
      } else {
        setError(getErrorMessage(releaseRes.error, 'Failed to fetch release'))
      }

      if (featuresRes.success && featuresRes.data) {
        setFeatures(featuresRes.data)
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, options.skip, options.releaseSlug])

  useEffect(() => { fetchRelease() }, [fetchRelease])

  return { release, features, isLoading, error, refetch: fetchRelease }
}
