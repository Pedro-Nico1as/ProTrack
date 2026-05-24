import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'custom-workouts-storage' });

const mmkvStorage: StateStorage = {
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
};

export interface CustomExercise {
  id: string;
  exerciseId: string; // Global exercise ID from Supabase
  name: string;
  muscleGroup: string;
  youtubeId: string;
  targetSets: number;
  targetReps: number;
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

interface CustomWorkoutsState {
  workouts: CustomWorkout[];
  addWorkout: (workout: CustomWorkout) => void;
  updateWorkout: (workout: CustomWorkout) => void;
  removeWorkout: (id: string) => void;
}

export const useCustomWorkoutsStore = create<CustomWorkoutsState>()(
  persist(
    (set) => ({
      workouts: [],
      addWorkout: (workout) => set((state) => ({ workouts: [workout, ...state.workouts] })),
      updateWorkout: (workout) =>
        set((state) => ({
          workouts: state.workouts.map((w) => (w.id === workout.id ? workout : w)),
        })),
      removeWorkout: (id) =>
        set((state) => ({
          workouts: state.workouts.filter((w) => w.id !== id),
        })),
    }),
    {
      name: 'custom-workouts-storage',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from v0 (exercises directly in workout) to v1 (exercises inside partitions)
          const state = persistedState as CustomWorkoutsState;
          if (state.workouts) {
            state.workouts = state.workouts.map((w) => {
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
          return state;
        }
        return persistedState;
      },
    }
  )
);
