import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme/tokens';

type TextVariant = 'hero' | 'heading' | 'subheading' | 'body' | 'caption' | 'label';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  weight?: keyof typeof typography.weights;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Text = ({
  variant = 'body',
  color,
  weight,
  align,
  style,
  children,
  ...props
}: TextProps) => {
  return (
    <RNText
      style={[
        styles[variant],
        color ? { color } : undefined,
        align ? { textAlign: align } : undefined,
        weight ? { fontWeight: typography.weights[weight] as any } : undefined,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  hero: {
    fontSize: typography.sizes.hero,
    fontWeight: typography.weights.heavy as any,
    color: colors.text,
    letterSpacing: typography.letterSpacing.tight,
  },
  heading: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    letterSpacing: typography.letterSpacing.tight,
  },
  subheading: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
  },
  body: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular as any,
    color: colors.text,
  },
  caption: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular as any,
    color: colors.textSecondary,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold as any,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
  },
});
