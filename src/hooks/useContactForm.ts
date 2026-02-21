/**
 * Contact Form Hooks
 *
 * Fetch and submit dynamic contact forms.
 *
 * @example
 * ```tsx
 * import { useContactForm, useContactFormSubmit } from '@appgram/react-native'
 *
 * function ContactScreen({ formId }) {
 *   const { form, isLoading, error } = useContactForm(formId)
 *   const { submitForm, isSubmitting, successMessage } = useContactFormSubmit({
 *     onSuccess: () => {
 *       Alert.alert('Thank you!', 'Your message has been sent.')
 *     },
 *   })
 *
 *   const [formData, setFormData] = useState({})
 *
 *   const handleSubmit = async () => {
 *     if (!form) return
 *     await submitForm(form.project_id, form.id, formData)
 *   }
 *
 *   if (isLoading) return <ActivityIndicator />
 *   if (error) return <Text>{error}</Text>
 *   if (!form) return null
 *
 *   return (
 *     <View>
 *       <Text style={styles.title}>{form.title}</Text>
 *       {form.fields?.map(field => (
 *         <FormField
 *           key={field.id}
 *           field={field}
 *           value={formData[field.id]}
 *           onChange={(value) => setFormData(prev => ({ ...prev, [field.id]: value }))}
 *         />
 *       ))}
 *       {successMessage && <Text style={styles.success}>{successMessage}</Text>}
 *       <Button
 *         title={isSubmitting ? 'Sending...' : 'Submit'}
 *         onPress={handleSubmit}
 *         disabled={isSubmitting}
 *       />
 *     </View>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Conditional loading
 * const { form, refetch } = useContactForm('support-form', { enabled: false })
 *
 * useEffect(() => {
 *   if (shouldShowForm) {
 *     refetch()
 *   }
 * }, [shouldShowForm])
 * ```
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useAppgramContext } from '../provider'
import { getErrorMessage } from '../utils'
import type { ContactForm, ContactFormSubmission } from '../types'

export interface UseContactFormOptions {
  /**
   * Whether to fetch the form on mount
   * @default true
   */
  enabled?: boolean
}

export interface UseContactFormResult {
  /**
   * The contact form configuration
   */
  form: ContactForm | null

  /**
   * Loading state
   */
  isLoading: boolean

  /**
   * Error message if any
   */
  error: string | null

  /**
   * Manually refetch the form
   */
  refetch: () => Promise<void>
}

/**
 * Fetch a contact form configuration by ID.
 *
 * @param formId - The contact form ID
 * @param options - Hook options
 */
export function useContactForm(formId: string, options: UseContactFormOptions = {}): UseContactFormResult {
  const { enabled = true } = options
  const { client } = useAppgramContext()
  const [form, setForm] = useState<ContactForm | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchForm = useCallback(async () => {
    if (!formId) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getContactForm(formId)

      if (response.success && response.data) {
        setForm(response.data)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch form'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, formId])

  useEffect(() => {
    if (enabled) {
      fetchForm()
    }
  }, [enabled, fetchForm])

  return {
    form,
    isLoading,
    error,
    refetch: fetchForm,
  }
}

export interface UseContactFormSubmitOptions {
  /**
   * Minimum time between submissions in milliseconds
   * @default 5000
   */
  rateLimitMs?: number

  /**
   * Callback when form is submitted successfully
   */
  onSuccess?: (submission: ContactFormSubmission) => void

  /**
   * Callback when submission fails
   */
  onError?: (error: string) => void
}

export interface UseContactFormSubmitResult {
  /**
   * Loading state during submission
   */
  isSubmitting: boolean

  /**
   * Error message if submission failed
   */
  error: string | null

  /**
   * Success message after submission
   */
  successMessage: string | null

  /**
   * Whether the user is rate-limited from submitting
   */
  isRateLimited: boolean

  /**
   * Submit the contact form
   * @returns The submission data or null if failed
   */
  submitForm: (
    projectId: string,
    formId: string,
    data: Record<string, string | boolean>
  ) => Promise<ContactFormSubmission | null>

  /**
   * Clear error and success messages
   */
  clearMessages: () => void
}

/**
 * Submit contact forms with rate limiting.
 *
 * @param options - Hook options
 */
export function useContactFormSubmit(options: UseContactFormSubmitOptions = {}): UseContactFormSubmitResult {
  const { rateLimitMs = 5000 } = options
  const { client } = useAppgramContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const lastSubmitRef = useRef<number>(0)

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccessMessage(null)
  }, [])

  const submitForm = useCallback(async (
    projectId: string,
    formId: string,
    data: Record<string, string | boolean>
  ): Promise<ContactFormSubmission | null> => {
    const now = Date.now()
    if (now - lastSubmitRef.current < rateLimitMs) {
      setIsRateLimited(true)
      setError('Please wait before submitting again.')
      setTimeout(() => setIsRateLimited(false), rateLimitMs - (now - lastSubmitRef.current))
      return null
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await client.submitContactForm(projectId, formId, { data })

      if (response.success && response.data) {
        lastSubmitRef.current = Date.now()
        setSuccessMessage('Form submitted successfully.')
        options.onSuccess?.(response.data)
        return response.data
      } else {
        const errorMsg = getErrorMessage(response.error, 'Failed to submit form')
        setError(errorMsg)
        options.onError?.(errorMsg)
        return null
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err, 'An error occurred')
      setError(errorMsg)
      options.onError?.(errorMsg)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [client, options, rateLimitMs])

  return {
    isSubmitting,
    error,
    successMessage,
    isRateLimited,
    submitForm,
    clearMessages,
  }
}
