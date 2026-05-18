import React, { useEffect } from 'react';
import { View, Text as RNText, StyleSheet, Pressable, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { TabParamList } from './types';
import { colors, spacing, sizing, typography } from '../theme/tokens';
import { strings } from '../constants/strings';

const Tab = createBottomTabNavigator<TabParamList>();

const EmptyScreen = () => <View style={{ flex: 1, backgroundColor: colors.background }} />;

interface TabItemProps {
  isFocused: boolean;
  onPress: () => void;
  label: string;
  iconName: keyof typeof Feather.glyphMap;
}

const TabItem = ({ isFocused, onPress, label, iconName }: TabItemProps) => {
  const scale = useSharedValue(1);
  const activeProgress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    activeProgress.value = withTiming(isFocused ? 1 : 0, { duration: 180 });
    scale.value = withTiming(isFocused ? 1.08 : 1, { duration: 180 });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    const translateY = withTiming(isFocused ? -3 : 0, { duration: 180 });
    return {
      transform: [{ translateY }],
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    const opacity = withTiming(isFocused ? 0.12 : 0, { duration: 240 });
    return {
      opacity,
    };
  });

  const tintColor = isFocused ? colors.accent : colors.textSecondary;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      style={styles.tabItem}
      onPress={handlePress}
    >
      <Animated.View style={[styles.glowBackground, animatedGlowStyle]} />
      <Animated.View style={[animatedIconStyle, animatedStyle]}>
        <Feather name={iconName} size={22} color={tintColor} />
      </Animated.View>
      <RNText style={[styles.tabLabel, { color: tintColor }]}>{label}</RNText>
    </Pressable>
  );
};

const AnimatedFAB = ({ onPress }: { onPress: () => void }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withTiming(0.92, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  return (
    <Pressable
      style={styles.fabContainer}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.fab, animatedStyle]}>
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </Animated.View>
      <RNText style={styles.fabLabel}>{strings.tabs.newWorkout}</RNText>
    </Pressable>
  );
};

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, spacing.sm);

  return (
    <View style={[styles.tabBar, { paddingBottom: bottomPadding }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const isFAB = route.name === 'NewWorkoutPlaceholder';

        const onPress = () => {
          if (isFAB) {
            navigation.navigate('ChooseWorkout' as never);
            return;
          }
          if (!isFocused) {
            navigation.navigate(route.name as never);
          }
        };

        if (isFAB) {
          return <AnimatedFAB key={route.key} onPress={onPress} />;
        }

        const iconName: keyof typeof Feather.glyphMap =
          route.name === 'Home' ? 'home' : 'user';

        const label = route.name === 'Home' ? strings.tabs.home : strings.tabs.profile;

        return (
          <TabItem
            key={route.key}
            isFocused={isFocused}
            onPress={onPress}
            label={label}
            iconName={iconName}
          />
        );
      })}
    </View>
  );
};

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="NewWorkoutPlaceholder" component={EmptyScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizing.touchableMinHeight,
    position: 'relative',
  },
  glowBackground: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
  },
  tabLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '500' as const,
    marginTop: 4,
  },
  fabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -20,
  },
  fab: {
    width: sizing.fabSize,
    height: sizing.fabSize,
    borderRadius: sizing.fabSize / 2,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '500' as const,
    color: colors.accent,
    marginTop: 4,
  },
});
