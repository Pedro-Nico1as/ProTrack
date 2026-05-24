import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing } from '../../theme/tokens';
import { strings } from '../../constants/strings';
import { supabase } from '../../services/supabase';
import { Text } from '../../components/core/Text';
import { Card } from '../../components/core/Card';

const CARD_HEIGHT = 80;
const CARD_SEPARATOR = spacing.sm;

export const HistoryScreen = () => {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [setsCount, setSetsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchHistory = async () => {
        try {
          setIsLoading(true);
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) {
            setIsLoading(false);
            return;
          }

          const { data, error } = await supabase
            .from('user_workout_logs')
            .select(
              `
              id,
              started_at,
              completed_at,
              duration_seconds,
              session_id,
              workout_sessions (
                title
              ),
              user_set_logs (
                id
              )
            `
            )
            .eq('user_id', session.user.id)
            .order('completed_at', { ascending: false })
            .limit(50);

          if (error) throw error;

          if (isActive) {
            setWorkouts(data ?? []);
            const total = (data ?? []).reduce((acc, w) => acc + (w.user_set_logs?.length ?? 0), 0);
            setSetsCount(total);
          }
        } catch (e) {
          console.error('Erro ao buscar histórico', e);
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };

      fetchHistory();
      return () => {
        isActive = false;
      };
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

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : workouts.length === 0 ? (
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
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: CARD_SEPARATOR }}
              getItemLayout={(_, index) => ({
                length: CARD_HEIGHT + CARD_SEPARATOR,
                offset: (CARD_HEIGHT + CARD_SEPARATOR) * index,
                index,
              })}
              renderItem={({ item }) => {
                const sessionTitle = item.workout_sessions?.title || 'Treino Livre';
                const durationMinutes = Math.round(item.duration_seconds / 60);
                const setsLength = item.user_set_logs?.length ?? 0;

                return (
                  <Card gradient={colors.gradients.card} style={styles.card}>
                    <View style={styles.cardRow}>
                      <View style={styles.cardDot} />
                      <View style={{ flex: 1 }}>
                        <Text variant="body" weight="semibold">
                          {sessionTitle}
                        </Text>
                        <Text variant="caption" color={colors.textSecondary}>
                          {new Date(item.completed_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                          {' · '}
                          {durationMinutes} min
                          {' · '}
                          {setsLength} séries
                        </Text>
                      </View>
                    </View>
                  </Card>
                );
              }}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  card: {
    height: CARD_HEIGHT,
    justifyContent: 'center',
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
