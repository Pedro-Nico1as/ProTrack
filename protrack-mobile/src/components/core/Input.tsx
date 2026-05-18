import React from 'react';
import { TextInput, TextInputProps, View, StyleSheet } from 'react-native';
import { colors, spacing, typography, sizing } from '../../theme/tokens';
import { Text } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, style, ...rest }: InputProps) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text variant="caption" color={colors.textSecondary} style={styles.label}>
          {label}
        </Text>
      )}
      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          {...rest}
        />
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
  },
  inputContainer: {
    height: sizing.buttonHeight,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: sizing.cardRadius - 4,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: typography.sizes.md,
    paddingHorizontal: spacing.md,
  },
  errorText: {
    marginTop: spacing.xs,
    marginLeft: 4,
  },
});
