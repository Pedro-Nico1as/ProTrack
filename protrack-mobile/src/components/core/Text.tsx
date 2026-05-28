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

const getFontFamily = (variant: TextVariant, weight?: keyof typeof typography.weights) => {
  if (weight) {
    switch (weight) {
      case 'regular':
        return 'Outfit-Regular';
      case 'medium':
        return 'Outfit-Medium';
      case 'semibold':
        return 'Outfit-SemiBold';
      case 'bold':
        return 'Outfit-Bold';
      case 'heavy':
        return 'Outfit-ExtraBold';
      default:
        return 'Outfit-Regular';
    }
  }

  switch (variant) {
    case 'hero':
      return 'Outfit-Black';
    case 'heading':
      return 'Outfit-Bold';
    case 'subheading':
      return 'Outfit-SemiBold';
    case 'caption':
      return 'Outfit-Regular';
    case 'label':
      return 'Outfit-SemiBold';
    default:
      return 'Outfit-Regular';
  }
};

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
        { fontFamily: getFontFamily(variant, weight) },
        color ? { color } : undefined,
        align ? { textAlign: align } : undefined,
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
    color: colors.text,
    letterSpacing: typography.letterSpacing.tight,
  },
  heading: {
    fontSize: typography.sizes.title,
    color: colors.text,
    letterSpacing: typography.letterSpacing.tight,
  },
  subheading: {
    fontSize: typography.sizes.xl,
    color: colors.text,
  },
  body: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  caption: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  label: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
  },
});
