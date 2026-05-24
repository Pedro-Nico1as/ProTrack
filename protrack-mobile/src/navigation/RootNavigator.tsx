import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { ActiveWorkoutScreen } from '../screens/ActiveWorkout/ActiveWorkoutScreen';
import { BuildWorkoutScreen } from '../screens/BuildWorkout/BuildWorkoutScreen';
import { EditWorkoutScreen } from '../screens/BuildWorkout/EditWorkoutScreen';
import { ChooseWorkoutScreen } from '../screens/BuildWorkout/ChooseWorkoutScreen';
import { EditProfileScreen } from '../screens/Profile/EditProfileScreen';
import { RootStackParamList } from './types';

import { useAuthStore } from '../stores/useAuthStore';
import { AuthScreen } from '../screens/Auth/AuthScreen';
import { colors } from '../theme/tokens';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { session, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen
            name="ActiveWorkout"
            component={ActiveWorkoutScreen}
            options={{
              presentation: 'fullScreenModal',
              animation: 'fade_from_bottom',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="ChooseWorkout"
            component={ChooseWorkoutScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="BuildWorkout"
            component={BuildWorkoutScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="EditWorkout"
            component={EditWorkoutScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

