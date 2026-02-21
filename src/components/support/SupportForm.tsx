import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Switch,
} from 'react-native'
import { Send, Search, MessageSquare, HelpCircle, CheckCircle2, Mail, Ticket, ExternalLink } from 'lucide-react-native'
import { useAppgramTheme, useAppgramContext } from '../../provider'
import { useSupport, useContactForm } from '../../hooks'
import type { SupportRequestCategory, SupportRequest, ContactForm, ContactFormField } from '../../types'

export interface SupportFormProps {
  /** Page heading */
  heading?: string
  /** Page description */
  description?: string
  /** Submit section title */
  submitTitle?: string
  /** Submit section description */
  submitDescription?: string
  /** Check status section title */
  checkTitle?: string
  /** Check status section description */
  checkDescription?: string
  /** Pre-filled user email */
  userEmail?: string
  /** Pre-filled user name */
  userName?: string
  /** External user ID for tracking */
  externalUserId?: string
  /** Show category selector */
  showCategory?: boolean
  /** Show name field */
  showName?: boolean
  /** Show check status tab */
  showCheckStatus?: boolean
  /** Submit button text */
  submitButtonText?: string
  /**
   * Custom contact form ID to use instead of default support form.
   * When provided, fetches the form config and renders its fields dynamically.
   * The form should have integration.type = 'support' to create tickets.
   */
  customFormId?: string
  /** Callback when ticket is successfully submitted */
  onSuccess?: (ticket?: SupportRequest) => void
  /** Callback when submission fails */
  onError?: (error: string) => void
  /** Callback when checking status */
  onCheckStatus?: (email: string) => void
  /** Callback when a ticket is clicked */
  onTicketClick?: (ticket: SupportRequest) => void
}

const categoryOptions: { value: SupportRequestCategory; label: string }[] = [
  { value: 'general_inquiry', label: 'General Inquiry' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'billing', label: 'Billing' },
  { value: 'account', label: 'Account' },
]

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: 'Open', color: '#3b82f6' },
  in_progress: { label: 'In Progress', color: '#f59e0b' },
  waiting_on_customer: { label: 'Awaiting Reply', color: '#8b5cf6' },
  resolved: { label: 'Resolved', color: '#10b981' },
  closed: { label: 'Closed', color: '#6b7280' },
}

/**
 * SupportForm Component
 *
 * Modern support form with tabs for submitting and tracking support tickets.
 * Supports custom contact forms with dynamic field rendering.
 *
 * @example
 * ```tsx
 * import { SupportForm } from '@appgram/react-native'
 *
 * function SupportScreen() {
 *   return (
 *     <SupportForm
 *       heading="Contact Support"
 *       description="We're here to help"
 *       userEmail="user@example.com"
 *       userName="John Doe"
 *       showCategory
 *       showName
 *       onSubmitSuccess={(ticket) => {
 *         Alert.alert('Success', `Ticket #${ticket.id} created!`)
 *         navigation.goBack()
 *       }}
 *       onSubmitError={(error) => Alert.alert('Error', error)}
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With check status tab
 * <SupportForm
 *   heading="Help Center"
 *   showCheckStatus
 *   checkTitle="Check Your Tickets"
 *   checkDescription="Enter your email to view existing tickets"
 * />
 * ```
 */
export function SupportForm({
  heading,
  description,
  submitTitle = 'Submit a Request',
  submitDescription = "Describe your issue and we'll get back to you as soon as possible.",
  checkTitle = 'Check Status',
  checkDescription = 'Track the progress of your existing support requests.',
  userEmail: initialEmail = '',
  userName: initialName = '',
  externalUserId,
  showCategory = true,
  showName = true,
  showCheckStatus = true,
  submitButtonText = 'Send Request',
  customFormId,
  onSuccess,
  onError,
  onCheckStatus,
  onTicketClick,
}: SupportFormProps): React.ReactElement {
  const { colors, radius, typography, spacing } = useAppgramTheme()
  const { client } = useAppgramContext()
  const {
    submitTicket,
    isSubmitting,
    error,
    successMessage,
    clearMessages,
    requestMagicLink,
    isSendingMagicLink,
    storedTickets,
  } = useSupport({ onSuccess, onError })

  // Auto-detect custom form from project customization
  const [customForm, setCustomForm] = useState<ContactForm | null>(null)
  const [isLoadingCustomization, setIsLoadingCustomization] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)

  // Fetch project customization to get support form config
  useEffect(() => {
    const fetchCustomization = async () => {
      try {
        const response = await client.getPageData()

        if (response.success && response.data?.customization_data) {
          const customizationData = response.data.customization_data as {
            content?: { support?: { customFormId?: string } }
            contactForms?: Record<string, ContactForm & { integration?: { type: string } }>
          }

          const contactForms = customizationData.contactForms || {}

          // Check for explicit customFormId in content.support
          const explicitFormId = customizationData.content?.support?.customFormId
          if (explicitFormId && contactForms[explicitFormId]) {
            const form = contactForms[explicitFormId]
            if (form.enabled && form.integration?.type === 'support') {
              setCustomForm(form as ContactForm)
              setIsLoadingCustomization(false)
              return
            }
          }

          // Auto-detect: find any enabled form with integration.type = 'support'
          if (Object.keys(contactForms).length > 0) {
            // Filter for actual form objects (have fields array and name property)
            const formEntries = Object.entries(contactForms).filter(([_, form]) => {
              if (!form || typeof form !== 'object') return false
              if (!('fields' in form) || !Array.isArray(form.fields)) return false
              if (!('name' in form)) return false
              return true
            })

            const supportFormEntry = formEntries.find(([_, form]) => {
              return form.enabled && form.integration?.type === 'support'
            })

            if (supportFormEntry) {
              const [, form] = supportFormEntry
              setCustomForm(form as ContactForm)
            }
          }
        }
      } catch (err) {
        setFormError('Failed to load form configuration')
      } finally {
        setIsLoadingCustomization(false)
      }
    }

    // Only auto-fetch if no explicit customFormId provided
    if (!customFormId) {
      fetchCustomization()
    } else {
      setIsLoadingCustomization(false)
    }
  }, [client, customFormId])

  // If explicit customFormId prop is provided, fetch that form via API
  const {
    form: fetchedForm,
    isLoading: isLoadingForm,
    error: fetchError,
  } = useContactForm(customFormId || '', { enabled: !!customFormId })

  // Use fetched form if customFormId prop was provided, otherwise use auto-detected form
  const effectiveForm = customFormId ? fetchedForm : customForm
  const effectiveFormError = customFormId ? fetchError : formError
  const isLoadingEffectiveForm = customFormId ? isLoadingForm : false

  // State for custom form fields
  const [customFormData, setCustomFormData] = useState<Record<string, string | boolean>>({})
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({})

  // Validate a custom form field
  const validateCustomField = (
    value: string | boolean | undefined,
    field: ContactFormField
  ): string | null => {
    if (field.type === 'checkbox') {
      if (field.required && !value) return 'This field is required'
      return null
    }
    const strValue = String(value || '')
    if (field.required && !strValue.trim()) return 'This field is required'
    if (field.type === 'email' && strValue) {
      if (!isValidEmail(strValue)) return 'Please enter a valid email'
    }
    if (field.validation) {
      if (field.validation.minLength && strValue.length < field.validation.minLength) {
        return `Must be at least ${field.validation.minLength} characters`
      }
      if (field.validation.maxLength && strValue.length > field.validation.maxLength) {
        return `Must be no more than ${field.validation.maxLength} characters`
      }
    }
    return null
  }

  // Handle custom form field changes
  const handleCustomFieldChange = (fieldId: string, value: string | boolean) => {
    setCustomFormData(prev => ({ ...prev, [fieldId]: value }))
    setCustomFieldErrors(prev => {
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const openTicketLink = (magicLink?: string) => {
    if (magicLink) {
      Linking.openURL(magicLink)
    }
  }

  const [activeTab, setActiveTab] = useState<'submit' | 'check'>('submit')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState(initialEmail)
  const [name, setName] = useState(initialName)
  const [category, setCategory] = useState<SupportRequestCategory>('general_inquiry')
  const [checkEmail, setCheckEmail] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const handleSubmit = async () => {
    clearMessages()

    // Handle custom form submission
    if (effectiveForm) {
      // Validate all custom form fields
      const errors: Record<string, string> = {}
      let emailField = ''
      let subjectField = ''
      let descriptionField = ''

      for (const field of effectiveForm.fields) {
        const value = customFormData[field.id]
        const fieldError = validateCustomField(value, field)
        if (fieldError) errors[field.id] = fieldError

        // Try to identify email, subject, description fields by label/type
        const labelLower = field.label.toLowerCase()
        if (field.type === 'email' || labelLower.includes('email')) {
          emailField = String(value || '')
        } else if (labelLower.includes('subject') || labelLower.includes('title')) {
          subjectField = String(value || '')
        } else if (field.type === 'textarea' || labelLower.includes('description') || labelLower.includes('message')) {
          descriptionField = String(value || '')
        }
      }

      if (Object.keys(errors).length > 0) {
        setCustomFieldErrors(errors)
        return
      }

      // Build description from all form fields if not found
      if (!descriptionField) {
        descriptionField = effectiveForm.fields
          .map(f => `${f.label}: ${customFormData[f.id] || ''}`)
          .join('\n')
      }

      // Use first text field as subject if not found
      if (!subjectField) {
        const firstTextField = effectiveForm.fields.find(f => f.type === 'text')
        if (firstTextField) {
          subjectField = String(customFormData[firstTextField.id] || effectiveForm.name)
        } else {
          subjectField = effectiveForm.name
        }
      }

      // Email is required
      if (!emailField || !isValidEmail(emailField)) {
        const emailFieldDef = effectiveForm.fields.find(f => f.type === 'email')
        if (emailFieldDef) {
          setCustomFieldErrors({ [emailFieldDef.id]: 'Valid email is required' })
        }
        return
      }

      const result = await submitTicket({
        subject: subjectField,
        description: descriptionField,
        user_email: emailField,
        external_user_id: externalUserId,
      })

      if (result) {
        setCustomFormData({})
        setCustomFieldErrors({})
      }
      return
    }

    // Default form submission
    if (!subject.trim() || !message.trim() || !isValidEmail(email)) return

    const result = await submitTicket({
      subject: subject.trim(),
      description: message.trim(),
      user_email: email.trim(),
      user_name: showName && name.trim() ? name.trim() : undefined,
      category: showCategory ? category : undefined,
      external_user_id: externalUserId,
    })

    if (result) {
      setSubject('')
      setMessage('')
      if (!initialEmail) setEmail('')
      if (!initialName) setName('')
    }
  }

  const handleCheckStatus = async () => {
    if (!isValidEmail(checkEmail)) return

    if (onCheckStatus) {
      onCheckStatus(checkEmail)
      return
    }

    const success = await requestMagicLink(checkEmail)
    if (success) {
      setMagicLinkSent(true)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingVertical: spacing.lg }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        {(heading || description) && (
          <View style={{ marginBottom: spacing.lg }}>
            {heading && (
              <Text style={{ fontSize: typography['2xl'], fontWeight: '700', color: colors.foreground, marginBottom: spacing.xs }}>
                {heading}
              </Text>
            )}
            {description && (
              <Text style={{ fontSize: typography.base, color: colors.mutedForeground, lineHeight: 22 }}>
                {description}
              </Text>
            )}
          </View>
        )}

        {/* Tab Switcher */}
        {showCheckStatus && (
          <View style={{ flexDirection: 'row', backgroundColor: colors.muted, borderRadius: radius.md, padding: 4, marginBottom: spacing.lg }}>
            <TouchableOpacity
              onPress={() => setActiveTab('submit')}
              style={{
                flex: 1,
                paddingVertical: spacing.sm,
                borderRadius: radius.sm,
                backgroundColor: activeTab === 'submit' ? colors.card : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: typography.sm, fontWeight: '500', color: activeTab === 'submit' ? colors.foreground : colors.mutedForeground }}>
                Submit Request
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('check')}
              style={{
                flex: 1,
                paddingVertical: spacing.sm,
                borderRadius: radius.sm,
                backgroundColor: activeTab === 'check' ? colors.card : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: typography.sm, fontWeight: '500', color: activeTab === 'check' ? colors.foreground : colors.mutedForeground }}>
                Check Status
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'submit' ? (
          /* Submit Form */
          <View style={{ backgroundColor: 'transparent', borderRadius: radius.lg, padding: spacing.lg }}>
            {/* Section Header */}
            <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }}>
              <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: typography.lg, fontWeight: '600', color: colors.foreground, marginBottom: 2 }}>
                  {effectiveForm?.name || submitTitle}
                </Text>
                <Text style={{ fontSize: typography.sm, color: colors.mutedForeground, lineHeight: 18 }}>
                  {effectiveForm?.description || submitDescription}
                </Text>
              </View>
            </View>

            {/* Success */}
            {successMessage && (
              <TouchableOpacity
                onPress={clearMessages}
                style={{ backgroundColor: '#10b98120', padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
              >
                <CheckCircle2 size={20} color="#10b981" />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#10b981', fontSize: typography.sm, fontWeight: '600' }}>
                    {effectiveForm?.successMessage || 'Request Submitted'}
                  </Text>
                  <Text style={{ color: '#10b981', fontSize: typography.xs }}>We'll get back to you soon. Tap to dismiss.</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Error */}
            {(error || effectiveFormError) && (
              <View style={{ backgroundColor: colors.error + '15', padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md }}>
                <Text style={{ color: colors.error, fontSize: typography.sm }}>{error || effectiveFormError}</Text>
              </View>
            )}

            {/* Loading state for customization or custom form */}
            {(isLoadingCustomization || isLoadingEffectiveForm) && (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl }}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}

            {/* Form Fields */}
            <View style={{ gap: spacing.md }}>
              {/* Custom Form Fields */}
              {effectiveForm && !isLoadingEffectiveForm && !isLoadingCustomization && (
                <>
                  {effectiveForm.fields.map((field) => (
                    <CustomFormFieldInput
                      key={field.id}
                      field={field}
                      value={customFormData[field.id]}
                      error={customFieldErrors[field.id]}
                      onChange={(value) => handleCustomFieldChange(field.id, value)}
                      colors={colors}
                      radius={radius}
                      typography={typography}
                      spacing={spacing}
                    />
                  ))}
                </>
              )}

              {/* Default Form Fields - only show if no custom form and done loading */}
              {!effectiveForm && !isLoadingCustomization && !isLoadingEffectiveForm && (
                <>
              {/* Name */}
              {showName && (
                <View>
                  <Text style={{ fontSize: typography.sm, fontWeight: '500', color: colors.foreground, marginBottom: spacing.xs }}>Name</Text>
                  <TextInput
                    style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 12, fontSize: typography.base, color: colors.foreground }}
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="words"
                  />
                </View>
              )}

              {/* Email */}
              <View>
                <Text style={{ fontSize: typography.sm, fontWeight: '500', color: colors.foreground, marginBottom: spacing.xs }}>
                  Email Address <Text style={{ color: colors.error }}>*</Text>
                </Text>
                <TextInput
                  style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 12, fontSize: typography.base, color: colors.foreground }}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Category */}
              {showCategory && (
                <View>
                  <Text style={{ fontSize: typography.sm, fontWeight: '500', color: colors.foreground, marginBottom: spacing.xs }}>Category</Text>
                  <TouchableOpacity
                    onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                    style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: typography.base, color: colors.foreground }}>
                      {categoryOptions.find(c => c.value === category)?.label}
                    </Text>
                    <Text style={{ color: colors.mutedForeground }}>▼</Text>
                  </TouchableOpacity>
                  {showCategoryPicker && (
                    <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, marginTop: spacing.xs }}>
                      {categoryOptions.map((opt) => (
                        <TouchableOpacity
                          key={opt.value}
                          onPress={() => { setCategory(opt.value); setShowCategoryPicker(false) }}
                          style={{ paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: opt.value !== 'account' ? 1 : 0, borderBottomColor: colors.border }}
                        >
                          <Text style={{ fontSize: typography.sm, color: category === opt.value ? colors.primary : colors.foreground, fontWeight: category === opt.value ? '600' : '400' }}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Subject */}
              <View>
                <Text style={{ fontSize: typography.sm, fontWeight: '500', color: colors.foreground, marginBottom: spacing.xs }}>
                  Subject <Text style={{ color: colors.error }}>*</Text>
                </Text>
                <TextInput
                  style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 12, fontSize: typography.base, color: colors.foreground }}
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="Brief description of your issue"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>

              {/* Message */}
              <View>
                <Text style={{ fontSize: typography.sm, fontWeight: '500', color: colors.foreground, marginBottom: spacing.xs }}>
                  Message <Text style={{ color: colors.error }}>*</Text>
                </Text>
                <TextInput
                  style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 12, fontSize: typography.base, color: colors.foreground, minHeight: 120, textAlignVertical: 'top' }}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Describe your issue in detail..."
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  numberOfLines={5}
                />
              </View>
              </>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting || isLoadingCustomization || isLoadingEffectiveForm || (
                  effectiveForm ? false : (!subject.trim() || !message.trim() || !isValidEmail(email))
                )}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: radius.md,
                  paddingVertical: spacing.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.sm,
                  opacity: isSubmitting || isLoadingCustomization || isLoadingEffectiveForm || (
                    effectiveForm ? false : (!subject.trim() || !message.trim() || !isValidEmail(email))
                  ) ? 0.5 : 1,
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Send size={18} color="#FFF" />
                    <Text style={{ color: '#FFF', fontWeight: '600', fontSize: typography.base }}>
                      {effectiveForm?.submitButtonText || submitButtonText}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : magicLinkSent ? (
          /* Magic Link Sent */
          <View style={{ backgroundColor: 'transparent', borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center' }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }}>
              <Mail size={32} color={colors.primary} />
            </View>
            <Text style={{ fontSize: typography.xl, fontWeight: '700', color: colors.foreground, marginBottom: spacing.sm, textAlign: 'center' }}>
              Check Your Email
            </Text>
            <Text style={{ fontSize: typography.base, color: colors.mutedForeground, textAlign: 'center', marginBottom: spacing.xs }}>
              We've sent a magic link to
            </Text>
            <Text style={{ fontSize: typography.base, fontWeight: '600', color: colors.foreground, marginBottom: spacing.lg }}>
              {checkEmail}
            </Text>
            <Text style={{ fontSize: typography.sm, color: colors.mutedForeground, textAlign: 'center', marginBottom: spacing.lg }}>
              Click the link in the email to view your support requests.
            </Text>
            <TouchableOpacity onPress={() => { setMagicLinkSent(false); setCheckEmail('') }}>
              <Text style={{ color: colors.primary, fontWeight: '500', fontSize: typography.sm }}>Use a different email</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Check Status Form */
          <View style={{ backgroundColor: 'transparent', borderRadius: radius.lg, padding: spacing.lg }}>
            {/* Section Header */}
            <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }}>
              <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
                <Search size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: typography.lg, fontWeight: '600', color: colors.foreground, marginBottom: 2 }}>{checkTitle}</Text>
                <Text style={{ fontSize: typography.sm, color: colors.mutedForeground, lineHeight: 18 }}>{checkDescription}</Text>
              </View>
            </View>

            {/* Error */}
            {error && activeTab === 'check' && (
              <View style={{ backgroundColor: colors.error + '15', padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md }}>
                <Text style={{ color: colors.error, fontSize: typography.sm }}>{error}</Text>
              </View>
            )}

            {/* Email Input */}
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{ fontSize: typography.sm, fontWeight: '500', color: colors.foreground, marginBottom: spacing.xs }}>Email Address</Text>
              <TextInput
                style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 12, fontSize: typography.base, color: colors.foreground }}
                value={checkEmail}
                onChangeText={setCheckEmail}
                placeholder="Enter the email you used to submit"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Find Button */}
            <TouchableOpacity
              onPress={handleCheckStatus}
              disabled={isSendingMagicLink || !isValidEmail(checkEmail)}
              style={{
                backgroundColor: colors.primary,
                borderRadius: radius.md,
                paddingVertical: spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                opacity: isSendingMagicLink || !isValidEmail(checkEmail) ? 0.5 : 1,
              }}
            >
              {isSendingMagicLink ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Search size={18} color="#FFF" />
                  <Text style={{ color: '#FFF', fontWeight: '600', fontSize: typography.base }}>Find My Requests</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Help Text */}
            <View style={{ marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'center' }}>
              <HelpCircle size={24} color={colors.mutedForeground} style={{ marginBottom: spacing.sm }} />
              <Text style={{ fontSize: typography.sm, color: colors.mutedForeground, textAlign: 'center' }}>
                You'll receive a magic link to view your tickets
              </Text>
            </View>

            {/* Stored Tickets */}
            {storedTickets.length > 0 && (
              <View style={{ marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
                  <Ticket size={18} color={colors.foreground} />
                  <Text style={{ fontSize: typography.base, fontWeight: '600', color: colors.foreground }}>Your Recent Requests</Text>
                </View>
                {storedTickets.map((ticket) => {
                  const status = statusConfig[ticket.status] || statusConfig.open
                  return (
                    <TouchableOpacity
                      key={ticket.id}
                      onPress={() => openTicketLink(ticket.magic_link)}
                      style={{
                        backgroundColor: colors.muted,
                        borderRadius: radius.md,
                        padding: spacing.md,
                        marginBottom: spacing.sm,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                        <View style={{ backgroundColor: status.color + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm }}>
                          <Text style={{ fontSize: typography.xs, fontWeight: '600', color: status.color }}>{status.label}</Text>
                        </View>
                        <Text style={{ fontSize: typography.xs, color: colors.mutedForeground }}>{formatDate(ticket.created_at)}</Text>
                      </View>
                      <Text style={{ fontSize: typography.sm, fontWeight: '500', color: colors.foreground, marginBottom: 2 }} numberOfLines={1}>
                        {ticket.subject}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: typography.xs, color: colors.mutedForeground }}>{ticket.user_email}</Text>
                        {ticket.magic_link && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={{ fontSize: typography.xs, color: colors.primary }}>View</Text>
                            <ExternalLink size={12} color={colors.primary} />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// ============================================================================
// CustomFormFieldInput - Renders individual custom form fields
// ============================================================================

interface CustomFormFieldInputProps {
  field: ContactFormField
  value: string | boolean | undefined
  error?: string
  onChange: (value: string | boolean) => void
  colors: {
    background: string
    border: string
    foreground: string
    mutedForeground: string
    primary: string
    error: string
    muted: string
  }
  radius: { md: number; sm: number }
  typography: { sm: number; base: number; xs: number }
  spacing: { xs: number; sm: number; md: number }
}

function CustomFormFieldInput({
  field,
  value,
  error,
  onChange,
  colors,
  radius,
  typography,
  spacing,
}: CustomFormFieldInputProps): React.ReactElement {
  const inputStyle = {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: error ? colors.error : colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: typography.base,
    color: colors.foreground,
  }

  return (
    <View>
      {/* Label - except for checkbox */}
      {field.type !== 'checkbox' && (
        <Text style={{ fontSize: typography.sm, fontWeight: '500', color: colors.foreground, marginBottom: spacing.xs }}>
          {field.label}
          {field.required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>
      )}

      {/* Text Input */}
      {field.type === 'text' && (
        <TextInput
          style={inputStyle}
          value={typeof value === 'string' ? value : ''}
          onChangeText={onChange}
          placeholder={field.placeholder}
          placeholderTextColor={colors.mutedForeground}
        />
      )}

      {/* Email Input */}
      {field.type === 'email' && (
        <TextInput
          style={inputStyle}
          value={typeof value === 'string' ? value : ''}
          onChangeText={onChange}
          placeholder={field.placeholder || 'you@example.com'}
          placeholderTextColor={colors.mutedForeground}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      )}

      {/* Textarea */}
      {field.type === 'textarea' && (
        <TextInput
          style={[inputStyle, { minHeight: 120, textAlignVertical: 'top' }]}
          value={typeof value === 'string' ? value : ''}
          onChangeText={onChange}
          placeholder={field.placeholder}
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={5}
        />
      )}

      {/* Select / Radio */}
      {(field.type === 'select' || field.type === 'radio') && (
        <View style={{ gap: spacing.xs }}>
          {field.options?.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => onChange(option)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                backgroundColor: value === option ? colors.primary + '20' : colors.muted,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: value === option ? colors.primary : colors.border,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: field.type === 'radio' ? 10 : 4,
                  borderWidth: 2,
                  borderColor: value === option ? colors.primary : colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.sm,
                }}
              >
                {value === option && (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: field.type === 'radio' ? 5 : 2,
                      backgroundColor: colors.primary,
                    }}
                  />
                )}
              </View>
              <Text style={{ color: colors.foreground, fontSize: typography.base }}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Checkbox */}
      {field.type === 'checkbox' && (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Switch
            value={!!value}
            onValueChange={onChange}
            trackColor={{ false: colors.muted, true: colors.primary }}
            thumbColor={colors.background}
          />
          <TouchableOpacity onPress={() => onChange(!value)} style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={{ fontSize: typography.base, color: colors.foreground }}>
              {field.label}
              {field.required && <Text style={{ color: colors.error }}> *</Text>}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error Message */}
      {error && (
        <Text style={{ color: colors.error, fontSize: typography.xs, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  )
}

export default SupportForm
