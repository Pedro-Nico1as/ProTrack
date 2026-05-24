import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV();

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
  loggedSets: LoggedSet[];
}

interface ActiveWorkoutState {
  isActive: boolean;
  workoutName: string;
  exercises: ActiveExercise[];
  currentExerciseIndex: number;
  restTargetEndTime: number | null;
  sessionId: string | null;

  startWorkout: (name: string, exercises: ActiveExercise[], sessionId?: string | null) => void;
  finishWorkout: () => void;
  nextExercise: () => void;
  prevExercise: () => void;
  logSet: (exerciseIndex: number, set: LoggedSet) => void;
  startRest: (seconds: number) => void;
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
      sessionId: null,

      startWorkout: (name, exercises, sessionId = null) =>
        set({
          isActive: true,
          workoutName: name,
          exercises,
          currentExerciseIndex: 0,
          restTargetEndTime: null,
          sessionId,
        }),
      finishWorkout: () =>
        set({
          isActive: false,
          workoutName: '',
          exercises: [],
          currentExerciseIndex: 0,
          restTargetEndTime: null,
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
          const newExercises = [...state.exercises];
          newExercises[exerciseIndex].loggedSets.push(loggedSet);
          return { exercises: newExercises };
        }),
      startRest: (seconds) =>
        set({
          restTargetEndTime: Date.now() + seconds * 1000,
        }),
      skipRest: () =>
        set({
          restTargetEndTime: null,
        }),
    }),
    {
      name: 'active-workout',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
