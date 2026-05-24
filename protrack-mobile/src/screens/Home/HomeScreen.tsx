import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '../../theme/tokens';
import { strings } from '../../constants/strings';
import { RootStackParamList } from '../../navigation/types';
import { useActiveWorkoutStore } from '../../stores/useActiveWorkoutStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { fetchWorkoutLogs } from '../../services/api';
import { Text } from '../../components/core/Text';
import { Card } from '../../components/core/Card';
import { BuildWorkoutCard } from '../../components/home/BuildWorkoutCard';
import { WeeklyStats } from '../../components/home/WeeklyStats';
import { WorkoutHistory } from '../../components/home/WorkoutHistory';
import { MyWorkouts } from '../../components/home/MyWorkouts';

export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isActive } = useActiveWorkoutStore();
  const { user } = useAuthStore();

  const [stats, setStats] = useState({ total: 0, month: 0, week: 0 });
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Atleta';
  const greetingText = strings.home.greeting.replace('{name}', userName);
  
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadData = async () => {
        setIsLoading(true);

        try {
          const allLogs = await fetchWorkoutLogs();
          
          if (active) {
            setLogs(allLogs);
            
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            
            // Start of week (Sunday)
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);

            let monthCount = 0;
            let weekCount = 0;

            allLogs.forEach(log => {
              if (!log.completed_at) return;
              const d = new Date(log.completed_at);
              if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) monthCount++;
              if (d >= weekStart) weekCount++;
            });

            setStats({
              total: allLogs.length,
              month: monthCount,
              week: weekCount,
            });
          }
        } catch {
          // fallback
        } finally {
          if (active) setIsLoading(false);
        }
      };

      loadData();
      return () => { active = false; };
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting header */}
          <View style={styles.heroSection}>
            <Text variant="heading">{greetingText}</Text>
            <Text variant="caption" style={styles.subtitle}>
              {strings.home.subtitle}
            </Text>
          </View>

          {/* Build Workout CTA */}
          <BuildWorkoutCard
            onPress={() => navigation.navigate('BuildWorkout')}
          />

          {/* Active workout banner */}
          {isActive && (
            <Card
               gradient={['rgba(83, 74, 183, 0.12)', 'rgba(83, 74, 183, 0.06)']}
              style={styles.activeIndicator}
              onPress={() => navigation.navigate('ActiveWorkout')}
            >
              <View style={styles.activeRow}>
                <View style={styles.pulseDot} />
                <Text variant="caption" weight="semibold" color={colors.accent}>
                  {strings.home.activeWorkoutBanner}
                </Text>
              </View>
            </Card>
          )}

          {/* Weekly Stats */}
          <WeeklyStats
            totalWorkouts={stats.total}
            monthWorkouts={stats.month}
            weekWorkouts={stats.week}
            isLoading={isLoading}
          />

          {/* My Custom Workouts */}
          <MyWorkouts />

          {/* Workout History */}
          <WorkoutHistory
            logs={logs}
            isLoading={isLoading}
          />
        </ScrollView>
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
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  heroSection: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  activeIndicator: {
    borderColor: colors.accentGlow,
    marginBottom: spacing.lg,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
});
