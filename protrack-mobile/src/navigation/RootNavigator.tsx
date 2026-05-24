import React, { useEffect } from 'react';
import { View, ActivityIndicator, Linking, Alert } from 'react-native';
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
import { ResetPasswordScreen } from '../screens/Auth/ResetPasswordScreen';
import { supabase } from '../services/supabase';
import { parseAuthParams } from '../utils/authUtils';
import { colors } from '../theme/tokens';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { session, isInitialized, isResettingPassword, setIsResettingPassword } = useAuthStore();

  useEffect(() => {
    const handleDeepLink = async (url: string | null) => {
      if (!url) return;

      console.log('App received deep link URL:', url);

      // Parse parameters (supports both query params and hash fragments)
      const params = parseAuthParams(url);

      const { access_token, refresh_token, type, error, error_description } = params;

      if (error || error_description) {
        const decodedErrorDescription = error_description
          ? decodeURIComponent(error_description).replace(/\+/g, ' ')
          : 'O link de confirmação/recuperação expirou ou já foi utilizado. Por favor, solicite um novo.';
        Alert.alert('Link Inválido', decodedErrorDescription);
        return;
      }

      if (access_token && refresh_token) {
        try {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (sessionError) throw sessionError;

          // If type is recovery or the path/url contains reset-password
          if (type === 'recovery' || url.includes('reset-password')) {
            setIsResettingPassword(true);
          } else {
            Alert.alert('Sucesso', 'E-mail confirmado com sucesso!');
          }
        } catch (err: any) {
          Alert.alert('Erro na autenticação', err.message || 'Link inválido ou expirado.');
        }
      }
    };

    // Listen for incoming URLs (when app is already running)
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Check if the app was opened by a deep link (cold start)
    Linking.getInitialURL().then((url) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, [setIsResettingPassword]);

  if (!isInitialized) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : isResettingPassword ? (
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
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
