import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CustomExercise {
  id: string;
  exerciseId: string; // Global exercise ID from Supabase
  name: string;
  muscleGroup: string;
  youtubeId: string;
  targetSets: number;
  targetReps: number;
  restSeconds?: number;
  isCustom?: boolean;
}

export interface CustomWorkoutPartition {
  id: string;
  name: string;
  exercises: CustomExercise[];
}

export interface CustomWorkout {
  id: string;
  name: string;
  partitions: CustomWorkoutPartition[];
  createdAt: string;
  exercises?: CustomExercise[]; // Deprecated from v0
}

export interface CustomExerciseTemplate {
  id: string;
  name: string;
  muscle_group: string;
  youtube_video_id: string;
  equipment: string[];
  isCustom?: boolean;
}

interface CustomWorkoutsState {
  workouts: CustomWorkout[];
  customExercises: CustomExerciseTemplate[];
  addWorkout: (workout: CustomWorkout) => void;
  updateWorkout: (workout: CustomWorkout) => void;
  removeWorkout: (id: string) => void;
  addCustomExercise: (exercise: CustomExerciseTemplate) => void;
  removeCustomExercise: (id: string) => void;
  clearWorkouts: () => void;
}

export const useCustomWorkoutsStore = create<CustomWorkoutsState>()(
  persist(
    (set) => ({
      workouts: [],
      customExercises: [],
      addWorkout: (workout) => set((state) => ({ workouts: [workout, ...state.workouts] })),
      updateWorkout: (workout) =>
        set((state) => ({
          workouts: state.workouts.map((w) => (w.id === workout.id ? workout : w)),
        })),
      removeWorkout: (id) =>
        set((state) => ({
          workouts: state.workouts.filter((w) => w.id !== id),
        })),
      addCustomExercise: (exercise) =>
        set((state) => ({
          customExercises: [exercise, ...(state.customExercises || [])],
        })),
      removeCustomExercise: (id) =>
        set((state) => ({
          customExercises: (state.customExercises || []).filter((ex) => ex.id !== id),
        })),
      clearWorkouts: () => set({ workouts: [], customExercises: [] }),
    }),
    {
      name: 'custom-workouts-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState: any, version: number) => {
        let state = persistedState as any;
        if (version === 0) {
          // Migration from v0 (exercises directly in workout) to v1 (exercises inside partitions)
          if (state.workouts) {
            state.workouts = state.workouts.map((w: any) => {
              if (w.exercises && (!w.partitions || w.partitions.length === 0)) {
                return {
                  ...w,
                  partitions: [
                    {
                      id: `${w.id}-p1`,
                      name: 'Treino A',
                      exercises: w.exercises,
                    },
                  ],
                  exercises: undefined,
                };
              }
              return w;
            });
          }
        }
        if (version < 2) {
          if (!state.customExercises) {
            state.customExercises = [];
          }
        }
        return state;
      },
    }
  )
);
