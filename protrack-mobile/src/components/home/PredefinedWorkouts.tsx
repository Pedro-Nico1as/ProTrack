import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Pressable,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, sizing } from '../../theme/tokens';
import { Text } from '../core/Text';
import { Card } from '../core/Card';
import { Button } from '../core/Button';
import { strings } from '../../constants/strings';
import { predefinedWorkouts, PredefinedWorkout } from '../../constants/predefinedWorkouts';
import { fetchExercises, Exercise } from '../../services/api';
import { generateUUID } from '../../utils/uuid';
import {
  useCustomWorkoutsStore,
  CustomWorkout,
  CustomWorkoutPartition,
} from '../../stores/useCustomWorkoutsStore';

const { width: screenWidth } = Dimensions.get('window');

const getWorkoutMetaText = (id: string) => {
  switch (id) {
    case 'predef-full-body':
      return 'Corpo Inteiro';
    case 'predef-ppl':
      return 'Push / Pull / Legs';
    case 'predef-upper-lower':
      return 'Sup. / Inf.';
    case 'predef-abc':
      return '3 Dias';
    case 'predef-abcde':
      return '5 Dias';
    default:
      return '';
  }
};

export const PredefinedWorkouts = () => {
  const [selectedWorkout, setSelectedWorkout] = useState<PredefinedWorkout | null>(null);
  const [activePartitionIndex, setActivePartitionIndex] = useState(0);
  const [catalog, setCatalog] = useState<Exercise[]>([]);
  const addWorkout = useCustomWorkoutsStore((state) => state.addWorkout);

  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const cardWidth = screenWidth - spacing.md * 2;
  const snapInterval = cardWidth + spacing.md;

  useEffect(() => {
    // Prefetch exercises catalog to map IDs later
    fetchExercises()
      .then((data) => setCatalog(data))
      .catch(() => {});
  }, []);

  // Auto-scroll carousel effect
  useEffect(() => {
    if (predefinedWorkouts.length === 0) return;

    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % predefinedWorkouts.length;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * snapInterval,
        animated: true,
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [currentIndex, snapInterval]);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / snapInterval);
    if (index !== currentIndex && index >= 0 && index < predefinedWorkouts.length) {
      setCurrentIndex(index);
    }
  };

  const handleOpenPreview = (workout: PredefinedWorkout) => {
    setSelectedWorkout(workout);
    setActivePartitionIndex(0);
  };

  const handleClosePreview = () => {
    setSelectedWorkout(null);
  };

  const handleImportWorkout = () => {
    if (!selectedWorkout) return;

    try {
      const mappedPartitions: CustomWorkoutPartition[] = selectedWorkout.partitions.map((part) => {
        return {
          id: generateUUID(),
          name: part.name,
          exercises: part.exercises.map((ex) => {
            // Match against database catalog by name
            const matchedGlobal = catalog.find(
              (catEx) => catEx.name.toLowerCase() === ex.name.toLowerCase()
            );

            return {
              id: generateUUID(),
              exerciseId: matchedGlobal ? matchedGlobal.id : generateUUID(),
              name: ex.name,
              muscleGroup: matchedGlobal ? matchedGlobal.muscle_group : ex.muscleGroup,
              youtubeId: matchedGlobal ? matchedGlobal.youtube_video_id : '',
              targetSets: ex.targetSets,
              targetReps: ex.targetReps,
            };
          }),
        };
      });

      const newWorkout: CustomWorkout = {
        id: generateUUID(),
        name: selectedWorkout.name,
        partitions: mappedPartitions,
        createdAt: new Date().toISOString(),
      };

      addWorkout(newWorkout);

      Alert.alert(
        strings.common.loading,
        strings.predefinedWorkouts.successImportMsg.replace('{name}', selectedWorkout.name),
        [{ text: 'OK', onPress: handleClosePreview }]
      );
    } catch {
      Alert.alert(strings.common.error, strings.predefinedWorkouts.errorImportMsg);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="body" weight="semibold" color={colors.text} style={styles.sectionTitle}>
        {strings.predefinedWorkouts.sectionTitle}
      </Text>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={styles.scrollContent}
      >
        {predefinedWorkouts.map((workout) => (
          <Card
            key={workout.id}
            noPadding
            style={[styles.card, { width: cardWidth }]}
            onPress={() => handleOpenPreview(workout)}
          >
            <Image source={workout.image} style={styles.cardImage} resizeMode="cover" />
            <LinearGradient
              colors={[
                'transparent',
                'rgba(10, 10, 12, 0.3)',
                'rgba(10, 10, 12, 0.85)',
                'rgba(10, 10, 12, 0.98)',
              ]}
              style={styles.gradientOverlay}
            >
              <Text variant="heading" weight="bold" color={colors.text} style={styles.cardTitle}>
                {workout.name}
              </Text>
              <Text
                variant="caption"
                weight="bold"
                color={colors.primary}
                style={styles.cardSubTitle}
              >
                {workout.partitions.length === 1
                  ? '1 ficha'
                  : `${workout.partitions.length} fichas`}{' '}
                • {getWorkoutMetaText(workout.id)}
              </Text>
              <Text
                variant="caption"
                color={colors.textSecondary}
                numberOfLines={2}
                style={styles.cardDesc}
              >
                {workout.description}
              </Text>
            </LinearGradient>
          </Card>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        {predefinedWorkouts.map((_, index) => {
          const isActive = currentIndex === index;
          return <View key={index} style={[styles.dot, isActive && styles.activeDot]} />;
        })}
      </View>

      {/* Preview Modal */}
      {selectedWorkout && (
        <Modal
          visible={true}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleClosePreview}
        >
          <View style={styles.modalContainer}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.modalSafe}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text variant="heading" weight="semibold">
                  {strings.predefinedWorkouts.modalTitle}
                </Text>
                <Pressable onPress={handleClosePreview} hitSlop={12} style={styles.closeBtn}>
                  <Ionicons name="close" size={28} color={colors.text} />
                </Pressable>
              </View>

              {/* Scrollable Content */}
              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                {/* Hero Image */}
                <View style={styles.heroImageContainer}>
                  <Image
                    source={selectedWorkout.image}
                    style={styles.modalHeroImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(22, 22, 26, 0.95)']}
                    style={styles.modalHeroGradient}
                  />
                </View>

                {/* Workout Details */}
                <View style={styles.detailsContainer}>
                  <Text variant="heading" weight="bold" style={styles.modalWorkoutName}>
                    {selectedWorkout.name}
                  </Text>
                  <Text variant="body" color={colors.textSecondary} style={styles.description}>
                    {selectedWorkout.description}
                  </Text>

                  {/* Partition Tabs */}
                  {selectedWorkout.partitions.length > 1 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.tabsContainer}
                    >
                      {selectedWorkout.partitions.map((part, index) => {
                        const isActive = activePartitionIndex === index;
                        return (
                          <Pressable
                            key={index}
                            style={[styles.tabButton, isActive && styles.activeTabButton]}
                            onPress={() => setActivePartitionIndex(index)}
                          >
                            <Text
                              variant="caption"
                              weight="semibold"
                              color={isActive ? colors.primary : colors.textSecondary}
                            >
                              {part.name.replace('Treino ', '')}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  )}

                  {/* Exercises List */}
                  <View style={styles.exercisesList}>
                    {selectedWorkout.partitions[activePartitionIndex].exercises.map((ex, index) => (
                      <View key={index} style={styles.exerciseItem}>
                        <View style={styles.exerciseInfo}>
                          <Text variant="body" weight="semibold">
                            {ex.name}
                          </Text>
                          <Text variant="caption" color={colors.primary}>
                            {ex.muscleGroup}
                          </Text>
                        </View>
                        <View style={styles.exerciseSetsReps}>
                          <Text variant="body" weight="bold" color={colors.text}>
                            {ex.targetSets}
                          </Text>
                          <Text variant="caption" color={colors.textSecondary}>
                            {' '}
                            x{' '}
                          </Text>
                          <Text variant="body" weight="bold" color={colors.text}>
                            {ex.targetReps}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>

              {/* Action Button Footer */}
              <View style={styles.modalFooter}>
                <Button
                  title={strings.predefinedWorkouts.useSheetBtn}
                  variant="primary"
                  onPress={handleImportWorkout}
                />
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.xs,
    gap: spacing.md,
  },
  card: {
    height: 200,
    position: 'relative',
    backgroundColor: colors.surface,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '75%',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  cardTitle: {
    fontSize: typography.sizes.xl,
    marginBottom: spacing.xs,
  },
  cardSubTitle: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  cardDesc: {
    fontSize: typography.sizes.sm,
    lineHeight: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
  },
  activeDot: {
    width: 18,
    backgroundColor: colors.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  modalSafe: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  closeBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  modalScroll: {
    flex: 1,
  },
  heroImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  modalHeroImage: {
    width: '100%',
    height: '100%',
  },
  modalHeroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },
  detailsContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  modalWorkoutName: {
    fontSize: typography.sizes.xxl,
    marginBottom: spacing.xs,
  },
  description: {
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  tabsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  tabButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: sizing.cardRadius,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabButton: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  exercisesList: {
    gap: spacing.sm,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: sizing.cardRadius,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  exerciseInfo: {
    flex: 1,
    gap: 2,
  },
  exerciseSetsReps: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  modalFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
});
