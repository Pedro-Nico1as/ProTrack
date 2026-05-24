import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, sizing, animation } from '../../theme/tokens';
import { Text } from '../core/Text';
import { strings } from '../../constants/strings';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BuildWorkoutCardProps {
  onPress: () => void;
}

export const BuildWorkoutCard = ({ onPress }: BuildWorkoutCardProps) => {
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
    onPress();
  };

  return (
    <AnimatedPressable
      style={[styles.container, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </View>

      <View style={styles.textWrap}>
        <Text variant="body" weight="semibold">
          {strings.buildWorkout.title}
        </Text>
        <Text variant="caption">{strings.buildWorkout.subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: sizing.cardRadius,
    borderWidth: 0.5,
    borderColor: colors.accentGlow,
    padding: spacing.md,
    marginBottom: spacing.lg,
    minHeight: sizing.touchableMinHeight,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
});
