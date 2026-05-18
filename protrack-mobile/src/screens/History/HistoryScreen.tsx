import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, sizing } from '../../theme/tokens';
import { strings } from '../../constants/strings';

import { Text } from '../../components/core/Text';
import { Card } from '../../components/core/Card';

export const HistoryScreen = () => {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [setsCount, setSetsCount] = useState<number>(0);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchHistory = async () => {
        try {
          if (isActive) {
            setWorkouts([]);
            setSetsCount(0);
          }
        } catch (e) {
          console.error("Erro", e);
        }
      };
      fetchHistory();
      return () => { isActive = false; };
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text variant="heading">{strings.history.title}</Text>
          <Text variant="caption" color={colors.primary} style={styles.subtitle}>
            {setsCount} séries registradas
          </Text>

          {workouts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="body" color={colors.textMuted} align="center">
                Nenhum treino finalizado ainda.
              </Text>
              <Text variant="caption" color={colors.textMuted} align="center">
                Complete seu primeiro treino para vê-lo aqui.
              </Text>
            </View>
          ) : (
            <FlatList
              data={workouts}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.sm }}
              renderItem={({ item }) => (
                <Card gradient={colors.gradients.card}>
                  <View style={styles.cardRow}>
                    <View style={styles.cardDot} />
                    <View style={{ flex: 1 }}>
                      <Text variant="body" weight="semibold">
                        Treino #{item.id.substring(0, 6)}
                      </Text>
                      <Text variant="caption">
                        {new Date(item.started_at).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                        {' · '}
                        {new Date(item.started_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>
                </Card>
              )}
            />
          )}
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
    marginBottom: spacing.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryDark,
  },
});
