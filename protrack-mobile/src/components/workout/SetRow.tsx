import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, sizing, spacing, typography, animation } from '../../theme/tokens';
import { Text } from '../core/Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  setNumber: number;
  targetReps: number;
  isCompleted: boolean;
  onComplete: (weight: number, reps: number) => void;
}

export const SetRow = ({ setNumber, targetReps, isCompleted, onComplete }: Props) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState(targetReps.toString());
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(1);

  const animatedCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

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
        <Text variant="body" weight="bold" color={isCompleted ? colors.primary : colors.textSecondary}>
          {setNumber}
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.input, isCompleted && styles.inputCompleted]}
          keyboardType="decimal-pad"
          value={weight}
          onChangeText={setWeight}
          placeholder="kg"
          placeholderTextColor={colors.textMuted}
          editable={!isCompleted}
        />
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
        style={[styles.button, isCompleted ? styles.buttonCompleted : styles.buttonPending, animatedCheckStyle]}
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
