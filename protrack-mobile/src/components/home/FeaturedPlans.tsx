import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, sizing, animation } from '../../theme/tokens';
import { Text } from '../core/Text';
import { strings } from '../../constants/strings';
import type { WorkoutPlan } from '../../services/api';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FeaturedPlansProps {
  plans: WorkoutPlan[];
  isLoading: boolean;
  onPressPlan: (plan: WorkoutPlan) => void;
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
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius: 8,
          backgroundColor: colors.surfaceHighlight,
        },
        style,
      ]}
    />
  );
};

const FeaturedCardSkeleton = () => (
  <View style={styles.card}>
    <PulseSkeleton width={48} height={48} />
    <View style={{ flex: 1, gap: 6, marginLeft: spacing.md }}>
      <PulseSkeleton width="70%" height={16} />
      <PulseSkeleton width="50%" height={12} />
    </View>
  </View>
);

const FeaturedCard = ({ plan, onPress }: { plan: WorkoutPlan; onPress: () => void }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const badgeColor = plan.badge === 'Popular' ? colors.accent : colors.badgeGreen;

  return (
    <AnimatedPressable
      style={[styles.card, animatedStyle]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onPressIn={() => {
        scale.value = withTiming(animation.pressScale, { duration: animation.duration.fast });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: animation.duration.normal });
      }}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="flash" size={24} color={colors.primary} />
      </View>

      <View style={styles.textWrap}>
        <Text variant="body" weight="semibold" numberOfLines={2}>
          {plan.name}
        </Text>
        <Text variant="caption" numberOfLines={1}>
          {plan.athlete_name} · {plan.exercise_count} {strings.featured.exercises}
        </Text>
      </View>

      {plan.badge && (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text variant="caption" weight="bold" color="#FFFFFF" style={{ fontSize: 11 }}>
            {plan.badge}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
};

export const FeaturedPlans = ({ plans, isLoading, onPressPlan }: FeaturedPlansProps) => {
  return (
    <View style={styles.section}>
      <Text variant="label" style={styles.sectionTitle}>
        {strings.featured.sectionTitle}
      </Text>

      {isLoading ? (
        <>
          <FeaturedCardSkeleton />
          <FeaturedCardSkeleton />
        </>
      ) : plans.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text variant="caption" color={colors.textMuted} align="center">
            Nenhum plano em destaque no momento.
          </Text>
        </View>
      ) : (
        plans.map((plan) => (
          <FeaturedCard key={plan.id} plan={plan} onPress={() => onPressPlan(plan)} />
        ))
      )}
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: sizing.cardRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: sizing.touchableMinHeight,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
    marginLeft: spacing.md,
    gap: 2,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: spacing.sm,
  },
  emptyCard: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: sizing.cardRadius,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
});
