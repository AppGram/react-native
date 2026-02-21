/**
 * Form Types
 *
 * Configurable forms for collecting user submissions.
 */

export type FormFieldType = 'text' | 'email' | 'textarea' | 'select' | 'radio' | 'checkbox'

export interface FormFieldValidation {
  minLength?: number
  maxLength?: number
  pattern?: string
}

export interface FormField {
  id: string
  type: FormFieldType
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: FormFieldValidation
}

/**
 * Form integration settings
 * Defines how the form submission is processed
 */
export interface FormIntegration {
  /**
   * Integration type:
   * - 'support': Creates a support ticket
   * - 'wish': Creates a feature request/wish
   * - 'email': Sends email notification
   * - 'webhook': Posts to external webhook
   */
  type: 'support' | 'wish' | 'email' | 'webhook'

  /**
   * For support integration: auto-assign to team member
   */
  assigneeId?: string

  /**
   * For webhook integration: target URL
   */
  webhookUrl?: string
}

export interface Form {
  id: string
  name: string
  description?: string
  fields: FormField[]
  submitButtonText: string
  successMessage: string
  emailRecipient: string
  emailSubject: string
  enabled: boolean
  createdAt?: string
  updatedAt?: string

  /**
   * Integration settings for form submission
   */
  integration?: FormIntegration
}

export interface FormSubmission {
  id: string
  form_id: string
  project_id: string
  data: Record<string, string | boolean>
  submitted_at: string
}

export interface FormSubmitInput {
  data: Record<string, string | boolean>
  metadata?: Record<string, unknown>
}
