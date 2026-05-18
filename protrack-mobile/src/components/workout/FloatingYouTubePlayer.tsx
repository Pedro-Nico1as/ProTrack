import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, sizing, animation } from '../../theme/tokens';
import { Text } from '../core/Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  videoId: string;
}

export const FloatingYouTubePlayer = ({ videoId }: Props) => {
  const [playing, setPlaying] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(animation.pressScale, { duration: animation.duration.fast });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: animation.duration.normal });
  };

  if (minimized) {
    return (
      <AnimatedPressable
        style={[styles.minimizedContainer, animatedStyle]}
        onPress={() => setMinimized(false)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.playIconWrap}>
          <Ionicons name="play" size={16} color={colors.primary} />
        </View>
        <Text variant="caption" weight="semibold" color={colors.primary}>
          Ver Execução do Exercício
        </Text>
      </AnimatedPressable>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="label">TUTORIAL EM VÍDEO</Text>
        <Pressable onPress={() => setMinimized(true)} hitSlop={8}>
          <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>
      <View style={styles.playerWrapper}>
        <YoutubePlayer
          height={200}
          play={playing}
          videoId={videoId}
          initialPlayerParams={{
            preventFullScreen: false,
            rel: false,
            modestbranding: true,
          }}
          onChangeState={(event: string) => {
            if (event === 'ended') setPlaying(false);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: sizing.videoRadius,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  playerWrapper: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    borderBottomLeftRadius: sizing.videoRadius,
    borderBottomRightRadius: sizing.videoRadius,
    overflow: 'hidden',
  },
  minimizedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: sizing.cardRadius,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryGlow,
    gap: spacing.sm,
  },
  playIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
