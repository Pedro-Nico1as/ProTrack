import React, { useState } from 'react';
import { TextInput, TextInputProps, View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, sizing } from '../../theme/tokens';
import { Text } from './Text';
import { IconEye, IconEyeOff } from '@tabler/icons-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export const Input = ({ label, error, style, isPassword, ...rest }: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);

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
          secureTextEntry={isPassword ? !showPassword : rest.secureTextEntry}
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
  },
  inputContainer: {
    height: sizing.buttonHeight,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: sizing.cardRadius - 4,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputError: {
    borderColor: colors.error,
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
