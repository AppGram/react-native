import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Switch,
  Dimensions,
} from 'react-native'
import { X, Send, Sparkles } from 'lucide-react-native'
import { useAppgramTheme, useAppgramContext } from '../../provider'
import type { Wish, Form, FormField } from '../../types'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export interface SubmitWishSheetProps {
  /**
   * Whether the sheet is visible
   */
  visible: boolean

  /**
   * Callback when visibility changes
   */
  onClose: () => void

  /**
   * Callback when wish is successfully submitted
   */
  onSuccess?: (wish: Wish) => void

  /**
   * Callback when submission fails
   */
  onError?: (error: string) => void

  /**
   * Form title
   * @default 'Submit a Feature Request'
   */
  title?: string

  /**
   * Form description
   */
  description?: string

  /**
   * Submit button text
   * @default 'Submit Feature Request'
   */
  submitButtonText?: string

  /**
   * Custom form ID to use instead of default form.
   * When provided, fetches the form config and renders its fields dynamically.
   * The form should have integration.type = 'wish' to create feature requests.
   */
  customFormId?: string
}

interface FormData {
  title: string
  description: string
  email: string
}

/**
 * SubmitWishSheet Component
 *
 * Bottom sheet/modal for submitting new feature requests.
 * Supports auto-detection of custom forms from project customization.
 *
 * @example
 * ```tsx
 * import { SubmitWishSheet } from '@appgram/react-native'
 *
 * function FeedbackScreen() {
 *   const [visible, setVisible] = useState(false)
 *
 *   return (
 *     <>
 *       <Button title="Submit Idea" onPress={() => setVisible(true)} />
 *       <SubmitWishSheet
 *         visible={visible}
 *         onClose={() => setVisible(false)}
 *         onSuccess={(wish) => {
 *           Alert.alert('Success', 'Your idea has been submitted!')
 *           setVisible(false)
 *         }}
 *         title="Submit a Feature Request"
 *         description="Tell us what you'd like to see"
 *       />
 *     </>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom form
 * <SubmitWishSheet
 *   visible={visible}
 *   onClose={() => setVisible(false)}
 *   customFormId="feature-request-form"
 *   onSuccess={(wish) => refetchWishes()}
 *   onError={(error) => Alert.alert('Error', error)}
 * />
 * ```
 */
export function SubmitWishSheet({
  visible,
  onClose,
  onSuccess,
  onError,
  title = 'Submit a Feature Request',
  description = "Share your idea with us! We review all submissions and prioritize based on community feedback.",
  submitButtonText = 'Submit Feature Request',
  customFormId,
}: SubmitWishSheetProps): React.ReactElement {
  const { colors, radius, typography, spacing } = useAppgramTheme()
  const { client } = useAppgramContext()

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    email: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-detect custom form from project customization
  const [customForm, setCustomForm] = useState<Form | null>(null)
  const [customFormFields, setCustomFormFields] = useState<FormField[]>([])
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | boolean>>({})
  const [isLoadingCustomization, setIsLoadingCustomization] = useState(false)

  // Fetch project customization to get wish form config (only once when sheet opens)
  useEffect(() => {
    if (!visible) return
    if (customFormId) return // Skip auto-detect if explicit ID provided

    const fetchCustomization = async () => {
      setIsLoadingCustomization(true)
      try {
        const response = await client.getPageData()

        if (response.success && response.data?.customization_data) {
          const customizationData = response.data.customization_data as {
            content?: { feedback?: { customFormId?: string } }
            contactForms?: Record<string, Form & { integration?: { type: string } }>
          }

          const contactForms = customizationData.contactForms || {}

          // Check for explicit customFormId in content.feedback
          const explicitFormId = customizationData.content?.feedback?.customFormId
          if (explicitFormId && contactForms[explicitFormId]) {
            const form = contactForms[explicitFormId]
            if (form.enabled && form.integration?.type === 'wish') {
              setCustomForm(form as Form)
              // Filter out built-in fields
              const extraFields = form.fields.filter(
                (f) => !['title', 'description', 'email', 'name', 'message'].includes(f.id.toLowerCase())
              )
              setCustomFormFields(extraFields)
              setIsLoadingCustomization(false)
              return
            }
          }

          // Auto-detect: find any enabled form with integration.type = 'wish'
          const wishFormEntry = Object.entries(contactForms).find(([_, form]) => {
            if (!form || typeof form !== 'object') return false
            if (!('fields' in form) || !Array.isArray(form.fields)) return false
            return form.enabled && form.integration?.type === 'wish'
          })

          if (wishFormEntry) {
            const [, form] = wishFormEntry
            setCustomForm(form as Form)
            // Filter out built-in fields
            const extraFields = form.fields.filter(
              (f) => !['title', 'description', 'email', 'name', 'message'].includes(f.id.toLowerCase())
            )
            setCustomFormFields(extraFields)
          }
        }
      } catch (err) {
        // Silently ignore - use default form
      } finally {
        setIsLoadingCustomization(false)
      }
    }

    fetchCustomization()
  }, [visible, client, customFormId])

  // Reset form when sheet opens
  useEffect(() => {
    if (visible) {
      setFormData({ title: '', description: '', email: '' })
      setCustomFieldValues({})
      setError(null)
    }
  }, [visible])

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) return

    // Validate required custom fields
    for (const field of customFormFields) {
      if (field.required && !customFieldValues[field.id]) {
        setError(`${field.label} is required`)
        return
      }
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Extract author name from email or use default
      let authorName = 'Anonymous User'
      if (formData.email) {
        const emailParts = formData.email.split('@')[0]
        authorName =
          emailParts
            .split(/[._-]/)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ') || 'Anonymous User'
      }

      // Build description with custom field values appended
      let fullDescription = formData.description.trim()
      if (Object.keys(customFieldValues).length > 0) {
        const customFieldsText = customFormFields
          .filter((f) => customFieldValues[f.id])
          .map((f) => `${f.label}: ${customFieldValues[f.id]}`)
          .join('\n')
        if (customFieldsText) {
          fullDescription += '\n\n---\n' + customFieldsText
        }
      }

      const response = await client.createWish({
        title: formData.title.trim(),
        description: fullDescription,
        author_email: formData.email?.trim() || undefined,
        author_name: authorName,
      })

      if (response.success && response.data) {
        onClose()
        onSuccess?.(response.data)
      } else {
        const errorMessage = response.error?.message || 'Failed to submit feature request'
        setError(errorMessage)
        onError?.(errorMessage)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Effective form title and description (use custom form if available)
  const effectiveTitle = customForm?.name || title
  const effectiveDescription = customForm?.description || description
  const effectiveSubmitText = customForm?.submitButtonText || submitButtonText

  const inputStyle = {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: typography.base,
    color: colors.foreground,
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                maxHeight: SCREEN_HEIGHT * 0.9,
                backgroundColor: colors.card,
                borderTopLeftRadius: radius.xl,
                borderTopRightRadius: radius.xl,
              }}
            >
              {/* Handle Bar */}
              <View style={{ alignItems: 'center', paddingTop: spacing.sm }}>
                <View
                  style={{
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: colors.border,
                  }}
                />
              </View>

              {/* Header */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  paddingHorizontal: spacing.lg,
                  paddingTop: spacing.md,
                  paddingBottom: spacing.sm,
                }}
              >
                <View style={{ flex: 1, marginRight: spacing.md }}>
                  <Text
                    style={{
                      fontSize: typography.xl,
                      fontWeight: '700',
                      color: colors.foreground,
                      marginBottom: spacing.xs,
                    }}
                  >
                    {effectiveTitle}
                  </Text>
                  <Text
                    style={{
                      fontSize: typography.sm,
                      color: colors.mutedForeground,
                      lineHeight: 20,
                    }}
                  >
                    {effectiveDescription}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    padding: spacing.xs,
                    backgroundColor: colors.muted,
                    borderRadius: radius.full,
                  }}
                >
                  <X size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>

              {/* Form Content */}
              <ScrollView
                contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Loading State */}
                {isLoadingCustomization && (
                  <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                )}

                {!isLoadingCustomization && (
                  <View style={{ gap: spacing.md }}>
                    {/* Title Field */}
                    <View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                        <Text style={{ fontSize: typography.sm, fontWeight: '600', color: colors.foreground }}>
                          Feature Title
                        </Text>
                        <Text style={{ fontSize: typography.xs, color: colors.mutedForeground }}>Required</Text>
                      </View>
                      <TextInput
                        style={inputStyle}
                        value={formData.title}
                        onChangeText={(text) => setFormData({ ...formData, title: text })}
                        placeholder="e.g., Add dark mode support"
                        placeholderTextColor={colors.mutedForeground}
                        autoCapitalize="sentences"
                      />
                      <Text style={{ fontSize: typography.xs, color: colors.mutedForeground, marginTop: 4 }}>
                        Keep it concise and descriptive
                      </Text>
                    </View>

                    {/* Description Field */}
                    <View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                        <Text style={{ fontSize: typography.sm, fontWeight: '600', color: colors.foreground }}>
                          Description
                        </Text>
                        <Text style={{ fontSize: typography.xs, color: colors.mutedForeground }}>Required</Text>
                      </View>
                      <TextInput
                        style={[inputStyle, { minHeight: 100, textAlignVertical: 'top' }]}
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        placeholder="Describe your idea in detail. What problem does it solve?"
                        placeholderTextColor={colors.mutedForeground}
                        multiline
                        numberOfLines={5}
                      />
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                        <Text style={{ fontSize: typography.xs, color: colors.mutedForeground }}>
                          Provide as much detail as possible
                        </Text>
                        <Text
                          style={{
                            fontSize: typography.xs,
                            color: formData.description.length > 450 ? colors.primary : colors.mutedForeground,
                          }}
                        >
                          {formData.description.length}/500
                        </Text>
                      </View>
                    </View>

                    {/* Email Field */}
                    <View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                        <Text style={{ fontSize: typography.sm, fontWeight: '600', color: colors.foreground }}>
                          Email Address
                        </Text>
                        <Text style={{ fontSize: typography.xs, color: colors.mutedForeground }}>Optional</Text>
                      </View>
                      <TextInput
                        style={inputStyle}
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                        placeholder="your.email@example.com"
                        placeholderTextColor={colors.mutedForeground}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: spacing.xs }}>
                        <View
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 8,
                            backgroundColor: colors.primary + '20',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Sparkles size={10} color={colors.primary} />
                        </View>
                        <Text style={{ fontSize: typography.xs, color: colors.mutedForeground, flex: 1 }}>
                          We'll notify you when there are updates on your submission.
                        </Text>
                      </View>
                    </View>

                    {/* Custom Form Fields */}
                    {customFormFields.map((field) => (
                      <CustomFieldInput
                        key={field.id}
                        field={field}
                        value={customFieldValues[field.id]}
                        onChange={(value) =>
                          setCustomFieldValues({ ...customFieldValues, [field.id]: value })
                        }
                        colors={colors}
                        radius={radius}
                        typography={typography}
                        spacing={spacing}
                      />
                    ))}

                    {/* Error Message */}
                    {error && (
                      <View
                        style={{
                          backgroundColor: colors.error + '15',
                          padding: spacing.md,
                          borderRadius: radius.md,
                        }}
                      >
                        <Text style={{ color: colors.error, fontSize: typography.sm }}>{error}</Text>
                      </View>
                    )}

                    {/* Submit Button */}
                    <TouchableOpacity
                      onPress={handleSubmit}
                      disabled={!formData.title.trim() || !formData.description.trim() || isSubmitting}
                      style={{
                        backgroundColor: colors.primary,
                        borderRadius: radius.md,
                        paddingVertical: spacing.md,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: spacing.sm,
                        opacity: !formData.title.trim() || !formData.description.trim() || isSubmitting ? 0.5 : 1,
                        marginTop: spacing.sm,
                      }}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color="#FFF" />
                      ) : (
                        <>
                          <Send size={18} color="#FFF" />
                          <Text style={{ color: '#FFF', fontWeight: '600', fontSize: typography.base }}>
                            {effectiveSubmitText}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>

                    {/* Trust Badge */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs }}>
                      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary }} />
                      <Text style={{ fontSize: typography.xs, color: colors.mutedForeground }}>
                        Your feedback is valuable and helps shape our product
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

// ============================================================================
// CustomFieldInput - Renders custom form fields
// ============================================================================

interface CustomFieldInputProps {
  field: FormField
  value: string | boolean | undefined
  onChange: (value: string | boolean) => void
  colors: {
    background: string
    border: string
    foreground: string
    mutedForeground: string
    primary: string
    muted: string
  }
  radius: { md: number; sm: number }
  typography: { sm: number; base: number; xs: number }
  spacing: { xs: number; sm: number; md: number }
}

function CustomFieldInput({
  field,
  value,
  onChange,
  colors,
  radius,
  typography,
  spacing,
}: CustomFieldInputProps): React.ReactElement {
  const inputStyle = {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
          <Text style={{ fontSize: typography.sm, fontWeight: '600', color: colors.foreground }}>
            {field.label}
          </Text>
          <Text style={{ fontSize: typography.xs, color: colors.mutedForeground }}>
            {field.required ? 'Required' : 'Optional'}
          </Text>
        </View>
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
          style={[inputStyle, { minHeight: 80, textAlignVertical: 'top' }]}
          value={typeof value === 'string' ? value : ''}
          onChangeText={onChange}
          placeholder={field.placeholder}
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={4}
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
                  width: 18,
                  height: 18,
                  borderRadius: field.type === 'radio' ? 9 : 4,
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
                      width: 8,
                      height: 8,
                      borderRadius: field.type === 'radio' ? 4 : 2,
                      backgroundColor: colors.primary,
                    }}
                  />
                )}
              </View>
              <Text style={{ color: colors.foreground, fontSize: typography.base }}>{option}</Text>
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
              {field.required && <Text style={{ color: colors.primary }}> *</Text>}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

export default SubmitWishSheet
