/**
 * useSupport Hook
 *
 * Manages support ticket submission, status checking, magic link authentication,
 * and local ticket storage with AsyncStorage fallback.
 *
 * @example
 * ```tsx
 * import { useSupport } from '@appgram/react-native'
 *
 * function SupportScreen() {
 *   const { submitTicket, isSubmitting, error, successMessage } = useSupport({
 *     onSuccess: (ticket) => {
 *       Alert.alert('Success', 'Your ticket has been submitted!')
 *       navigation.goBack()
 *     },
 *     onError: (error) => {
 *       Alert.alert('Error', error)
 *     },
 *   })
 *
 *   const handleSubmit = async () => {
 *     await submitTicket({
 *       subject: 'Help needed',
 *       description: 'I have a question...',
 *       user_email: 'user@example.com',
 *       user_name: 'John Doe',
 *     })
 *   }
 *
 *   return (
 *     <View>
 *       {error && <Text style={styles.error}>{error}</Text>}
 *       {successMessage && <Text style={styles.success}>{successMessage}</Text>}
 *       <Button
 *         title={isSubmitting ? 'Submitting...' : 'Submit'}
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
 * // With magic link authentication for viewing tickets
 * function ViewTicketsScreen() {
 *   const {
 *     requestMagicLink,
 *     verifyToken,
 *     isSendingMagicLink,
 *     isVerifying,
 *     storedTickets,
 *   } = useSupport()
 *
 *   const handleRequestLink = async (email: string) => {
 *     const success = await requestMagicLink(email)
 *     if (success) {
 *       Alert.alert('Check your email for the magic link!')
 *     }
 *   }
 *
 *   const handleVerifyToken = async (token: string) => {
 *     const result = await verifyToken(token)
 *     if (result) {
 *       console.log('Tickets:', result.tickets)
 *       console.log('User:', result.userEmail)
 *     }
 *   }
 *
 *   return (
 *     <View>
 *       <Text>Your stored tickets: {storedTickets.length}</Text>
 *     </View>
 *   )
 * }
 * ```
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useAppgramContext } from '../provider'
import { getErrorMessage } from '../utils'
import type { SupportRequest, SupportRequestCategory } from '../types'

const STORAGE_KEY = '@appgram/support_tickets'

// In-memory fallback when AsyncStorage is not available
let inMemoryTickets: StoredTicket[] = []

// Try to get AsyncStorage, but don't fail if it's not available
let AsyncStorage: any = null
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default
} catch {
  // AsyncStorage not available, will use in-memory storage
}

export interface StoredTicket {
  /**
   * Ticket ID
   */
  id: string

  /**
   * Ticket subject
   */
  subject: string

  /**
   * Ticket status
   */
  status: string

  /**
   * User email
   */
  user_email: string

  /**
   * Creation timestamp
   */
  created_at: string

  /**
   * Access token for viewing the ticket
   */
  access_token: string

  /**
   * Magic link for authentication (optional)
   */
  magic_link?: string
}

export interface SupportSubmitData {
  /**
   * Ticket subject
   */
  subject: string

  /**
   * Ticket description/body
   */
  description: string

  /**
   * User's email address
   */
  user_email: string

  /**
   * User's name (optional)
   */
  user_name?: string

  /**
   * External user ID for tracking (optional)
   */
  external_user_id?: string

  /**
   * Ticket category (optional)
   */
  category?: SupportRequestCategory
}

export interface UseSupportOptions {
  /**
   * Callback when ticket is submitted successfully
   */
  onSuccess?: (ticket: SupportRequest) => void

  /**
   * Callback when an error occurs
   */
  onError?: (error: string) => void
}

export interface UseSupportResult {
  /**
   * Submit a support ticket
   * @returns The created ticket or null if failed
   */
  submitTicket: (data: SupportSubmitData) => Promise<SupportRequest | null>

  /**
   * Loading state during submission
   */
  isSubmitting: boolean

  /**
   * Error message if any operation failed
   */
  error: string | null

  /**
   * Success message after successful operations
   */
  successMessage: string | null

  /**
   * Clear error and success messages
   */
  clearMessages: () => void

  /**
   * Request a magic link to be sent to the user's email
   * @returns true if successful
   */
  requestMagicLink: (email: string) => Promise<boolean>

  /**
   * Loading state while sending magic link
   */
  isSendingMagicLink: boolean

  /**
   * Verify a magic link token to get user's tickets
   * @returns Tickets and user email, or null if verification failed
   */
  verifyToken: (token: string) => Promise<{ tickets: SupportRequest[]; userEmail: string } | null>

  /**
   * Loading state while verifying token
   */
  isVerifying: boolean

  /**
   * Locally stored tickets from previous submissions
   */
  storedTickets: StoredTicket[]

  /**
   * Reload stored tickets from local storage
   */
  loadStoredTickets: () => Promise<void>

  /**
   * Clear all locally stored tickets
   */
  clearStoredTickets: () => Promise<void>
}

export function useSupport(options: UseSupportOptions = {}): UseSupportResult {
  const { client } = useAppgramContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [storedTickets, setStoredTickets] = useState<StoredTicket[]>([])
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccessMessage(null)
  }, [])

  // Load stored tickets
  const loadStoredTickets = useCallback(async () => {
    try {
      if (AsyncStorage) {
        const stored = await AsyncStorage.getItem(STORAGE_KEY)
        if (stored && mounted.current) {
          setStoredTickets(JSON.parse(stored))
        }
      } else {
        // Use in-memory storage
        if (mounted.current) {
          setStoredTickets(inMemoryTickets)
        }
      }
    } catch (err) {
      console.warn('Failed to load stored tickets:', err)
    }
  }, [])

  // Save ticket to storage
  const saveTicket = useCallback(async (ticket: SupportRequest & { access_token?: string; magic_link?: string }) => {
    try {
      const storedTicket: StoredTicket = {
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        user_email: ticket.user_email,
        created_at: ticket.created_at,
        access_token: ticket.access_token || '',
        magic_link: ticket.magic_link,
      }

      let tickets: StoredTicket[] = []

      if (AsyncStorage) {
        const stored = await AsyncStorage.getItem(STORAGE_KEY)
        tickets = stored ? JSON.parse(stored) : []
      } else {
        tickets = [...inMemoryTickets]
      }

      // Add new ticket at the beginning
      tickets.unshift(storedTicket)

      // Keep only last 50 tickets
      const trimmed = tickets.slice(0, 50)

      if (AsyncStorage) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
      } else {
        inMemoryTickets = trimmed
      }

      if (mounted.current) {
        setStoredTickets(trimmed)
      }
    } catch (err) {
      console.warn('Failed to save ticket:', err)
    }
  }, [])

  // Clear all stored tickets
  const clearStoredTickets = useCallback(async () => {
    try {
      if (AsyncStorage) {
        await AsyncStorage.removeItem(STORAGE_KEY)
      } else {
        inMemoryTickets = []
      }
      if (mounted.current) {
        setStoredTickets([])
      }
    } catch (err) {
      console.warn('Failed to clear stored tickets:', err)
    }
  }, [])

  // Load tickets on mount
  useEffect(() => {
    loadStoredTickets()
  }, [loadStoredTickets])

  const submitTicket = useCallback(async (data: SupportSubmitData): Promise<SupportRequest | null> => {
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await client.submitSupportRequest({
        subject: data.subject,
        description: data.description,
        user_email: data.user_email,
        user_name: data.user_name,
        external_user_id: data.external_user_id,
        category: data.category,
      })

      if (response.success && response.data) {
        // Store the ticket locally with access_token and magic_link
        await saveTicket(response.data as SupportRequest & { access_token?: string; magic_link?: string })

        setSuccessMessage('Support ticket submitted successfully')
        options.onSuccess?.(response.data)
        return response.data
      } else {
        const errorMsg = getErrorMessage(response.error, 'Failed to submit ticket')
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
  }, [client, options, saveTicket])

  const requestMagicLink = useCallback(async (email: string): Promise<boolean> => {
    setIsSendingMagicLink(true)
    setError(null)

    try {
      const response = await client.sendSupportMagicLink(email)

      if (response.success) {
        return true
      } else {
        const errorMsg = getErrorMessage(response.error, 'Failed to send magic link')
        setError(errorMsg)
        options.onError?.(errorMsg)
        return false
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err, 'An error occurred')
      setError(errorMsg)
      options.onError?.(errorMsg)
      return false
    } finally {
      setIsSendingMagicLink(false)
    }
  }, [client, options])

  const verifyToken = useCallback(async (token: string): Promise<{ tickets: SupportRequest[]; userEmail: string } | null> => {
    setIsVerifying(true)
    setError(null)

    try {
      const response = await client.verifySupportToken(token)

      if (response.success && response.data) {
        return {
          tickets: response.data.tickets,
          userEmail: response.data.user_email,
        }
      } else {
        const errorMsg = getErrorMessage(response.error, 'Failed to verify token')
        setError(errorMsg)
        return null
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err, 'An error occurred')
      setError(errorMsg)
      return null
    } finally {
      setIsVerifying(false)
    }
  }, [client])

  return {
    submitTicket,
    isSubmitting,
    error,
    successMessage,
    clearMessages,
    requestMagicLink,
    isSendingMagicLink,
    verifyToken,
    isVerifying,
    storedTickets,
    loadStoredTickets,
    clearStoredTickets,
  }
}
