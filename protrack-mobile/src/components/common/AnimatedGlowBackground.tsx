import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

export const AnimatedGlowBackground = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Fallback visual background image displayed instantly while video is loading */}
      {!isVideoLoaded && (
        <Image
          source={require('../../../assets/auth_bg_fallback.png')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      )}

      {/* Video Background from local asset */}
      <Video
        source={require('../../../assets/auth_bg.mp4')}
        style={[StyleSheet.absoluteFill, { opacity: isVideoLoaded ? 1 : 0 }]}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
        muted={true}
        useNativeControls={false}
        onLoad={() => setIsVideoLoaded(true)}
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
