// Reference Design: https://dribbble.com/shots/25546625-Iridescent-background-animation
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

export const AnimatedGlowBackground = () => {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Video Background from local asset */}
      <Video
        source={require('../../../assets/auth_bg.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
        useNativeControls={false}
      />

      {/* Black translucent overlay to balance legibility and video colors */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.45)' }]} />

      {/* Fading bottom gradient transitioning seamlessly to standard black background */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.65)', '#000000']}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
};
