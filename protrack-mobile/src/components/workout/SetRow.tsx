import React, { useState, useEffect } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, sizing, spacing, typography, animation } from '../../theme/tokens';
import { Text } from '../core/Text';
import { strings } from '../../constants/strings';
import { fetchLastSetWeight } from '../../services/api';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  setNumber: number;
  targetReps: number;
  isCompleted: boolean;
  exerciseId: string;
  prefilledWeight?: string;
  onComplete: (weight: number, reps: number) => void;
}

export const SetRow = ({
  setNumber,
  targetReps,
  isCompleted,
  exerciseId,
  prefilledWeight,
  onComplete,
}: Props) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState(targetReps.toString());
  const [increment, setIncrement] = useState<5 | 10>(5);
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(1);

  const animatedCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  // Rule 1: Set 1 loads the last completed weight of this exercise from database
  useEffect(() => {
    if (setNumber === 1 && !isCompleted && !weight) {
      fetchLastSetWeight(exerciseId).then((lastWeight) => {
        if (lastWeight !== null) {
          setWeight(lastWeight.toString());
        }
      });
    }
  }, [exerciseId, setNumber, isCompleted]);

  // Rule 2: Prefill sets > 1 with the completed load of the previous set
  useEffect(() => {
    if (prefilledWeight && !weight && !isCompleted) {
      setWeight(prefilledWeight);
    }
  }, [prefilledWeight, isCompleted]);

  const handleIncrementWeight = () => {
    const current = parseFloat(weight) || 0;
    const next = current + increment;
    setWeight(next.toString());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDecrementWeight = () => {
    const current = parseFloat(weight) || 0;
    const next = Math.max(0, current - increment);
    setWeight(next.toString());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleToggleIncrement = () => {
    const nextIncrement = increment === 5 ? 10 : 5;
    setIncrement(nextIncrement);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleComplete = () => {
    if (!weight) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Bounce animation on checkmark
    checkScale.value = withSequence(
      withTiming(1.3, { duration: 100 }),
      withTiming(1, { duration: 150 })
    );
    onComplete(parseFloat(weight), parseInt(reps, 10));
  };

  return (
    <View style={[styles.container, isCompleted && styles.completedContainer]}>
      <View style={styles.setNumberWrap}>
        <Text
          variant="body"
          weight="bold"
          color={isCompleted ? colors.primary : colors.textSecondary}
        >
          {setNumber}
        </Text>
      </View>

      <View style={[styles.inputGroup, { flex: 1.35 }]}>
        <View style={[styles.weightInputContainer, isCompleted && styles.inputCompleted]}>
          {!isCompleted && (
            <Pressable
              style={styles.incrementBtn}
              onPress={handleDecrementWeight}
              onLongPress={handleToggleIncrement}
              delayLongPress={350}
              hitSlop={4}
            >
              <Text
                variant="caption"
                weight="bold"
                color={colors.textSecondary}
                style={styles.incrementText}
              >
                -{increment}
              </Text>
            </Pressable>
          )}
          <TextInput
            style={styles.weightInput}
            keyboardType="decimal-pad"
            value={weight}
            onChangeText={setWeight}
            placeholder={strings.workout.kgPlaceholder}
            placeholderTextColor={colors.textMuted}
            editable={!isCompleted}
          />
          {!isCompleted && (
            <Pressable
              style={styles.incrementBtnRight}
              onPress={handleIncrementWeight}
              onLongPress={handleToggleIncrement}
              delayLongPress={350}
              hitSlop={4}
            >
              <Text
                variant="caption"
                weight="bold"
                color={colors.accent}
                style={styles.incrementText}
              >
                +{increment}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.input, isCompleted && styles.inputCompleted]}
          keyboardType="number-pad"
          value={reps}
          onChangeText={setReps}
          editable={!isCompleted}
        />
      </View>

      <AnimatedPressable
        style={[
          styles.button,
          isCompleted ? styles.buttonCompleted : styles.buttonPending,
          animatedCheckStyle,
        ]}
        onPress={handleComplete}
        disabled={isCompleted}
      >
        <Ionicons
          name={isCompleted ? 'checkmark-circle' : 'checkmark'}
          size={24}
          color={isCompleted ? colors.primary : colors.textSecondary}
        />
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  completedContainer: {
    opacity: 0.75,
  },
  setNumberWrap: {
    width: 30,
    alignItems: 'center',
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    height: sizing.touchableMinHeight,
    overflow: 'hidden',
  },
  weightInput: {
    flex: 1,
    color: colors.text,
    height: '100%',
    textAlign: 'center',
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
  },
  incrementBtn: {
    paddingHorizontal: spacing.xs + 2,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    borderRightWidth: 1,
    borderRightColor: colors.borderSubtle,
  },
  incrementBtnRight: {
    paddingHorizontal: spacing.xs + 2,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    borderLeftWidth: 1,
    borderLeftColor: colors.borderSubtle,
  },
  incrementText: {
    fontSize: 12,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    color: colors.text,
    height: sizing.touchableMinHeight,
    borderRadius: spacing.sm,
    textAlign: 'center',
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  inputCompleted: {
    borderColor: colors.primaryGlow,
    backgroundColor: colors.surface,
  },
  button: {
    width: sizing.touchableMinHeight,
    height: sizing.touchableMinHeight,
    borderRadius: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPending: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  buttonCompleted: {
    backgroundColor: colors.primaryGlow,
    borderWidth: 1,
    borderColor: colors.primary,
  },
});
