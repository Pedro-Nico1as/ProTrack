import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, sizing } from '../../theme/tokens';
import { Text } from '../core/Text';
import { strings } from '../../constants/strings';

interface LoggedSetDetail {
  weight: number;
  reps: number;
  exerciseName: string;
}

interface WorkoutLog {
  id: string;
  completed_at: string;
  duration_seconds: number;
  total_volume_kg: number;
  total_sets: number;
  sets?: LoggedSetDetail[];
}

interface WorkoutHistoryProps {
  logs: WorkoutLog[];
  isLoading: boolean;
}

export const WorkoutHistory = ({ logs, isLoading }: WorkoutHistoryProps) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  if (isLoading) {
    return (
      <View style={styles.section}>
        <Text variant="label" style={styles.sectionTitle}>
          {strings.workoutHistory.title}
        </Text>
        <View style={styles.loadingContainer}>
          <Text variant="caption" color={colors.textMuted}>
            {strings.workoutHistory.loading}
          </Text>
        </View>
      </View>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <View style={styles.section}>
        <Text variant="label" style={styles.sectionTitle}>
          {strings.workoutHistory.title}
        </Text>
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={32} color={colors.textMuted} />
          <Text variant="caption" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
            {strings.workoutHistory.empty}
          </Text>
        </View>
      </View>
    );
  }

  // Sort logs by newest first
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );

  return (
    <View style={styles.section}>
      <Text variant="label" style={styles.sectionTitle}>
        {strings.workoutHistory.title}
      </Text>

      <View style={styles.list}>
        {sortedLogs.map((log) => {
          const date = new Date(log.completed_at);
          const formattedDate = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          });
          const duration = Math.round((log.duration_seconds || 0) / 60);
          const isExpanded = expandedLogId === log.id;

          // Group sets by exercise name
          const groupedSets = (log.sets || []).reduce(
            (acc, set) => {
              if (!acc[set.exerciseName]) {
                acc[set.exerciseName] = [];
              }
              acc[set.exerciseName].push(set);
              return acc;
            },
            {} as Record<string, LoggedSetDetail[]>
          );

          return (
            <Pressable key={log.id} style={styles.card} onPress={() => toggleExpand(log.id)}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name="barbell" size={20} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="semibold">
                    {strings.workoutHistory.finishedWorkoutTitle}
                  </Text>
                  <Text variant="caption" color={colors.textMuted}>
                    {formattedDate}
                  </Text>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metric}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text variant="caption" color={colors.textSecondary}>
                    {duration} {strings.workoutHistory.min}
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Ionicons name="fitness-outline" size={14} color={colors.textSecondary} />
                  <Text variant="caption" color={colors.textSecondary}>
                    {Math.round(log.total_volume_kg || 0)} {strings.workoutHistory.kg}
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Ionicons name="layers-outline" size={14} color={colors.textSecondary} />
                  <Text variant="caption" color={colors.textSecondary}>
                    {log.total_sets || 0} {strings.workoutHistory.sets}
                  </Text>
                </View>
              </View>

              {isExpanded && log.sets && log.sets.length > 0 && (
                <View style={styles.detailsContainer}>
                  {Object.entries(groupedSets).map(([exerciseName, exerciseSets]) => (
                    <View key={exerciseName} style={styles.exerciseDetailItem}>
                      <Text variant="body" weight="semibold" style={styles.exerciseNameText}>
                        {exerciseName}
                      </Text>
                      <View style={styles.setsList}>
                        {exerciseSets.map((set, idx) => (
                          <View key={idx} style={styles.setDetailRow}>
                            <Text variant="caption" color={colors.textSecondary}>
                              Série {idx + 1}
                            </Text>
                            <Text variant="caption" weight="semibold" color={colors.text}>
                              {set.weight} kg x {set.reps} reps
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </Pressable>
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
  detailsContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    gap: spacing.sm,
  },
  exerciseDetailItem: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: colors.borderSubtle,
  },
  exerciseNameText: {
    fontSize: 14,
    marginBottom: 4,
    color: colors.primary,
  },
  setsList: {
    gap: 2,
  },
  setDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    borderBottomWidth: 0.25,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
});
