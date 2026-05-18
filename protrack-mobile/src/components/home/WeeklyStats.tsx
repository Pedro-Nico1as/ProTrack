import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, sizing } from '../../theme/tokens';
import { Text } from '../core/Text';
import { strings } from '../../constants/strings';

interface WeeklyStatsProps {
  totalWorkouts: number;
  monthWorkouts: number;
  weekWorkouts: number;
  isLoading: boolean;
}

const PulseSkeleton = ({ width, height }: { width: number | string; height: number }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        { width: width as number, height, borderRadius: 8, backgroundColor: colors.surfaceHighlight },
        style,
      ]}
    />
  );
};

export const WeeklyStats = ({ totalWorkouts, monthWorkouts, weekWorkouts, isLoading }: WeeklyStatsProps) => {
  const stats = [
    { value: String(totalWorkouts), label: strings.weeklyStats.total },
    { value: String(monthWorkouts), label: strings.weeklyStats.month },
    { value: String(weekWorkouts), label: strings.weeklyStats.week },
  ];

  return (
    <View style={styles.section}>
      <Text variant="label" style={styles.sectionTitle}>
        {strings.weeklyStats.sectionTitle}
      </Text>
      <View style={styles.row}>
        {stats.map((stat, i) => (
          <View key={i} style={styles.card}>
            {isLoading ? (
              <PulseSkeleton width={50} height={28} />
            ) : (
              <Text variant="subheading" weight="bold">{stat.value}</Text>
            )}
            <Text variant="caption" color={colors.textMuted}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: sizing.cardRadius,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
});
