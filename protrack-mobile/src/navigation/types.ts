import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  NewWorkoutPlaceholder: undefined;
  History: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: NavigatorScreenParams<TabParamList>;
  ActiveWorkout:
    | {
        sessionId?: string | null;
        workoutName?: string;
        exercises?: any[];
      }
    | undefined;
  ChooseWorkout: undefined;
  BuildWorkout: undefined;
  EditWorkout: { workoutId: string };
  EditProfile: undefined;
  ResetPassword: undefined;
};
