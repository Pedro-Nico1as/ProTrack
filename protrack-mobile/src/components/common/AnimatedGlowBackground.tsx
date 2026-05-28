import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const AnimatedGlowBackground = () => {
  // Shared values for floating blobs
  const blob1X = useSharedValue(0);
  const blob1Y = useSharedValue(0);

  const blob2X = useSharedValue(0);
  const blob2Y = useSharedValue(0);

  const blob3X = useSharedValue(0);
  const blob3Y = useSharedValue(0);

  const bgScale = useSharedValue(1);

  useEffect(() => {
    // Blob 1: Orange - moves in a slow oval path
    blob1X.value = withRepeat(
      withSequence(
        withTiming(SCREEN_WIDTH * 0.15, { duration: 15000 }),
        withTiming(-SCREEN_WIDTH * 0.1, { duration: 18000 }),
        withTiming(0, { duration: 15000 })
      ),
      -1,
      true
    );
    blob1Y.value = withRepeat(
      withSequence(
        withTiming(SCREEN_HEIGHT * 0.08, { duration: 16000 }),
        withTiming(-SCREEN_HEIGHT * 0.08, { duration: 17000 }),
        withTiming(0, { duration: 15000 })
      ),
      -1,
      true
    );

    // Blob 2: Pink - moves in a different timing
    blob2X.value = withRepeat(
      withSequence(
        withTiming(-SCREEN_WIDTH * 0.12, { duration: 18000 }),
        withTiming(SCREEN_WIDTH * 0.12, { duration: 16000 }),
        withTiming(0, { duration: 17000 })
      ),
      -1,
      true
    );
    blob2Y.value = withRepeat(
      withSequence(
        withTiming(-SCREEN_HEIGHT * 0.06, { duration: 14000 }),
        withTiming(SCREEN_HEIGHT * 0.09, { duration: 19000 }),
        withTiming(0, { duration: 15000 })
      ),
      -1,
      true
    );

    // Blob 3: Blue
    blob3X.value = withRepeat(
      withSequence(
        withTiming(SCREEN_WIDTH * 0.08, { duration: 20000 }),
        withTiming(-SCREEN_WIDTH * 0.15, { duration: 15000 }),
        withTiming(0, { duration: 18000 })
      ),
      -1,
      true
    );
    blob3Y.value = withRepeat(
      withSequence(
        withTiming(SCREEN_HEIGHT * 0.1, { duration: 19000 }),
        withTiming(-SCREEN_HEIGHT * 0.05, { duration: 15000 }),
        withTiming(0, { duration: 18000 })
      ),
      -1,
      true
    );

    // Slowly pulsate background scale
    bgScale.value = withRepeat(
      withSequence(withTiming(1.06, { duration: 25000 }), withTiming(1.0, { duration: 25000 })),
      -1,
      true
    );
  }, []);

  const animStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateX: blob1X.value }, { translateY: blob1Y.value }],
  }));

  const animStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateX: blob2X.value }, { translateY: blob2Y.value }],
  }));

  const animStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateX: blob3X.value }, { translateY: blob3Y.value }],
  }));

  const bgAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bgScale.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Background Image with subtle scale animation */}
      <Animated.Image
        source={require('../../../assets/bg_abstract.png')}
        style={[StyleSheet.absoluteFill, bgAnimStyle]}
        resizeMode="cover"
      />

      {/* Dark overlay to ensure readability */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(8, 13, 24, 0.7)' }]} />

      {/* Floating Blobs */}
      {/* Blob 1: Orange glow */}
      <Animated.View
        style={[
          styles.blob,
          styles.blobOrange,
          animStyle1,
          { top: SCREEN_HEIGHT * 0.15, left: -50 },
        ]}
      />

      {/* Blob 2: Pink glow */}
      <Animated.View
        style={[
          styles.blob,
          styles.blobPink,
          animStyle2,
          { bottom: SCREEN_HEIGHT * 0.2, right: -60 },
        ]}
      />

      {/* Blob 3: Blue glow */}
      <Animated.View
        style={[
          styles.blob,
          styles.blobBlue,
          animStyle3,
          { top: SCREEN_HEIGHT * 0.5, left: SCREEN_WIDTH * 0.3 },
        ]}
      />

      {/* Radial Gradient overlay to blur borders and dark gradient */}
      <LinearGradient
        colors={['rgba(8, 13, 24, 0.3)', 'rgba(8, 13, 24, 0.8)', '#080D18']}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.35,
  },
  blobOrange: {
    backgroundColor: '#FE7B02',
    ...Platform.select({
      ios: {
        shadowColor: '#FE7B02',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 100,
      },
      android: {
        elevation: 20,
      },
      web: {
        filter: 'blur(100px)',
      } as any,
    }),
  },
  blobPink: {
    backgroundColor: '#FF66F4',
    ...Platform.select({
      ios: {
        shadowColor: '#FF66F4',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 100,
      },
      android: {
        elevation: 20,
      },
      web: {
        filter: 'blur(100px)',
      } as any,
    }),
  },
  blobBlue: {
    backgroundColor: '#4B73FF',
    ...Platform.select({
      ios: {
        shadowColor: '#4B73FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 100,
      },
      android: {
        elevation: 20,
      },
      web: {
        filter: 'blur(100px)',
      } as any,
    }),
  },
});
