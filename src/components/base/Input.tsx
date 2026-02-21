/**
 * Input Component
 *
 * A styled text input with Hazel design system styling.
 */

import React, { useState } from 'react'
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  type TextInputProps,
} from 'react-native'
import { useAppgramTheme } from '../../provider'

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string
  error?: string
  containerStyle?: ViewStyle
  inputStyle?: TextStyle
  labelStyle?: TextStyle
}

export function Input({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  ...props
}: InputProps): React.ReactElement {
  const { colors, radius, typography } = useAppgramTheme()
  const [isFocused, setIsFocused] = useState(false)

  const inputContainerStyle: ViewStyle = {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
  }

  const textInputStyle: TextStyle = {
    fontSize: typography.base,
    color: colors.foreground,
    padding: 0,
    margin: 0,
  }

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          style={[
            {
              fontSize: typography.sm,
              fontWeight: '500',
              color: colors.foreground,
              marginBottom: 6,
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}
      <View style={inputContainerStyle}>
        <TextInput
          {...props}
          style={[textInputStyle, inputStyle]}
          placeholderTextColor={colors.mutedForeground}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
        />
      </View>
      {error && (
        <Text
          style={{
            fontSize: typography.xs,
            color: colors.error,
            marginTop: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  )
}

export default Input
