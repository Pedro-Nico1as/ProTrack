import { predefinedWorkouts } from '../../../protrack-mobile/src/constants/predefinedWorkouts';

const GLOBAL_EXERCISE_NAMES = [
  'Supino Reto com Barra',
  'Supino Inclinado com Halteres',
  'Crucifixo com Halteres',
  'Cross-over no Cabo',
  'Supino Inclinado com Barra',
  'Pullover com Halter',
  'Agachamento Livre',
  'Leg Press 45°',
  'Cadeira Extensora',
  'Mesa Flexora',
  'Stiff com Barra',
  'Agachamento Sumô',
  'Elevação Pélvica',
  'Panturrilha em Pé',
  'Hack Squat',
  'Avanço com Halteres',
  'Agachamento Búlgaro',
  'Cadeira Adutora',
  'Cadeira Abdutora',
  'Levantamento Terra',
  'Barra Fixa',
  'Remada Curvada com Barra',
  'Remada Unilateral com Halter',
  'Puxada Frontal no Cabo',
  'Crucifixo Invertido',
  'Remada Serrote',
  'Puxada Triângulo',
  'Desenvolvimento com Barra',
  'Elevação Lateral com Halteres',
  'Elevação Frontal com Halteres',
  'Encolhimento de Ombros (Shrug)',
  'Elevação Lateral no Cabo',
  'Face Pull no Cabo',
  'Rosca Direta com Barra',
  'Rosca Alternada com Halteres',
  'Rosca Martelo',
  'Rosca Scott',
  'Rosca Concentrada',
  'Rosca no Cabo',
  'Tríceps Testa com Barra',
  'Tríceps Pulley no Cabo',
  'Mergulho em Barras Paralelas',
  'Tríceps Francês com Halter',
  'Tríceps Mergulho no Banco',
  'Abdominal Crunch',
  'Prancha'
];

describe('Predefined Workouts Integrity', () => {
  it('should have predefined workouts with non-empty metadata', () => {
    expect(predefinedWorkouts.length).toBeGreaterThan(0);
    predefinedWorkouts.forEach((workout) => {
      expect(workout.id).toBeTruthy();
      expect(workout.name).toBeTruthy();
      expect(workout.description).toBeTruthy();
      expect(workout.image).toBeTruthy();
      expect(workout.partitions.length).toBeGreaterThan(0);
    });
  });

  it('should only feature exercises that exist in the global catalog to avoid foreign key violations', () => {
    predefinedWorkouts.forEach((workout) => {
      workout.partitions.forEach((partition) => {
        partition.exercises.forEach((exercise) => {
          const matched = GLOBAL_EXERCISE_NAMES.includes(exercise.name);
          if (!matched) {
            console.error(`Mismatch found in workout "${workout.name}" > partition "${partition.name}": "${exercise.name}"`);
          }
          expect(GLOBAL_EXERCISE_NAMES).toContain(exercise.name);
        });
      });
    });
  });
});
