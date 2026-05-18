import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { colors, spacing } from '../../theme/tokens';
import { strings } from '../../constants/strings';
import { Text } from '../../components/core/Text';

export const ExploreScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text variant="heading">{strings.explore.title}</Text>
          <Text variant="caption" style={styles.subtitle}>
            Em breve, planos de treino personalizados.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
});
