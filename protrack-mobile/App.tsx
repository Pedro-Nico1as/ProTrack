import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { StyleSheet, Text, View, StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useNetInfo } from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/stores/useAuthStore';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useFonts({
    'Outfit-Regular': require('./assets/fonts/Outfit-Regular.ttf'),
    'Outfit-Medium': require('./assets/fonts/Outfit-Medium.ttf'),
    'Outfit-SemiBold': require('./assets/fonts/Outfit-SemiBold.ttf'),
    'Outfit-Bold': require('./assets/fonts/Outfit-Bold.ttf'),
    'Outfit-ExtraBold': require('./assets/fonts/Outfit-ExtraBold.ttf'),
    'Outfit-Black': require('./assets/fonts/Outfit-Black.ttf'),
  });

  const isInitialized = useAuthStore((state) => state.isInitialized);
  const netInfo = useNetInfo();

  // Hide Splash Screen once fonts load and auth is initialized
  useEffect(() => {
    if (fontsLoaded && isInitialized) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, isInitialized]);


  if (!fontsLoaded || !isInitialized) {
    return null; // Keep Splash Screen visible
  }

  // Blocker overlay when offline
  const isOffline = netInfo.isConnected === false;

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      {isOffline ? (
        <View style={styles.offlineContainer}>
          <View style={styles.offlineCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="wifi-outline" size={54} color="#E43232" />
            </View>
            <Text style={styles.offlineTitle}>CONEXÃO REQUERIDA</Text>
            <Text style={styles.offlineSubtitle}>Exclusivamente Online</Text>
            <Text style={styles.offlineText}>
              O ProTrack & Flow é um aplicativo exclusivamente online. Conecte-se a uma rede de internet ativa para continuar treinando e sincronizando seus dados de performance.
            </Text>
          </View>
        </View>
      ) : (
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  offlineContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  offlineCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(228, 50, 50, 0.25)',
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#E43232',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(228, 50, 50, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(228, 50, 50, 0.2)',
  },
  offlineTitle: {
    fontFamily: 'Outfit-Bold',
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  offlineSubtitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 12,
    color: '#E43232',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 20,
  },
  offlineText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
    color: '#A3A3A3',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
});
