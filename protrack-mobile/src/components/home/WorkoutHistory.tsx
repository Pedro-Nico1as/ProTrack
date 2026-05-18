import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, sizing } from '../../theme/tokens';
import { Text } from '../core/Text';

interface WorkoutLog {
  client_id: string;
  completed_at: string;
  duration_seconds: number;
  total_volume_kg: number;
  total_sets: number;
}

interface WorkoutHistoryProps {
  logs: WorkoutLog[];
  isLoading: boolean;
}

export const WorkoutHistory = ({ logs, isLoading }: WorkoutHistoryProps) => {
  if (isLoading) {
    return (
      <View style={styles.section}>
        <Text variant="label" style={styles.sectionTitle}>HISTÓRICO DE TREINOS</Text>
        <View style={styles.loadingContainer}>
          <Text variant="caption" color={colors.textMuted}>Carregando histórico...</Text>
        </View>
      </View>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <View style={styles.section}>
        <Text variant="label" style={styles.sectionTitle}>HISTÓRICO DE TREINOS</Text>
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={32} color={colors.textMuted} />
          <Text variant="caption" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
            Nenhum treino finalizado ainda.
          </Text>
        </View>
      </View>
    );
  }

  // Sort logs by newest first
  const sortedLogs = [...logs].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

  return (
    <View style={styles.section}>
      <Text variant="label" style={styles.sectionTitle}>HISTÓRICO DE TREINOS</Text>
      
      <View style={styles.list}>
        {sortedLogs.map((log) => {
          const date = new Date(log.completed_at);
          const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
          const duration = Math.round((log.duration_seconds || 0) / 60);

          return (
            <View key={log.client_id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name="barbell" size={20} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="semibold">Treino Finalizado</Text>
                  <Text variant="caption" color={colors.textMuted}>{formattedDate}</Text>
                </View>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metric}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text variant="caption" color={colors.textSecondary}>{duration} min</Text>
                </View>
                <View style={styles.metric}>
                  <Ionicons name="fitness-outline" size={14} color={colors.textSecondary} />
                  <Text variant="caption" color={colors.textSecondary}>{Math.round(log.total_volume_kg || 0)} kg</Text>
                </View>
                <View style={styles.metric}>
                  <Ionicons name="layers-outline" size={14} color={colors.textSecondary} />
                  <Text variant="caption" color={colors.textSecondary}>{log.total_sets || 0} séries</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: sizing.cardRadius,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: sizing.cardRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderStyle: 'dashed',
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: sizing.cardRadius,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
