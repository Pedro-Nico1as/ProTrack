import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useActiveWorkoutStore } from '../../stores/useActiveWorkoutStore';
import { colors, spacing, sizing } from '../../theme/tokens';
import { Card } from '../core/Card';
import { Text } from '../core/Text';
import { Button } from '../core/Button';
import { strings } from '../../constants/strings';

export const RestTimer = () => {
  const { restTargetEndTime, skipRest } = useActiveWorkoutStore();
  const [timeLeft, setTimeLeft] = useState(0);
  const pulseScale = useSharedValue(1);

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
  }, [restTargetEndTime]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const playBeep = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.warn('Erro ao acionar haptics', e);
    }
  };

  if (!restTargetEndTime) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Progress percentage (assuming 60s rest)
  const progress = Math.min(timeLeft / 60, 1);

  return (
    <Card style={styles.container} gradient={colors.gradients.restTimer}>
      <View style={styles.inner}>
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <Animated.View style={pulseStyle}>
          <Text style={styles.timerText}>{timeString}</Text>
        </Animated.View>

        <Text variant="label" style={styles.label}>{strings.workout.restTimerLabel}</Text>

        <Button
          title={strings.activeWorkout.skipRest}
          onPress={skipRest}
          variant="outline"
          style={styles.skipBtn}
        />
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
    borderWidth: 1,
    elevation: 10,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  inner: {
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  timerText: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -2,
  },
  label: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  skipBtn: {
    minWidth: 140,
  },
});
