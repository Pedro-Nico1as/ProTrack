import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, sizing } from '../../theme/tokens';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const SkeletonPulse = ({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: colors.surfaceHighlight },
        animatedStyle,
        style,
      ]}
    />
  );
};

/** Skeleton placeholder that mimics an ExerciseCard layout */
export const ExerciseCardSkeleton = () => {
  return (
    <View style={styles.card}>
      {/* Title */}
      <SkeletonPulse width="60%" height={24} style={{ marginBottom: spacing.xs }} />
      {/* Subtitle */}
      <SkeletonPulse width="30%" height={14} style={{ marginBottom: spacing.md }} />
      {/* Video placeholder */}
      <SkeletonPulse
        width="100%"
        height={180}
        borderRadius={sizing.videoRadius}
        style={{ marginBottom: spacing.md }}
      />
      {/* Table header */}
      <View style={styles.row}>
        <SkeletonPulse width="20%" height={12} />
        <SkeletonPulse width="20%" height={12} />
        <SkeletonPulse width="20%" height={12} />
        <SkeletonPulse width={48} height={12} />
      </View>
      {/* Set rows */}
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.setRow}>
          <SkeletonPulse width={24} height={24} borderRadius={4} />
          <SkeletonPulse width="30%" height={44} borderRadius={8} />
          <SkeletonPulse width="30%" height={44} borderRadius={8} />
          <SkeletonPulse width={44} height={44} borderRadius={8} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: sizing.cardRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
