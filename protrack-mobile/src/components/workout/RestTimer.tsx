import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useActiveWorkoutStore } from '../../stores/useActiveWorkoutStore';
import { colors, spacing } from '../../theme/tokens';
import { Card } from '../core/Card';
import { Text } from '../core/Text';
import { strings } from '../../constants/strings';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const RestTimer = () => {
  const { restTargetEndTime, restDuration, addRestTime, skipRest } = useActiveWorkoutStore();
  const [timeLeft, setTimeLeft] = useState(0);
  const pulseScale = useSharedValue(1);

  // Button scaling animations
  const scaleSkip = useSharedValue(1);
  const scaleAdd = useSharedValue(1);

  const skipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleSkip.value }],
  }));

  const addStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAdd.value }],
  }));

  const playBeep = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.warn('Erro ao acionar haptics', e);
    }
  };

  useEffect(() => {
    if (!restTargetEndTime) return;

    // Pulsing animation while timer is active
    pulseScale.value = withRepeat(
      withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    let interval: NodeJS.Timeout;

    const tick = () => {
      const now = Date.now();
      const remaining = Math.ceil((restTargetEndTime - now) / 1000);

      if (remaining <= 0) {
        setTimeLeft(0);
        skipRest();
        playBeep();
      } else {
        setTimeLeft(remaining);
      }
    };

    tick();
    interval = setInterval(tick, 1000);

    return () => {
      clearInterval(interval);
      pulseScale.value = 1;
    };
  }, [restTargetEndTime, skipRest, pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  if (!restTargetEndTime) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Progress percentage (using dynamic restDuration)
  const progress = Math.min(timeLeft / (restDuration || 60), 1);

  return (
    <Card style={styles.container} gradient={colors.gradients.restTimer} noPadding>
      <View style={styles.inner}>
        {/* Progress bar edge-to-edge */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <View style={styles.content}>
          <Animated.View style={[pulseStyle, styles.timerWrapper]}>
            <Text variant="hero" style={styles.timerText}>
              {timeString}
            </Text>
          </Animated.View>

          <Text variant="label" style={styles.label}>
            {strings.workout.restTimerLabel}
          </Text>

          <View style={styles.btnRow}>
            <AnimatedPressable
              style={[styles.skipBtn, skipStyle]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                skipRest();
              }}
              onPressIn={() => {
                scaleSkip.value = withTiming(0.96, { duration: 120 });
              }}
              onPressOut={() => {
                scaleSkip.value = withTiming(1, { duration: 200 });
              }}
            >
              <Text variant="body" weight="bold" style={styles.skipBtnText}>
                {strings.activeWorkout.skipRest}
              </Text>
            </AnimatedPressable>

            <AnimatedPressable
              style={[styles.addTimeBtn, addStyle]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                addRestTime(30);
              }}
              onPressIn={() => {
                scaleAdd.value = withTiming(0.96, { duration: 120 });
              }}
              onPressOut={() => {
                scaleAdd.value = withTiming(1, { duration: 200 });
              }}
            >
              <Text variant="body" weight="bold" style={styles.addTimeBtnText}>
                +30s
              </Text>
            </AnimatedPressable>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.md,
    right: spacing.md,
    borderColor: colors.primary,
    borderWidth: 1.5,
    borderRadius: 20,
    elevation: 10,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  inner: {
    width: '100%',
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: colors.surfaceHighlight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  content: {
    padding: spacing.md,
    alignItems: 'center',
  },
  timerWrapper: {
    marginVertical: spacing.xs,
  },
  timerText: {
    fontSize: 64,
    color: colors.primary,
    letterSpacing: -1,
    textAlign: 'center',
  },
  label: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    justifyContent: 'center',
  },
  skipBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipBtnText: {
    fontSize: 14,
    color: colors.text,
  },
  addTimeBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTimeBtnText: {
    fontSize: 14,
    color: colors.accent,
  },
});
