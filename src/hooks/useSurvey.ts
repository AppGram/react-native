/**
 * Survey Hooks
 *
 * Fetch and submit surveys for custom UI implementations.
 *
 * @example
 * ```tsx
 * import { useSurvey, useSurveySubmit } from '@appgram/react-native'
 *
 * function SurveyScreen({ route }) {
 *   const { survey, nodes, isLoading, error } = useSurvey(route.params.slug)
 *   const { submitResponse, isSubmitting } = useSurveySubmit({
 *     onSuccess: (response) => {
 *       Alert.alert('Thank you!', 'Your response has been recorded.')
 *       navigation.goBack()
 *     },
 *   })
 *
 *   const [answers, setAnswers] = useState({})
 *
 *   const handleSubmit = async () => {
 *     if (!survey) return
 *     await submitResponse(survey.id, { answers })
 *   }
 *
 *   if (isLoading) return <ActivityIndicator />
 *   if (error) return <Text>{error}</Text>
 *   if (!survey) return null
 *
 *   return (
 *     <ScrollView>
 *       <Text style={styles.title}>{survey.title}</Text>
 *       {nodes.map(node => (
 *         <SurveyQuestion
 *           key={node.id}
 *           node={node}
 *           value={answers[node.id]}
 *           onChange={(value) => setAnswers(prev => ({ ...prev, [node.id]: value }))}
 *         />
 *       ))}
 *       <Button
 *         title={isSubmitting ? 'Submitting...' : 'Submit'}
 *         onPress={handleSubmit}
 *         disabled={isSubmitting}
 *       />
 *     </ScrollView>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Conditional loading
 * const { survey, nodes, refetch } = useSurvey('feedback', { enabled: false })
 *
 * useEffect(() => {
 *   if (shouldShowSurvey) {
 *     refetch()
 *   }
 * }, [shouldShowSurvey])
 * ```
 */

import { useState, useCallback, useEffect } from 'react'
import { useAppgramContext } from '../provider'
import { getErrorMessage } from '../utils'
import type { Survey, SurveyNode, SurveyResponse, SurveySubmitInput } from '../types'

export interface UseSurveyOptions {
  /**
   * Whether to fetch the survey on mount
   * @default true
   */
  enabled?: boolean
}

export interface UseSurveyResult {
  /**
   * The survey data
   */
  survey: Survey | null

  /**
   * Survey question nodes
   */
  nodes: SurveyNode[]

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
 * Fetch a survey by slug.
 *
 * @param slug - The survey slug to fetch
 * @param options - Hook options
 */
export function useSurvey(slug: string, options: UseSurveyOptions = {}): UseSurveyResult {
  const { enabled = true } = options
  const { client } = useAppgramContext()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [nodes, setNodes] = useState<SurveyNode[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSurvey = useCallback(async () => {
    if (!slug) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getPublicSurvey(slug)
      if (response.success && response.data) {
        const { nodes: surveyNodes, ...surveyData } = response.data
        setSurvey(surveyData as Survey)
        setNodes(surveyNodes || [])
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch survey'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, slug])

  useEffect(() => { if (enabled) fetchSurvey() }, [enabled, fetchSurvey])

  return { survey, nodes, isLoading, error, refetch: fetchSurvey }
}

export interface UseSurveySubmitOptions {
  /**
   * Callback when survey is submitted successfully
   */
  onSuccess?: (response: SurveyResponse) => void

  /**
   * Callback when submission fails
   */
  onError?: (error: string) => void
}

export interface UseSurveySubmitResult {
  /**
   * Loading state during submission
   */
  isSubmitting: boolean

  /**
   * Error message if submission failed
   */
  error: string | null

  /**
   * Submit a survey response
   * @returns The response data or null if failed
   */
  submitResponse: (surveyId: string, data: SurveySubmitInput) => Promise<SurveyResponse | null>
}

/**
 * Submit survey responses.
 *
 * @param options - Hook options
 */
export function useSurveySubmit(options: UseSurveySubmitOptions = {}): UseSurveySubmitResult {
  const { client } = useAppgramContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitResponse = useCallback(async (surveyId: string, data: SurveySubmitInput): Promise<SurveyResponse | null> => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await client.submitSurveyResponse(surveyId, data)
      if (response.success && response.data) {
        options.onSuccess?.(response.data)
        return response.data
      } else {
        const msg = getErrorMessage(response.error, 'Failed to submit')
        setError(msg)
        options.onError?.(msg)
        return null
      }
    } catch (err) {
      const msg = getErrorMessage(err, 'An error occurred')
      setError(msg)
      options.onError?.(msg)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [client, options])

  return { isSubmitting, error, submitResponse }
}
