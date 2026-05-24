import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, sizing, animation } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';
import { useActiveWorkoutStore } from '../../stores/useActiveWorkoutStore';
import { ExerciseCard } from '../../components/workout/ExerciseCard';
import { RestTimer } from '../../components/workout/RestTimer';
import { ExerciseCardSkeleton } from '../../components/core/Skeleton';
import { generateUUID } from '../../utils/uuid';
import { api } from '../../services/api';
import { Text } from '../../components/core/Text';
import { Button } from '../../components/core/Button';
import { strings } from '../../constants/strings';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ActiveWorkout'>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ActiveWorkoutScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'ActiveWorkout'>>();
  const routeParams = route.params;

  const isFinishingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // Rastreia o momento REAL em que o treino começou
  const workoutStartedAtRef = useRef<string>(new Date().toISOString());

  const {
    isActive, exercises, currentExerciseIndex, workoutName, sessionId,
    startWorkout, finishWorkout, nextExercise, prevExercise,
    logSet, startRest
  } = useActiveWorkoutStore();

  // Inicialização: usa treino já ativo no store ou inicia demo
  useEffect(() => {
    if (!isActive) {
      // Registra o timestamp REAL de início
      workoutStartedAtRef.current = new Date().toISOString();

      const sessionName = routeParams?.workoutName || strings.activeWorkout.defaultSessionName;
      const sessionExercises = routeParams?.exercises || [
        {
          id: 'ex-1',
          name: strings.activeWorkout.defaultEx1Name,
          muscleGroup: strings.activeWorkout.defaultMuscleName,
          youtubeId: 'M7lc1UVf-VE',
          targetSets: 4,
          targetReps: 10,
          loggedSets: []
        },
        {
          id: 'ex-2',
          name: strings.activeWorkout.defaultEx2Name,
          muscleGroup: strings.activeWorkout.defaultMuscleName,
          youtubeId: 'jNQXAC9IVRw',
          targetSets: 3,
          targetReps: 12,
          loggedSets: []
        }
      ];
      const templateSessionId = routeParams?.sessionId || null;

      setTimeout(() => {
        startWorkout(sessionName, sessionExercises, templateSessionId);
        setIsLoading(false);
      }, 600);
    } else {
      setIsLoading(false);
    }
  }, [isActive, routeParams]);

  // PROTEÇÃO CONTRA SAÍDA ACIDENTAL
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isActive || isFinishingRef.current) return;
      e.preventDefault();
      Alert.alert(
        strings.activeWorkout.alertCancelTitle,
        strings.activeWorkout.alertCancelMsg,
        [
          { text: strings.activeWorkout.alertCancelNo, style: 'cancel', onPress: () => {} },
          { text: strings.activeWorkout.alertCancelYes, style: 'destructive', onPress: () => {
              finishWorkout();
              navigation.dispatch(e.data.action);
            }
          },
        ]
      );
    });
    return unsubscribe;
  }, [navigation, isActive]);

  const handleFinishWorkout = async () => {
    setIsSaving(true);

    const now = new Date();
    const startedAt = workoutStartedAtRef.current;
    const startedDate = new Date(startedAt);

    // Cálculo REAL da duração em segundos
    const durationSeconds = Math.round((now.getTime() - startedDate.getTime()) / 1000);

    const logId = generateUUID();
    // IMPORTANTE: Se o treino for avulso/livre, enviamos null. Gerar UUID falso aqui quebra a restrição de FK no banco!
    const workoutSessionId = sessionId || null;

    // Cálculo REAL do volume total (soma de peso × reps de cada série)
    let totalVolumeKg = 0;
    const allSets: any[] = [];
    exercises.forEach(ex => {
      ex.loggedSets.forEach(set => {
        totalVolumeKg += set.weight * set.reps;
        allSets.push({
          client_id: generateUUID(),
          log_client_id: logId,
          session_exercise_id: sessionId ? ex.id : null,
          exercise_id: ex.exerciseId || ex.id,
          set_number: set.setNumber,
          weight_kg: set.weight,
          reps_done: set.reps,
          completed_at: set.completedAt,
        });
      });
    });

    try {
      await api.post('/sync-workout', {
        logs: [{
          client_id: logId,
          session_id: workoutSessionId,
          started_at: startedAt,
          completed_at: now.toISOString(),
          duration_seconds: durationSeconds,
          total_volume_kg: totalVolumeKg,
          total_sets: allSets.length,
        }],
        sets: allSets
      });

      isFinishingRef.current = true;
      finishWorkout();
      navigation.goBack();
    } catch (error) {
      setIsSaving(false);
      Alert.alert(strings.activeWorkout.alertErrorTitle, strings.activeWorkout.alertErrorMsg);
    }
  };

  const handleLogSet = (set: any) => {
    logSet(currentExerciseIndex, set);
    startRest(60);
  };

  if (isLoading || !isActive || exercises.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
              <Ionicons name="close" size={28} color={colors.text} />
            </Pressable>
            <Text variant="body" weight="semibold">{strings.activeWorkout.loading}</Text>
            <View style={{ width: 28 }} />
          </View>
          <ScrollView contentContainerStyle={styles.scroll}>
            <ExerciseCardSkeleton />
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === exercises.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Premium header */}
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
              <Ionicons name="close" size={28} color={colors.text} />
            </Pressable>
            <View style={styles.headerCenter}>
              <Text variant="body" weight="semibold" align="center">{workoutName}</Text>
              <View style={styles.progressDots}>
                {exercises.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === currentExerciseIndex && styles.dotActive,
                      i < currentExerciseIndex && styles.dotCompleted,
                    ]}
                  />
                ))}
              </View>
            </View>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scroll}>
            <Animated.View entering={FadeIn.duration(300)} key={`ex-${currentExerciseIndex}`}>
              <ExerciseCard
                exercise={currentExercise}
                onLogSet={handleLogSet}
              />
            </Animated.View>
          </ScrollView>

          {/* BUG-011 FIX: Controles fixos fora do ScrollView */}
          <View style={styles.controlsFooter}>
            <AnimatedPressable
              style={[styles.navBtn, currentExerciseIndex === 0 && styles.disabledBtn]}
              onPress={prevExercise}
              disabled={currentExerciseIndex === 0}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </AnimatedPressable>

            {isLastExercise ? (
              <Button
                title={strings.activeWorkout.finishBtn}
                onPress={handleFinishWorkout}
                loading={isSaving}
                variant="primary"
                style={{ flex: 1, marginLeft: spacing.md }}
              />
            ) : (
              <Button
                title={strings.activeWorkout.nextExercise}
                onPress={nextExercise}
                variant="primary"
                style={{ flex: 1, marginLeft: spacing.md }}
              />
            )}
          </View>

          <RestTimer />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  headerCenter: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  backBtn: {
    padding: spacing.xs,
  },
  progressDots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceHighlight,
  },
  dotActive: {
    // Usa accent (roxo) — cor de navegação/progresso do app
    backgroundColor: colors.accent,
    width: 20,
  },
  dotCompleted: {
    backgroundColor: colors.accentLight,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.md,
  },
  controlsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.background,
  },
  navBtn: {
    // Usa accent (roxo) para consistência com a paleta de navegação do app
    backgroundColor: colors.accentGlow,
    width: sizing.buttonHeight,
    height: sizing.buttonHeight,
    borderRadius: sizing.cardRadius,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accentLight,
  },
  disabledBtn: {
    opacity: 0.4,
  },
});
