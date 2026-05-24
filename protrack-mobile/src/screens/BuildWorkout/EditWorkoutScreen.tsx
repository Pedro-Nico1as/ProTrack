import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  StatusBar,
  Modal,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, sizing } from '../../theme/tokens';
import { Text } from '../../components/core/Text';
import { Button } from '../../components/core/Button';
import { RootStackParamList } from '../../navigation/types';
import { fetchExercises, Exercise } from '../../services/api';
import { generateUUID } from '../../utils/uuid';
import {
  useCustomWorkoutsStore,
  CustomWorkoutPartition,
  CustomExercise,
} from '../../stores/useCustomWorkoutsStore';
import { strings } from '../../constants/strings';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditWorkout'>;
type EditWorkoutRouteProp = RouteProp<RootStackParamList, 'EditWorkout'>;

export const EditWorkoutScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditWorkoutRouteProp>();
  const { workoutId } = route.params;

  const { workouts, updateWorkout, removeWorkout } = useCustomWorkoutsStore();

  const [workoutName, setWorkoutName] = useState('');
  const [partitions, setPartitions] = useState<CustomWorkoutPartition[]>([]);

  const [selectingForPartition, setSelectingForPartition] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<Exercise[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const isSelecting = selectingForPartition !== null;

  useEffect(() => {
    const existingWorkout = workouts.find((w) => w.id === workoutId);
    if (existingWorkout && !isInitialized) {
      setWorkoutName(existingWorkout.name);

      // Load partitions (assuming store migration already guaranteed they exist)
      if (existingWorkout.partitions && existingWorkout.partitions.length > 0) {
        // Deep copy to prevent mutating store directly
        setPartitions(JSON.parse(JSON.stringify(existingWorkout.partitions)));
      } else {
        setPartitions([
          { id: generateUUID(), name: strings.buildWorkout.defaultPartitionName, exercises: [] },
        ]);
      }
      setIsInitialized(true);
    }
  }, [workoutId, workouts, isInitialized]);

  useEffect(() => {
    if (isSelecting && catalog.length === 0) {
      setLoadingCatalog(true);
      fetchExercises().then((data) => {
        setCatalog(data);
        setLoadingCatalog(false);
      });
    }
  }, [isSelecting, catalog.length]);

  const addPartition = () => {
    setPartitions([
      ...partitions,
      {
        id: generateUUID(),
        name: `${strings.buildWorkout.defaultPartitionName.replace(' A', '')} ${String.fromCharCode(65 + partitions.length)}`,
        exercises: [],
      },
    ]);
  };

  const removePartition = (id: string) => {
    Alert.alert(
      strings.buildWorkout.alertRemovePartitionTitle,
      strings.buildWorkout.alertRemovePartitionMsg,
      [
        { text: strings.buildWorkout.cancel, style: 'cancel' },
        {
          text: strings.buildWorkout.remove,
          style: 'destructive',
          onPress: () => {
            setPartitions((prev) => prev.filter((p) => p.id !== id));
          },
        },
      ]
    );
  };

  const updatePartitionName = (id: string, newName: string) => {
    setPartitions((prev) => prev.map((p) => (p.id === id ? { ...p, name: newName } : p)));
  };

  const addExercise = (exercise: Exercise) => {
    if (!selectingForPartition) return;

    const newEx: CustomExercise = {
      id: generateUUID(),
      exerciseId: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscle_group,
      youtubeId: exercise.youtube_video_id,
      targetSets: 3,
      targetReps: 10,
    };

    setPartitions((prev) =>
      prev.map((p) => {
        if (p.id === selectingForPartition) {
          return { ...p, exercises: [...p.exercises, newEx] };
        }
        return p;
      })
    );

    setSelectingForPartition(null);
  };

  const updateExercise = (
    partitionId: string,
    exId: string,
    field: 'targetSets' | 'targetReps',
    delta: number
  ) => {
    setPartitions((prev) =>
      prev.map((p) => {
        if (p.id === partitionId) {
          return {
            ...p,
            exercises: p.exercises.map((ex) => {
              if (ex.id === exId) {
                return { ...ex, [field]: Math.max(1, ex[field] + delta) };
              }
              return ex;
            }),
          };
        }
        return p;
      })
    );
  };

  const removeExercise = (partitionId: string, exId: string) => {
    setPartitions((prev) =>
      prev.map((p) => {
        if (p.id === partitionId) {
          return {
            ...p,
            exercises: p.exercises.filter((ex) => ex.id !== exId),
          };
        }
        return p;
      })
    );
  };

  const handleSaveWorkout = () => {
    const cleanPartitions = partitions.map((p) => ({
      ...p,
      name: p.name.trim() || strings.buildWorkout.noName,
    }));

    updateWorkout({
      id: workoutId,
      name: workoutName.trim() || strings.buildWorkout.defaultWorkoutName,
      partitions: cleanPartitions,
      createdAt: new Date().toISOString(),
    });

    navigation.goBack();
  };

  const handleDeleteWorkout = () => {
    Alert.alert(
      strings.editWorkout.alertDeleteWorkoutTitle,
      strings.editWorkout.alertDeleteWorkoutMsg,
      [
        { text: strings.buildWorkout.cancel, style: 'cancel' },
        {
          text: strings.editWorkout.delete,
          style: 'destructive',
          onPress: () => {
            removeWorkout(workoutId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!isInitialized) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="close" size={28} color={colors.text} />
          </Pressable>
          <Text variant="heading" weight="semibold">
            {strings.editWorkout.title}
          </Text>
          <Pressable onPress={handleDeleteWorkout} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="trash-outline" size={24} color={colors.error} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.nameContainer}>
            <Text
              variant="caption"
              color={colors.textSecondary}
              style={{ marginBottom: spacing.xs }}
            >
              {strings.buildWorkout.mainPlanName}
            </Text>
            <TextInput
              style={styles.nameInput}
              value={workoutName}
              onChangeText={setWorkoutName}
              placeholder={strings.editWorkout.placeholderEditName}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {partitions.map((partition, pIndex) => (
            <View key={partition.id} style={styles.partitionContainer}>
              <View style={styles.partitionHeader}>
                <TextInput
                  style={styles.partitionNameInput}
                  value={partition.name}
                  onChangeText={(text) => updatePartitionName(partition.id, text)}
                  placeholder={strings.buildWorkout.partitionNamePlaceholder}
                  placeholderTextColor={colors.textMuted}
                />
                <Pressable
                  onPress={() => removePartition(partition.id)}
                  hitSlop={12}
                  style={styles.iconBtn}
                >
                  <Ionicons name="trash-outline" size={22} color={colors.error} />
                </Pressable>
              </View>

              {partition.exercises.length === 0 ? (
                <View style={styles.emptyPartition}>
                  <Text variant="caption" color={colors.textSecondary}>
                    {strings.buildWorkout.emptyPartition}
                  </Text>
                </View>
              ) : (
                partition.exercises.map((item, index) => (
                  <View key={item.id} style={styles.exerciseCard}>
                    <View style={styles.exerciseHeader}>
                      <View style={{ flex: 1 }}>
                        <Text variant="body" weight="semibold">
                          {index + 1}. {item.name}
                        </Text>
                        <Text variant="caption" color={colors.primary}>
                          {item.muscleGroup}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => removeExercise(partition.id, item.id)}
                        hitSlop={12}
                        style={styles.removeBtn}
                      >
                        <Ionicons name="close" size={20} color={colors.textSecondary} />
                      </Pressable>
                    </View>

                    <View style={styles.controlsRow}>
                      <View style={styles.controlGroup}>
                        <Text variant="caption" color={colors.textSecondary}>
                          {strings.buildWorkout.series}
                        </Text>
                        <View style={styles.stepper}>
                          <Pressable
                            style={styles.stepperBtn}
                            onPress={() => updateExercise(partition.id, item.id, 'targetSets', -1)}
                            hitSlop={8}
                          >
                            <Ionicons name="remove" size={20} color={colors.text} />
                          </Pressable>
                          <Text variant="body" weight="bold" style={styles.stepperValue}>
                            {item.targetSets}
                          </Text>
                          <Pressable
                            style={styles.stepperBtn}
                            onPress={() => updateExercise(partition.id, item.id, 'targetSets', 1)}
                            hitSlop={8}
                          >
                            <Ionicons name="add" size={20} color={colors.text} />
                          </Pressable>
                        </View>
                      </View>

                      <View style={styles.controlGroup}>
                        <Text variant="caption" color={colors.textSecondary}>
                          {strings.buildWorkout.reps}
                        </Text>
                        <View style={styles.stepper}>
                          <Pressable
                            style={styles.stepperBtn}
                            onPress={() => updateExercise(partition.id, item.id, 'targetReps', -1)}
                            hitSlop={8}
                          >
                            <Ionicons name="remove" size={20} color={colors.text} />
                          </Pressable>
                          <Text variant="body" weight="bold" style={styles.stepperValue}>
                            {item.targetReps}
                          </Text>
                          <Pressable
                            style={styles.stepperBtn}
                            onPress={() => updateExercise(partition.id, item.id, 'targetReps', 1)}
                            hitSlop={8}
                          >
                            <Ionicons name="add" size={20} color={colors.text} />
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
              )}

              <Button
                title={strings.buildWorkout.addExercise}
                variant="outline"
                onPress={() => setSelectingForPartition(partition.id)}
                style={styles.addExBtn}
              />
            </View>
          ))}

          <Button
            title={strings.buildWorkout.addPartition}
            variant="outline"
            onPress={addPartition}
            style={styles.addPartitionBtn}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={strings.editWorkout.saveChangesBtn}
            variant="primary"
            disabled={partitions.length === 0}
            onPress={handleSaveWorkout}
          />
        </View>
      </SafeAreaView>

      <Modal visible={isSelecting} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text variant="heading" weight="semibold">
              {strings.buildWorkout.selectExerciseModal}
            </Text>
            <Pressable
              onPress={() => setSelectingForPartition(null)}
              hitSlop={12}
              style={styles.iconBtn}
            >
              <Ionicons name="close" size={28} color={colors.text} />
            </Pressable>
          </View>

          {loadingCatalog ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : (
            <FlatList
              data={catalog}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <Pressable style={styles.catalogItem} onPress={() => addExercise(item)}>
                  <View style={{ flex: 1 }}>
                    <Text variant="body" weight="semibold">
                      {item.name}
                    </Text>
                    <Text variant="caption" color={colors.primary}>
                      {item.muscle_group}
                    </Text>
                  </View>
                  <View style={styles.addExerciseIconBtn}>
                    <Ionicons name="add-circle" size={24} color={colors.accent} />
                  </View>
                </Pressable>
              )}
            />
          )}
        </View>
      </Modal>
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
    alignItems: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  nameContainer: {
    marginBottom: spacing.xl,
  },
  nameInput: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: sizing.cardRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    color: colors.text,
    fontSize: 16,
    padding: spacing.md,
    height: 52,
  },
  partitionContainer: {
    marginBottom: spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: sizing.cardRadius,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  partitionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  partitionNameInput: {
    flex: 1,
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    height: 44,
  },
  emptyPartition: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    opacity: 0.6,
  },
  exerciseCard: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: sizing.cardRadius,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  removeBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginTop: -8,
    marginRight: -8,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  controlGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: sizing.cardRadius,
    paddingHorizontal: spacing.sm,
    height: 44,
  },
  stepperBtn: {
    padding: spacing.xs,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    minWidth: 24,
    textAlign: 'center',
  },
  addExBtn: {
    marginTop: spacing.xs,
  },
  addPartitionBtn: {
    marginTop: spacing.md,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
  },
  catalogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  addExerciseIconBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
