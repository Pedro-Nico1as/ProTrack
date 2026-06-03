import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Pressable, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, sizing } from '../../theme/tokens';
import { Text } from '../../components/core/Text';
import { Button } from '../../components/core/Button';
import { RootStackParamList } from '../../navigation/types';
import { useCustomWorkoutsStore } from '../../stores/useCustomWorkoutsStore';
import { useActiveWorkoutStore } from '../../stores/useActiveWorkoutStore';
import { strings } from '../../constants/strings';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChooseWorkout'>;

export const ChooseWorkoutScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { workouts } = useCustomWorkoutsStore();
  const { startWorkout } = useActiveWorkoutStore();

  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [selectedPartitionId, setSelectedPartitionId] = useState<string | null>(null);

  const handleSelectWorkout = (id: string) => {
    if (selectedWorkoutId === id) {
      setSelectedWorkoutId(null);
      setSelectedPartitionId(null);
    } else {
      setSelectedWorkoutId(id);
      setSelectedPartitionId(null);
    }
  };

  const handleStartWorkout = () => {
    if (!selectedWorkoutId || !selectedPartitionId) return;

    const workout = workouts.find((w) => w.id === selectedWorkoutId);
    if (!workout) return;

    const partition = workout.partitions.find((p) => p.id === selectedPartitionId);
    if (!partition) return;

    const activeExercises = partition.exercises.map((ex) => ({
      id: ex.id,
      exerciseId: ex.exerciseId || ex.id, // Fallback if old workout doesn't have it
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      youtubeId: ex.youtubeId,
      targetSets: ex.targetSets,
      targetReps: ex.targetReps,
      restSeconds: ex.restSeconds || 60,
      loggedSets: [],
      isCustom: ex.isCustom || false,
    }));

    startWorkout(`${workout.name} - ${partition.name}`, activeExercises, null);
    navigation.replace('ActiveWorkout');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="close" size={28} color={colors.text} />
          </Pressable>
          <Text variant="heading" weight="semibold">
            {strings.chooseWorkout.title}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Pressable
            style={styles.buildNewCard}
            onPress={() => navigation.navigate('BuildWorkout')}
          >
            <View style={styles.buildIconContainer}>
              <Ionicons name="add" size={28} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="body" weight="semibold">
                {strings.chooseWorkout.buildNewWorkout}
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                {strings.chooseWorkout.buildNewWorkoutSub}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>

          <View style={styles.divider} />

          <Text variant="label" style={styles.sectionTitle}>
            {strings.chooseWorkout.chooseSavedWorkout}
          </Text>

          {workouts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={48} color={colors.borderSubtle} />
              <Text
                variant="body"
                color={colors.textSecondary}
                align="center"
                style={{ marginTop: spacing.md }}
              >
                {strings.chooseWorkout.emptySavedWorkouts}
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {workouts.map((workout) => {
                const isSelected = selectedWorkoutId === workout.id;

                return (
                  <View key={workout.id} style={styles.workoutContainer}>
                    <Pressable
                      style={[styles.workoutCard, isSelected && styles.workoutCardSelected]}
                      onPress={() => handleSelectWorkout(workout.id)}
                    >
                      <View style={styles.iconContainer}>
                        <Ionicons name="flash" size={20} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="body" weight="semibold">
                          {workout.name}
                        </Text>
                        <Text variant="caption" color={colors.textMuted}>
                          {workout.partitions?.length || 0}{' '}
                          {workout.partitions?.length === 1
                            ? strings.myWorkouts.sheetSingular
                            : strings.myWorkouts.sheetPlural}
                        </Text>
                      </View>
                      <Ionicons
                        name={isSelected ? 'chevron-down' : 'chevron-forward'}
                        size={20}
                        color={isSelected ? colors.primary : colors.textMuted}
                      />
                    </Pressable>

                    {isSelected && workout.partitions && workout.partitions.length > 0 && (
                      <View style={styles.partitionsList}>
                        <Text
                          variant="caption"
                          color={colors.textSecondary}
                          style={{ marginBottom: spacing.sm, paddingHorizontal: spacing.xs }}
                        >
                          {strings.chooseWorkout.selectPartitionHeader}
                        </Text>
                        {workout.partitions.map((part) => {
                          const isPartSelected = selectedPartitionId === part.id;
                          return (
                            <Pressable
                              key={part.id}
                              style={[
                                styles.partitionItem,
                                isPartSelected && styles.partitionItemSelected,
                              ]}
                              onPress={() => setSelectedPartitionId(part.id)}
                            >
                              <View style={styles.partitionIcon}>
                                <Ionicons
                                  name={isPartSelected ? 'radio-button-on' : 'radio-button-off'}
                                  size={20}
                                  color={isPartSelected ? colors.accent : colors.borderSubtle}
                                />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text
                                  variant="body"
                                  weight={isPartSelected ? 'bold' : 'regular'}
                                  color={isPartSelected ? colors.text : colors.textSecondary}
                                >
                                  {part.name}
                                </Text>
                              </View>
                              <Text variant="caption" color={colors.textMuted}>
                                {part.exercises.length} {strings.chooseWorkout.exerciseShort}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={strings.chooseWorkout.startWorkoutBtn}
            variant="primary"
            disabled={!selectedPartitionId}
            onPress={handleStartWorkout}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  buildNewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: sizing.cardRadius,
    borderWidth: 1,
    borderColor: colors.accent,
    marginBottom: spacing.lg,
  },
  buildIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  emptyState: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  list: {
    gap: spacing.md,
  },
  workoutContainer: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: sizing.cardRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    minHeight: 64,
  },
  workoutCardSelected: {
    backgroundColor: 'rgba(0, 179, 126, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 179, 126, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  partitionsList: {
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  partitionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: sizing.cardRadius,
    marginBottom: spacing.xs,
    minHeight: 48,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  partitionItemSelected: {
    backgroundColor: 'rgba(83, 74, 183, 0.1)',
    borderColor: 'rgba(83, 74, 183, 0.3)',
  },
  partitionIcon: {
    marginRight: spacing.sm,
    width: 24,
    alignItems: 'center',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
});
