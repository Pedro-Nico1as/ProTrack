import React, { useState } from 'react';
import { TextInput, TextInputProps, View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, sizing } from '../../theme/tokens';
import { Text } from './Text';
import { IconEye, IconEyeOff } from '@tabler/icons-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  leftIcon?: React.ReactNode;
}

export const Input = ({ label, error, style, isPassword, leftIcon, ...rest }: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (rest.onFocus) rest.onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (rest.onBlur) rest.onBlur(e);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text variant="caption" color={colors.textSecondary} style={styles.label}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          isFocused ? styles.inputFocused : null,
          error ? styles.inputError : null,
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon ? { paddingLeft: spacing.xs } : null, style]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword ? !showPassword : rest.secureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            {showPassword ? (
              <IconEyeOff size={20} color={colors.textSecondary} />
            ) : (
              <IconEye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text variant="caption" color={colors.error} style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
    marginLeft: 4,
    fontWeight: '500',
  },
  inputContainer: {
    height: sizing.buttonHeight,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: sizing.cardRadius - 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFocused: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(255, 77, 77, 0.05)',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  leftIconContainer: {
    paddingLeft: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: typography.sizes.md,
    paddingHorizontal: spacing.md,
    height: '100%',
  },
  eyeButton: {
    paddingHorizontal: spacing.md,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: spacing.xs,
    marginLeft: 4,
  },
});
