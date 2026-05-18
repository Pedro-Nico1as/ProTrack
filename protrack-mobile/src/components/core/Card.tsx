import React from 'react';
import { Pressable, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, sizing, animation, spacing } from '../../theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface CardProps extends ViewProps {
  gradient?: string[];
  onPress?: () => void;
  pressable?: boolean;
  noPadding?: boolean;
}

export const Card = ({
  children,
  style,
  gradient = colors.gradients.card,
  onPress,
  pressable = !!onPress,
  noPadding = false,
  ...props
}: CardProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (pressable) {
      scale.value = withTiming(animation.pressScale, { duration: animation.duration.fast });
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      scale.value = withTiming(1, { duration: animation.duration.normal });
    }
  };

  return (
    <AnimatedPressable
      style={[styles.outer, animatedStyle, style as ViewStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      <LinearGradient
        colors={gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, !noPadding && styles.padding]}
      >
        {children}
      </LinearGradient>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  outer: {
    borderRadius: sizing.cardRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  gradient: {
    borderRadius: sizing.cardRadius,
  },
  padding: {
    padding: spacing.md,
  },
});
