import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoggedSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  completedAt: string;
}

export interface ActiveExercise {
  id: string; // session_exercise_id
  exerciseId?: string; // real global exercise_id
  name: string;
  muscleGroup: string;
  youtubeId: string;
  targetSets: number;
  targetReps: number;
  restSeconds?: number;
  isCustom?: boolean;
  loggedSets: LoggedSet[];
}

interface ActiveWorkoutState {
  isActive: boolean;
  workoutName: string;
  exercises: ActiveExercise[];
  currentExerciseIndex: number;
  restTargetEndTime: number | null;
  restDuration: number;
  sessionId: string | null;

  startWorkout: (name: string, exercises: ActiveExercise[], sessionId?: string | null) => void;
  finishWorkout: () => void;
  nextExercise: () => void;
  prevExercise: () => void;
  logSet: (exerciseIndex: number, set: LoggedSet) => void;
  startRest: (seconds: number) => void;
  addRestTime: (seconds: number) => void;
  skipRest: () => void;
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>()(
  persist(
    (set) => ({
      isActive: false,
      workoutName: '',
      exercises: [],
      currentExerciseIndex: 0,
      restTargetEndTime: null,
      restDuration: 60,
      sessionId: null,

      startWorkout: (name, exercises, sessionId = null) =>
        set({
          isActive: true,
          workoutName: name,
          exercises,
          currentExerciseIndex: 0,
          restTargetEndTime: null,
          restDuration: 60,
          sessionId,
        }),
      finishWorkout: () =>
        set({
          isActive: false,
          workoutName: '',
          exercises: [],
          currentExerciseIndex: 0,
          restTargetEndTime: null,
          restDuration: 60,
          sessionId: null,
        }),
      nextExercise: () =>
        set((state) => ({
          currentExerciseIndex: Math.min(
            state.currentExerciseIndex + 1,
            state.exercises.length - 1
          ),
        })),
      prevExercise: () =>
        set((state) => ({
          currentExerciseIndex: Math.max(state.currentExerciseIndex - 1, 0),
        })),
      logSet: (exerciseIndex, loggedSet) =>
        set((state) => {
          const newExercises = state.exercises.map((ex, idx) => {
            if (idx === exerciseIndex) {
              return {
                ...ex,
                loggedSets: [...ex.loggedSets, loggedSet],
              };
            }
            return ex;
          });
          return { exercises: newExercises };
        }),
      startRest: (seconds) =>
        set({
          restDuration: seconds,
          restTargetEndTime: Date.now() + seconds * 1000,
        }),
      addRestTime: (seconds) =>
        set((state) => ({
          restDuration: state.restDuration + seconds,
          restTargetEndTime: state.restTargetEndTime
            ? state.restTargetEndTime + seconds * 1000
            : Date.now() + seconds * 1000,
        })),
      skipRest: () =>
        set({
          restTargetEndTime: null,
        }),
    }),
    {
      name: 'active-workout',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
