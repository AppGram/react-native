import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native'
import { useAppgramTheme, useAppgramContext } from '../../provider'
import { useContactForm, useContactFormSubmit } from '../../hooks'
import { Button, Card } from '../base'
import type { ContactFormField } from '../../types'

export interface ContactFormRendererProps {
  formId: string
  projectId?: string
  title?: string
  description?: string
  onSuccess?: () => void
  onError?: (error: string) => void
  style?: ViewStyle
}

/**
 * ContactFormRenderer Component
 *
 * Renders a dynamic contact form based on form configuration.
 * Supports text, email, textarea, checkbox, select, and radio fields.
 *
 * @example
 * ```tsx
 * import { ContactFormRenderer } from '@appgram/react-native'
 *
 * function ContactScreen() {
 *   return (
 *     <ContactFormRenderer
 *       formId="contact-form-id"
 *       title="Contact Us"
 *       description="We'd love to hear from you"
 *       onSuccess={() => {
 *         Alert.alert('Success', 'Message sent!')
 *         navigation.goBack()
 *       }}
 *       onError={(error) => Alert.alert('Error', error)}
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom project ID
 * <ContactFormRenderer
 *   formId="feedback-form"
 *   projectId="custom-project-id"
 *   onSuccess={() => setShowThankYou(true)}
 * />
 * ```
 */
export function ContactFormRenderer({
  formId,
  projectId: propProjectId,
  title,
  description,
  onSuccess,
  onError,
  style,
}: ContactFormRendererProps): React.ReactElement {
  const { colors, radius, typography, spacing } = useAppgramTheme()
  const { config } = useAppgramContext()
  const projectId = propProjectId || config.projectId

  const { form, isLoading: formLoading, error: formError } = useContactForm(formId)
  const { submitForm, isSubmitting, error: submitError, successMessage } = useContactFormSubmit({
    onSuccess,
    onError,
  })

  const [formData, setFormData] = useState<Record<string, string | boolean>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleFieldChange = useCallback((fieldId: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    setFieldErrors(prev => {
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
  }, [])

  const validateForm = (): boolean => {
    if (!form) return false

    const errors: Record<string, string> = {}

    for (const field of form.fields) {
      const value = formData[field.id]

      if (field.required) {
        if (field.type === 'checkbox') {
          if (!value) {
            errors[field.id] = 'This field is required'
          }
        } else if (!value || (typeof value === 'string' && !value.trim())) {
          errors[field.id] = 'This field is required'
        }
      }

      if (field.type === 'email' && value && typeof value === 'string') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[field.id] = 'Please enter a valid email'
        }
      }

      if (field.validation && typeof value === 'string') {
        if (field.validation.minLength && value.length < field.validation.minLength) {
          errors[field.id] = `Must be at least ${field.validation.minLength} characters`
        }
        if (field.validation.maxLength && value.length > field.validation.maxLength) {
          errors[field.id] = `Must be no more than ${field.validation.maxLength} characters`
        }
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!form || !validateForm()) return

    const result = await submitForm(projectId, formId, formData)
    if (result) {
      setFormData({})
    }
  }

  const inputStyle: ViewStyle = {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
  }

  const renderField = (field: ContactFormField) => {
    const error = fieldErrors[field.id]
    const value = formData[field.id]

    switch (field.type) {
      case 'checkbox':
        return (
          <View key={field.id} style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Switch
                value={!!value}
                onValueChange={(v) => handleFieldChange(field.id, v)}
                trackColor={{ false: colors.muted, true: colors.primary }}
                thumbColor={colors.background}
              />
              <Text
                style={{
                  fontSize: typography.base,
                  color: colors.foreground,
                  marginLeft: spacing.sm,
                  flex: 1,
                }}
              >
                {field.label}
                {field.required && <Text style={{ color: colors.error }}> *</Text>}
              </Text>
            </View>
            {error && (
              <Text style={{ color: colors.error, fontSize: typography.xs, marginTop: 4 }}>
                {error}
              </Text>
            )}
          </View>
        )

      case 'select':
      case 'radio':
        return (
          <View key={field.id} style={{ marginBottom: spacing.md }}>
            <Text
              style={{
                fontSize: typography.sm,
                fontWeight: '500',
                color: colors.foreground,
                marginBottom: spacing.xs,
              }}
            >
              {field.label}
              {field.required && <Text style={{ color: colors.error }}> *</Text>}
            </Text>
            <View style={{ gap: spacing.xs }}>
              {field.options?.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => handleFieldChange(field.id, option)}
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
            {error && (
              <Text style={{ color: colors.error, fontSize: typography.xs, marginTop: 4 }}>
                {error}
              </Text>
            )}
          </View>
        )

      case 'textarea':
        return (
          <View key={field.id} style={{ marginBottom: spacing.md }}>
            <Text
              style={{
                fontSize: typography.sm,
                fontWeight: '500',
                color: colors.foreground,
                marginBottom: spacing.xs,
              }}
            >
              {field.label}
              {field.required && <Text style={{ color: colors.error }}> *</Text>}
            </Text>
            <TextInput
              style={[
                inputStyle,
                { minHeight: 100, textAlignVertical: 'top', color: colors.foreground, fontSize: typography.base },
                error ? { borderColor: colors.error } : undefined,
              ]}
              value={typeof value === 'string' ? value : ''}
              onChangeText={(text) => handleFieldChange(field.id, text)}
              placeholder={field.placeholder}
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={4}
            />
            {error && (
              <Text style={{ color: colors.error, fontSize: typography.xs, marginTop: 4 }}>
                {error}
              </Text>
            )}
          </View>
        )

      default: // text, email
        return (
          <View key={field.id} style={{ marginBottom: spacing.md }}>
            <Text
              style={{
                fontSize: typography.sm,
                fontWeight: '500',
                color: colors.foreground,
                marginBottom: spacing.xs,
              }}
            >
              {field.label}
              {field.required && <Text style={{ color: colors.error }}> *</Text>}
            </Text>
            <TextInput
              style={[
                inputStyle,
                { color: colors.foreground, fontSize: typography.base },
                error ? { borderColor: colors.error } : undefined,
              ]}
              value={typeof value === 'string' ? value : ''}
              onChangeText={(text) => handleFieldChange(field.id, text)}
              placeholder={field.placeholder}
              placeholderTextColor={colors.mutedForeground}
              keyboardType={field.type === 'email' ? 'email-address' : 'default'}
              autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
              autoCorrect={field.type !== 'email'}
            />
            {error && (
              <Text style={{ color: colors.error, fontSize: typography.xs, marginTop: 4 }}>
                {error}
              </Text>
            )}
          </View>
        )
    }
  }

  // Loading state
  if (formLoading) {
    return (
      <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, style]}>
        <Text style={{ color: colors.mutedForeground }}>Loading form...</Text>
      </View>
    )
  }

  // Error state
  if (formError || !form) {
    return (
      <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }, style]}>
        <Text style={{ color: colors.error, textAlign: 'center' }}>
          {formError || 'Failed to load form'}
        </Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[{ flex: 1 }, style]}
    >
      <ScrollView
        contentContainerStyle={{ paddingVertical: spacing.lg }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card variant="elevated">
          <Text
            style={{
              fontSize: typography.xl,
              fontWeight: '700',
              color: colors.foreground,
              marginBottom: spacing.xs,
            }}
          >
            {title || form.name}
          </Text>
          {(description || form.description) && (
            <Text
              style={{
                fontSize: typography.sm,
                color: colors.mutedForeground,
                marginBottom: spacing.lg,
              }}
            >
              {description || form.description}
            </Text>
          )}

          {successMessage && (
            <View
              style={{
                backgroundColor: colors.successSubtle,
                padding: spacing.md,
                borderRadius: radius.md,
                marginBottom: spacing.lg,
              }}
            >
              <Text style={{ color: colors.success, fontSize: typography.sm }}>
                {form.successMessage || successMessage}
              </Text>
            </View>
          )}

          {submitError && (
            <View
              style={{
                backgroundColor: colors.errorSubtle,
                padding: spacing.md,
                borderRadius: radius.md,
                marginBottom: spacing.lg,
              }}
            >
              <Text style={{ color: colors.error, fontSize: typography.sm }}>
                {submitError}
              </Text>
            </View>
          )}

          {form.fields.map(renderField)}

          <Button
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={{ marginTop: spacing.sm }}
          >
            {form.submitButtonText || 'Submit'}
          </Button>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default ContactFormRenderer
