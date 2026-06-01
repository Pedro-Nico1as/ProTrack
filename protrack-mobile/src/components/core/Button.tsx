import React from 'react';
import { Pressable, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, sizing, spacing, animation } from '../../theme/tokens';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ButtonProps {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  onPress?: () => void;
  style?: ViewStyle;
}

export const Button = ({
  title,
  loading,
  disabled,
  variant = 'primary',
  style,
  onPress,
}: ButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(animation.pressScale, { duration: animation.duration.fast });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: animation.duration.normal });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress();
  };

  const isDisabled = loading || disabled;

  // Gradient buttons (primary)
  if (variant === 'primary') {
    return (
      <AnimatedPressable
        style={[animatedStyle, { opacity: isDisabled ? 0.6 : 1 }, style]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
      >
        <LinearGradient
          colors={colors.gradients.primaryBtn as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text variant="body" weight="bold" color="#FFFFFF">
              {title}
            </Text>
          )}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  // Non-gradient variants
  const variantStyles: Record<string, ViewStyle> = {
    secondary: { backgroundColor: colors.surfaceHighlight },
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
    danger: { backgroundColor: colors.error },
  };

  const textColors: Record<string, string> = {
    secondary: colors.text,
    outline: colors.primary,
    danger: colors.background,
  };

  return (
    <AnimatedPressable
      style={[
        styles.container,
        variantStyles[variant],
        animatedStyle,
        { opacity: isDisabled ? 0.6 : 1 },
        style,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} />
      ) : (
        <Text variant="body" weight="bold" color={textColors[variant]}>
          {title}
        </Text>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: sizing.buttonHeight,
    borderRadius: sizing.cardRadius,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  gradient: {
    height: sizing.buttonHeight,
    borderRadius: sizing.cardRadius,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
});
