import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme/tokens';
import { strings } from '../../constants/strings';
import { supabase } from '../../services/supabase';
import { Text } from '../../components/core/Text';
import { Card } from '../../components/core/Card';

const CARD_HEIGHT = 120;
const CARD_SEPARATOR = spacing.sm;

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: colors.badgeGreen,
  intermediate: colors.warning,
  advanced: colors.error,
};

export const ExploreScreen = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('workout_plans')
          .select(
            `
            id,
            title,
            description,
            level,
            duration_weeks,
            days_per_week,
            athletes (
              name,
              avatar_url,
              is_verified
            )
          `
          )
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPlans(data ?? []);
      } catch (e) {
        console.error('Erro ao buscar planos de treino', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text variant="heading">{strings.explore.title}</Text>
          <Text variant="caption" color={colors.textSecondary} style={styles.subtitle}>
            Planos de treino recomendados por atletas profissionais
          </Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : plans.length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="body" color={colors.textMuted} align="center">
                {strings.featured.empty}
              </Text>
            </View>
          ) : (
            <FlatList
              data={plans}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: CARD_SEPARATOR }}
              getItemLayout={(_, index) => ({
                length: CARD_HEIGHT + CARD_SEPARATOR,
                offset: (CARD_HEIGHT + CARD_SEPARATOR) * index,
                index,
              })}
              renderItem={({ item }) => {
                const levelLabel = LEVEL_LABELS[item.level] || item.level || 'Geral';
                const levelColor = LEVEL_COLORS[item.level] || colors.primary;
                const athleteName = item.athletes?.name || 'Atleta ProTrack';
                const isVerified = item.athletes?.is_verified ?? false;

                return (
                  <Card gradient={colors.gradients.card} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardTitleSection}>
                        <Text variant="body" weight="bold" numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text
                          variant="caption"
                          color={colors.textSecondary}
                          numberOfLines={1}
                          style={styles.description}
                        >
                          {item.description}
                        </Text>
                      </View>
                      <View style={[styles.badge, { borderColor: levelColor }]}>
                        <Text style={[styles.badgeText, { color: levelColor }]}>{levelLabel}</Text>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <View style={styles.metaInfo}>
                        <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                        <Text
                          variant="caption"
                          color={colors.textSecondary}
                          style={styles.metaText}
                        >
                          {item.duration_weeks} sem
                        </Text>
                        <Ionicons
                          name="barbell-outline"
                          size={14}
                          color={colors.textSecondary}
                          style={{ marginLeft: spacing.sm }}
                        />
                        <Text
                          variant="caption"
                          color={colors.textSecondary}
                          style={styles.metaText}
                        >
                          {item.days_per_week} dias/sem
                        </Text>
                      </View>

                      <View style={styles.athleteSection}>
                        <Text variant="caption" color={colors.textSecondary} weight="medium">
                          {athleteName}
                        </Text>
                        {isVerified && (
                          <Ionicons
                            name="checkmark-circle"
                            size={14}
                            color={colors.primary}
                            style={styles.verifiedIcon}
                          />
                        )}
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
    padding: spacing.xl,
  },
  card: {
    height: CARD_HEIGHT,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cardTitleSection: {
    flex: 1,
  },
  description: {
    marginTop: 2,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.xs,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
  },
  athleteSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedIcon: {
    marginLeft: 2,
  },
});
