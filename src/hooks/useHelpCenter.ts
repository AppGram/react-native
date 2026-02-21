/**
 * Help Center Hooks
 *
 * Fetch help center collections, flows, and articles for custom UI implementations.
 *
 * @example
 * ```tsx
 * import { useHelpCenter } from '@appgram/react-native'
 *
 * function HelpCenterScreen() {
 *   const { collection, flows, isLoading, error } = useHelpCenter()
 *
 *   if (isLoading) return <ActivityIndicator />
 *   if (error) return <Text>{error}</Text>
 *
 *   return (
 *     <ScrollView>
 *       <Text style={styles.title}>{collection?.title}</Text>
 *       {flows.map(flow => (
 *         <TouchableOpacity
 *           key={flow.id}
 *           onPress={() => navigation.navigate('HelpFlow', { slug: flow.slug })}
 *         >
 *           <Text>{flow.title}</Text>
 *           <Text>{flow.articles_count} articles</Text>
 *         </TouchableOpacity>
 *       ))}
 *     </ScrollView>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Fetch a specific flow with its articles
 * import { useHelpFlow } from '@appgram/react-native'
 *
 * function HelpFlowScreen({ route }) {
 *   const { flow, isLoading } = useHelpFlow(route.params.slug)
 *
 *   if (isLoading || !flow) return <ActivityIndicator />
 *
 *   return (
 *     <View>
 *       <Text style={styles.title}>{flow.title}</Text>
 *       {flow.articles?.map(article => (
 *         <ArticleItem key={article.id} article={article} />
 *       ))}
 *     </View>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Fetch a specific article
 * import { useHelpArticle } from '@appgram/react-native'
 *
 * function ArticleScreen({ route }) {
 *   const { article, isLoading } = useHelpArticle(
 *     route.params.slug,
 *     route.params.flowId
 *   )
 *
 *   if (isLoading || !article) return <ActivityIndicator />
 *
 *   return (
 *     <ScrollView>
 *       <Text style={styles.title}>{article.title}</Text>
 *       <Markdown>{article.body}</Markdown>
 *     </ScrollView>
 *   )
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react'
import { useAppgramContext } from '../provider'
import { getErrorMessage } from '../utils'
import type { HelpCollection, HelpFlow, HelpArticle } from '../types'

// ============================================================================
// useHelpCenter - Fetch help center data
// ============================================================================

export interface UseHelpCenterResult {
  /**
   * The help collection data
   */
  collection: HelpCollection | null

  /**
   * List of help flows in this collection
   */
  flows: HelpFlow[]

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

export function useHelpCenter(): UseHelpCenterResult {
  const { client } = useAppgramContext()
  const [collection, setCollection] = useState<HelpCollection | null>(null)
  const [flows, setFlows] = useState<HelpFlow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getHelpCollection()

      if (response.success && response.data) {
        setCollection(response.data.collection)
        setFlows(response.data.flows || [])
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch help center'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    collection,
    flows,
    isLoading,
    error,
    refetch: fetchData,
  }
}

// ============================================================================
// useHelpFlow - Fetch a specific help flow
// ============================================================================

export interface UseHelpFlowResult {
  /**
   * The help flow data with its articles
   */
  flow: HelpFlow | null

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

/**
 * Fetch a specific help flow by slug.
 *
 * @param slug - The help flow slug
 */
export function useHelpFlow(slug: string): UseHelpFlowResult {
  const { client } = useAppgramContext()
  const [flow, setFlow] = useState<HelpFlow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!slug) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getHelpFlow(slug)

      if (response.success && response.data) {
        setFlow(response.data)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch help flow'))
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

  return {
    flow,
    isLoading,
    error,
    refetch: fetchData,
  }
}

// ============================================================================
// useHelpArticle - Fetch a specific article
// ============================================================================

export interface UseHelpArticleResult {
  /**
   * The help article data
   */
  article: HelpArticle | null

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

/**
 * Fetch a specific help article by slug and flow ID.
 *
 * @param slug - The article slug
 * @param flowId - The parent flow ID
 */
export function useHelpArticle(slug: string, flowId: string): UseHelpArticleResult {
  const { client } = useAppgramContext()
  const [article, setArticle] = useState<HelpArticle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!slug || !flowId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getHelpArticle(slug, flowId)

      if (response.success && response.data) {
        setArticle(response.data)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch article'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, slug, flowId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    article,
    isLoading,
    error,
    refetch: fetchData,
  }
}
