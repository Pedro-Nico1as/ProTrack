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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, sizing } from '../../theme/tokens';
import { Text } from '../../components/core/Text';
import { Button } from '../../components/core/Button';
import { RootStackParamList } from '../../navigation/types';
import { fetchExercises, Exercise, createExercise } from '../../services/api';
import { generateUUID } from '../../utils/uuid';
import {
  useCustomWorkoutsStore,
  CustomWorkoutPartition,
  CustomExercise,
} from '../../stores/useCustomWorkoutsStore';
import { strings } from '../../constants/strings';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'BuildWorkout'>;

export const BuildWorkoutScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [workoutName, setWorkoutName] = useState(strings.buildWorkout.defaultWorkoutName);

  const [partitions, setPartitions] = useState<CustomWorkoutPartition[]>([
    { id: generateUUID(), name: strings.buildWorkout.defaultPartitionName, exercises: [] },
  ]);

  const [selectingForPartition, setSelectingForPartition] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<Exercise[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('');

  const addWorkout = useCustomWorkoutsStore((state) => state.addWorkout);
  const customExercises = useCustomWorkoutsStore((state) => state.customExercises || []);
  const addCustomExercise = useCustomWorkoutsStore((state) => state.addCustomExercise);
  const removeCustomExercise = useCustomWorkoutsStore((state) => state.removeCustomExercise);

  const isSelecting = selectingForPartition !== null;

  useEffect(() => {
    if (isSelecting && catalog.length === 0) {
      setLoadingCatalog(true);
      fetchExercises().then((data) => {
        const merged = [...(data || []), ...customExercises];
        setCatalog(merged);
        setLoadingCatalog(false);
      });
    }
  }, [isSelecting, catalog.length, customExercises]);

  useEffect(() => {
    if (!isSelecting) {
      setSearchQuery('');
      setSelectedMuscle(null);
    }
  }, [isSelecting]);

  const uniqueMuscles = React.useMemo(() => {
    const groups = catalog.map((ex) => ex.muscle_group);
    const set = Array.from(new Set(groups)).filter(Boolean);
    return set.length > 0
      ? set.sort((a, b) => a.localeCompare(b))
      : ['Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen'];
  }, [catalog]);

  const filteredCatalog = React.useMemo(() => {
    return catalog.filter((ex) => {
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMuscle = selectedMuscle
        ? ex.muscle_group.toLowerCase() === selectedMuscle.toLowerCase()
        : true;
      return matchesSearch && matchesMuscle;
    });
  }, [catalog, searchQuery, selectedMuscle]);

  const addPartition = () => {
    setPartitions([
      ...partitions,
      {
        id: generateUUID(),
        name: `${strings.buildWorkout.defaultPartitionName.replace(' A', '')} ${String.fromCharCode(65 + partitions.length)}`, // Treino B, C...
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
      restSeconds: 60,
      isCustom: exercise.isCustom || false,
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

  const handleCreateCustomExercise = async () => {
    if (!newExName.trim()) {
      Alert.alert('Erro', 'Por favor, insira o nome do exercício.');
      return;
    }
    if (!newExMuscle) {
      Alert.alert('Erro', 'Por favor, selecione o grupo muscular.');
      return;
    }
    const muscle = newExMuscle;

    let finalId = generateUUID();
    const name = newExName.trim();
    const youtubeId = '';

    try {
      const serverEx = await createExercise({
        name,
        muscle_group: muscle,
        youtube_video_id: youtubeId,
      });
      if (serverEx && serverEx.id) {
        finalId = serverEx.id;
      }
    } catch (err) {
      console.warn('Backend sync failed, using client UUID:', err);
    }

    const newExTemplate: Exercise = {
      id: finalId,
      name,
      muscle_group: muscle,
      youtube_video_id: youtubeId,
      equipment: [],
      isCustom: true,
    };

    addCustomExercise(newExTemplate);
    setCatalog((prev) => [...prev, newExTemplate]);
    addExercise(newExTemplate);

    setIsCreatingExercise(false);
    setNewExName('');
    setNewExMuscle('');
  };

  const handleDeleteCustomExercise = (id: string) => {
    Alert.alert(
      'Excluir Exercício',
      'Tem certeza de que deseja excluir este exercício personalizado da lista?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            removeCustomExercise(id);
            setCatalog((prev) => prev.filter((ex) => ex.id !== id));
          },
        },
      ]
    );
  };

  const updateExercise = (
    partitionId: string,
    exId: string,
    field: 'targetSets' | 'targetReps' | 'restSeconds',
    delta: number
  ) => {
    setPartitions((prev) =>
      prev.map((p) => {
        if (p.id === partitionId) {
          return {
            ...p,
            exercises: p.exercises.map((ex) => {
              if (ex.id === exId) {
                const current =
                  ex[field] !== undefined ? ex[field] : field === 'restSeconds' ? 60 : 1;
                const minVal = field === 'restSeconds' ? 15 : 1;
                return { ...ex, [field]: Math.max(minVal, current + delta) };
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

  const handleCreateWorkout = () => {
    // Only save partitions that have at least one exercise, or keep empty if user explicitly wants?
    // Let's keep them as user left them. But ensure names are not empty.
    const cleanPartitions = partitions.map((p) => ({
      ...p,
      name: p.name.trim() || strings.buildWorkout.noName,
    }));

    addWorkout({
      id: generateUUID(),
      name: workoutName.trim() || strings.buildWorkout.defaultWorkoutName,
      partitions: cleanPartitions,
      createdAt: new Date().toISOString(),
    });

    navigation.goBack();
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
            {strings.buildWorkout.title}
          </Text>
          <View style={{ width: 44 }} />
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
              placeholder={strings.buildWorkout.placeholderPlanName}
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

                    <View style={styles.restStepperRow}>
                      <Text variant="caption" color={colors.textSecondary}>
                        Tempo de Descanso
                      </Text>
                      <View style={styles.restStepper}>
                        <Pressable
                          style={styles.stepperBtn}
                          onPress={() => updateExercise(partition.id, item.id, 'restSeconds', -15)}
                          hitSlop={8}
                        >
                          <Ionicons name="remove" size={20} color={colors.text} />
                        </Pressable>
                        <Text variant="body" weight="bold" style={styles.stepperValue}>
                          {item.restSeconds || 60}s
                        </Text>
                        <Pressable
                          style={styles.stepperBtn}
                          onPress={() => updateExercise(partition.id, item.id, 'restSeconds', 15)}
                          hitSlop={8}
                        >
                          <Ionicons name="add" size={20} color={colors.text} />
                        </Pressable>
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
            title={strings.buildWorkout.savePlan}
            variant="primary"
            disabled={partitions.length === 0}
            onPress={handleCreateWorkout}
          />
        </View>
      </SafeAreaView>

      <Modal
        visible={isSelecting}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          if (isCreatingExercise) {
            setIsCreatingExercise(false);
          } else {
            setSelectingForPartition(null);
          }
        }}
      >
        {isCreatingExercise ? (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Pressable
                onPress={() => setIsCreatingExercise(false)}
                hitSlop={12}
                style={styles.iconBtn}
              >
                <Ionicons name="chevron-back" size={28} color={colors.text} />
              </Pressable>
              <Text variant="heading" weight="semibold">
                Novo Exercício
              </Text>
              <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.createFormScroll}>
              <View style={styles.formGroup}>
                <Text variant="caption" color={colors.textSecondary} style={styles.formLabel}>
                  Nome do Exercício *
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={newExName}
                  onChangeText={setNewExName}
                  placeholder="Ex: Supino Inclinado Articulado"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.formGroup}>
                <Text variant="caption" color={colors.textSecondary} style={styles.formLabel}>
                  Grupo Muscular *
                </Text>
                <View style={styles.formMuscleChips}>
                  {uniqueMuscles.map((muscle) => (
                    <Pressable
                      key={muscle}
                      onPress={() => setNewExMuscle(muscle)}
                      style={[
                        styles.formMuscleChip,
                        newExMuscle.toLowerCase() === muscle.toLowerCase() &&
                          styles.formMuscleChipActive,
                      ]}
                    >
                      <Text
                        variant="caption"
                        color={
                          newExMuscle.toLowerCase() === muscle.toLowerCase()
                            ? colors.text
                            : colors.textSecondary
                        }
                      >
                        {muscle}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Button
                title="Adicionar"
                variant="primary"
                onPress={handleCreateCustomExercise}
                style={styles.createSubmitBtn}
              />
            </ScrollView>
          </View>
        ) : (
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

            {!loadingCatalog && (
              <>
                <View style={styles.searchContainer}>
                  <View style={styles.searchBar}>
                    <Ionicons
                      name="search"
                      size={20}
                      color={colors.textMuted}
                      style={styles.searchIcon}
                    />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Buscar exercício..."
                      placeholderTextColor={colors.textMuted}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                      <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                        <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                      </Pressable>
                    )}
                  </View>
                </View>

                <View style={styles.filterWrapper}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                  >
                    <Pressable
                      onPress={() => setSelectedMuscle(null)}
                      style={[
                        styles.filterChip,
                        selectedMuscle === null && styles.filterChipActive,
                      ]}
                    >
                      <Text
                        variant="caption"
                        weight="medium"
                        color={selectedMuscle === null ? colors.text : colors.textSecondary}
                      >
                        Todos
                      </Text>
                    </Pressable>
                    {uniqueMuscles.map((muscle) => {
                      const isActive = selectedMuscle?.toLowerCase() === muscle.toLowerCase();
                      return (
                        <Pressable
                          key={muscle}
                          onPress={() => setSelectedMuscle(isActive ? null : muscle)}
                          style={[styles.filterChip, isActive && styles.filterChipActive]}
                        >
                          <Text
                            variant="caption"
                            weight="medium"
                            color={isActive ? colors.text : colors.textSecondary}
                          >
                            {muscle}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              </>
            )}

            {loadingCatalog ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.primary} size="large" />
              </View>
            ) : (
              <FlatList
                data={filteredCatalog}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                  <Pressable
                    style={styles.createExerciseListItem}
                    onPress={() => {
                      setNewExName(searchQuery);
                      setIsCreatingExercise(true);
                    }}
                  >
                    <View style={styles.createExerciseListLeft}>
                      <View style={styles.createExerciseIconCircle}>
                        <Ionicons name="add" size={24} color={colors.primary} />
                      </View>
                      <View>
                        <Text variant="body" weight="semibold" color={colors.primary}>
                          Adicionar Exercício
                        </Text>
                        <Text variant="caption" color={colors.textMuted}>
                          Crie um exercício novo que não está na lista
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  </Pressable>
                }
                ListEmptyComponent={
                  <View style={styles.emptyStateContainer}>
                    <Ionicons name="search-outline" size={48} color={colors.textMuted} />
                    <Text
                      variant="body"
                      color={colors.textSecondary}
                      style={{ marginTop: spacing.sm }}
                    >
                      Nenhum exercício encontrado
                    </Text>
                    <Button
                      title={`Criar "${searchQuery}"`}
                      variant="outline"
                      onPress={() => {
                        setNewExName(searchQuery);
                        setIsCreatingExercise(true);
                      }}
                      style={{ marginTop: spacing.md, paddingHorizontal: spacing.md }}
                    />
                  </View>
                }
                renderItem={({ item }) => {
                  const isCustom = customExercises.some((ex) => ex.id === item.id);
                  return (
                    <View style={styles.catalogItemRow}>
                      <Pressable
                        style={styles.catalogItemContent}
                        onPress={() => addExercise(item)}
                      >
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
                      {isCustom && (
                        <Pressable
                          style={styles.deleteExBtn}
                          onPress={() => handleDeleteCustomExercise(item.id)}
                          hitSlop={8}
                        >
                          <Ionicons name="trash-outline" size={22} color={colors.error} />
                        </Pressable>
                      )}
                    </View>
                  );
                }}
              />
            )}
          </View>
        )}
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
    alignItems: 'flex-start',
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
  restStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  restStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: sizing.cardRadius,
    paddingHorizontal: spacing.sm,
    height: 44,
    width: 140,
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
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
  catalogItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  catalogItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  deleteExBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addExerciseIconBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: sizing.cardRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    height: '100%',
    paddingVertical: 0,
  },
  filterWrapper: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  createExerciseListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: 'rgba(228, 50, 50, 0.04)',
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  createExerciseListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  createExerciseIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(228, 50, 50, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createFormScroll: {
    padding: spacing.md,
    gap: spacing.md,
  },
  formGroup: {
    gap: spacing.xs,
  },
  formLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  formInput: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: sizing.cardRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    color: colors.text,
    fontSize: 16,
    padding: spacing.md,
    height: 52,
  },
  formMuscleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  formMuscleChip: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  formMuscleChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  createSubmitBtn: {
    marginTop: spacing.md,
  },
});
