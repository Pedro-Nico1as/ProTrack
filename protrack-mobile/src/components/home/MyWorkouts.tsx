import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, sizing } from '../../theme/tokens';
import { Text } from '../core/Text';
import { Button } from '../core/Button';
import { useCustomWorkoutsStore } from '../../stores/useCustomWorkoutsStore';
import { RootStackParamList } from '../../navigation/types';
import { strings } from '../../constants/strings';

export const MyWorkouts = () => {
  const { workouts } = useCustomWorkoutsStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (workouts.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text variant="label" style={styles.sectionTitle}>{strings.myWorkouts.title}</Text>
      
      <View style={styles.list}>
        {workouts.map((workout) => (
          <View key={workout.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="flash" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="semibold">{workout.name}</Text>
                <Text variant="caption" color={colors.textMuted}>
                  {workout.partitions?.length || 0} {(workout.partitions?.length === 1) ? strings.myWorkouts.sheetSingular : strings.myWorkouts.sheetPlural}
                </Text>
              </View>
              <Button
                title={strings.myWorkouts.editBtn}
                variant="outline"
                onPress={() => navigation.navigate('EditWorkout', { workoutId: workout.id })}
                style={styles.editBtn}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
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
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(83, 74, 183, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    paddingHorizontal: spacing.sm,
    height: 40,
  },
});
