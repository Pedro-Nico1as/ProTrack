import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, sizing } from '../../theme/tokens';
import { FloatingYouTubePlayer } from './FloatingYouTubePlayer';
import { SetRow } from './SetRow';
import { ActiveExercise, LoggedSet } from '../../stores/useActiveWorkoutStore';
import { Card } from '../core/Card';
import { Text } from '../core/Text';
import { strings } from '../../constants/strings';

interface Props {
  exercise: ActiveExercise;
  onLogSet: (set: LoggedSet) => void;
}

export const ExerciseCard = ({ exercise, onLogSet }: Props) => {
  return (
    <Card gradient={colors.gradients.card} style={styles.container}>
      {/* Header section with accent glow bar */}
      <View style={styles.headerRow}>
        <View style={styles.accentBar} />
        <View style={{ flex: 1 }}>
          <Text variant="subheading">{exercise.name}</Text>
          <Text variant="label" style={styles.muscle}>
            {exercise.muscleGroup}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text variant="caption" weight="bold" color={colors.primary}>
            {exercise.targetSets}×{exercise.targetReps}
          </Text>
        </View>
      </View>

      {exercise.youtubeId && <FloatingYouTubePlayer videoId={exercise.youtubeId} />}

      {/* Sets table */}
      <View style={styles.setsSection}>
        <View style={styles.setsHeader}>
          <View style={styles.headerSetNum}>
            <Text variant="label">#</Text>
          </View>
          <View style={styles.headerFlex}>
            <Text variant="label" align="center">
              {strings.workout.weightHeader}
            </Text>
          </View>
          <View style={styles.headerFlex}>
            <Text variant="label" align="center">
              {strings.workout.repsHeader}
            </Text>
          </View>
          <View style={styles.headerBtn} />
        </View>

        {Array.from({ length: exercise.targetSets }).map((_, idx) => {
          const setNumber = idx + 1;
          const logged = exercise.loggedSets.find((s) => s.setNumber === setNumber);

          // Find the previous completed set to copy its weight (Rule 2)
          let prefilledWeight: string | undefined;
          if (setNumber > 1 && !logged) {
            const prevLogged = exercise.loggedSets.find((s) => s.setNumber === setNumber - 1);
            if (prevLogged) {
              prefilledWeight = prevLogged.weight.toString();
            }
          }

          return (
            <SetRow
              key={setNumber}
              setNumber={setNumber}
              targetReps={exercise.targetReps}
              exerciseId={exercise.exerciseId || exercise.id}
              prefilledWeight={prefilledWeight}
              isCompleted={!!logged}
              onComplete={(weight, reps) =>
                onLogSet({
                  id: Date.now().toString(),
                  setNumber,
                  weight,
                  reps,
                  completedAt: new Date().toISOString(),
                })
              }
            />
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  accentBar: {
    width: 3,
    height: 36,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  muscle: {
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.primaryGlow,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
  },
  setsSection: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  headerSetNum: {
    width: 30,
    alignItems: 'center',
  },
  headerFlex: {
    flex: 1,
    marginHorizontal: 4,
  },
  headerBtn: {
    width: 44,
  },
});
