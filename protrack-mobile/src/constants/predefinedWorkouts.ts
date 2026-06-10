import { ImageSourcePropType } from 'react-native';

export interface PredefinedExercise {
  name: string;
  muscleGroup: string;
  targetSets: number;
  targetReps: number;
}

export interface PredefinedPartition {
  name: string;
  exercises: PredefinedExercise[];
}

export interface PredefinedWorkout {
  id: string;
  name: string;
  image: ImageSourcePropType;
  description: string;
  partitions: PredefinedPartition[];
}

export const predefinedWorkouts: PredefinedWorkout[] = [
  {
    id: 'predef-full-body',
    name: 'Full Body',
    image: require('../../assets/workouts/full_body.png'),
    description:
      'Treino de corpo inteiro ideal para iniciantes ou para quem tem pouca disponibilidade na semana.',
    partitions: [
      {
        name: 'Treino Único',
        exercises: [
          { name: 'Agachamento Livre', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Supino Reto com Barra', muscleGroup: 'Peito', targetSets: 3, targetReps: 10 },
          {
            name: 'Remada Curvada com Barra',
            muscleGroup: 'Costas',
            targetSets: 3,
            targetReps: 10,
          },
          {
            name: 'Desenvolvimento com Barra',
            muscleGroup: 'Ombros',
            targetSets: 3,
            targetReps: 10,
          },
          { name: 'Rosca Direta com Barra', muscleGroup: 'Bíceps', targetSets: 3, targetReps: 10 },
          { name: 'Tríceps Pulley no Cabo', muscleGroup: 'Tríceps', targetSets: 3, targetReps: 10 },
        ],
      },
    ],
  },
  {
    id: 'predef-ppl',
    name: 'Push Pull Legs (PPL)',
    image: require('../../assets/workouts/ppl.png'),
    description:
      'Divisão clássica focada em padrões de movimento (Empurrar, Puxar, Pernas). Altamente eficiente para hipertrofia.',
    partitions: [
      {
        name: 'Treino A - Push',
        exercises: [
          { name: 'Supino Reto com Barra', muscleGroup: 'Peito', targetSets: 4, targetReps: 8 },
          {
            name: 'Supino Inclinado com Halteres',
            muscleGroup: 'Peito',
            targetSets: 3,
            targetReps: 10,
          },
          {
            name: 'Desenvolvimento com Barra',
            muscleGroup: 'Ombros',
            targetSets: 3,
            targetReps: 10,
          },
          {
            name: 'Elevação Lateral com Halteres',
            muscleGroup: 'Ombros',
            targetSets: 4,
            targetReps: 12,
          },
          {
            name: 'Tríceps Testa com Barra',
            muscleGroup: 'Tríceps',
            targetSets: 3,
            targetReps: 10,
          },
          { name: 'Tríceps Pulley no Cabo', muscleGroup: 'Tríceps', targetSets: 3, targetReps: 12 },
        ],
      },
      {
        name: 'Treino B - Pull',
        exercises: [
          { name: 'Barra Fixa', muscleGroup: 'Costas', targetSets: 3, targetReps: 8 },
          { name: 'Remada Curvada com Barra', muscleGroup: 'Costas', targetSets: 4, targetReps: 8 },
          { name: 'Puxada Triângulo', muscleGroup: 'Costas', targetSets: 3, targetReps: 10 },
          { name: 'Crucifixo Invertido', muscleGroup: 'Costas', targetSets: 3, targetReps: 12 },
          { name: 'Rosca Scott', muscleGroup: 'Bíceps', targetSets: 3, targetReps: 10 },
          { name: 'Rosca Martelo', muscleGroup: 'Bíceps', targetSets: 3, targetReps: 12 },
        ],
      },
      {
        name: 'Treino C - Legs',
        exercises: [
          { name: 'Agachamento Livre', muscleGroup: 'Pernas', targetSets: 4, targetReps: 8 },
          { name: 'Leg Press 45°', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Cadeira Extensora', muscleGroup: 'Pernas', targetSets: 3, targetReps: 12 },
          { name: 'Mesa Flexora', muscleGroup: 'Pernas', targetSets: 4, targetReps: 10 },
          { name: 'Stiff com Barra', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Panturrilha em Pé', muscleGroup: 'Pernas', targetSets: 4, targetReps: 15 },
        ],
      },
    ],
  },
  {
    id: 'predef-upper-lower',
    name: 'Upper / Lower',
    image: require('../../assets/workouts/upper_lower.png'),
    description:
      'Divisão de treino alternando entre membros superiores e membros inferiores. Excelente equilíbrio e recuperação.',
    partitions: [
      {
        name: 'Treino A - Upper',
        exercises: [
          { name: 'Supino Reto com Barra', muscleGroup: 'Peito', targetSets: 4, targetReps: 8 },
          { name: 'Remada Curvada com Barra', muscleGroup: 'Costas', targetSets: 4, targetReps: 8 },
          {
            name: 'Desenvolvimento com Barra',
            muscleGroup: 'Ombros',
            targetSets: 3,
            targetReps: 10,
          },
          { name: 'Puxada Frontal no Cabo', muscleGroup: 'Costas', targetSets: 3, targetReps: 10 },
          {
            name: 'Elevação Lateral com Halteres',
            muscleGroup: 'Ombros',
            targetSets: 3,
            targetReps: 12,
          },
          {
            name: 'Rosca Alternada com Halteres',
            muscleGroup: 'Bíceps',
            targetSets: 3,
            targetReps: 10,
          },
          { name: 'Tríceps Pulley no Cabo', muscleGroup: 'Tríceps', targetSets: 3, targetReps: 10 },
        ],
      },
      {
        name: 'Treino B - Lower',
        exercises: [
          { name: 'Agachamento Livre', muscleGroup: 'Pernas', targetSets: 4, targetReps: 8 },
          { name: 'Leg Press 45°', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Stiff com Barra', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Cadeira Extensora', muscleGroup: 'Pernas', targetSets: 3, targetReps: 12 },
          { name: 'Mesa Flexora', muscleGroup: 'Pernas', targetSets: 3, targetReps: 12 },
          { name: 'Elevação Pélvica', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Panturrilha em Pé', muscleGroup: 'Pernas', targetSets: 4, targetReps: 15 },
        ],
      },
    ],
  },
  {
    id: 'predef-abc',
    name: 'ABC (3 dias)',
    image: require('../../assets/workouts/abc.png'),
    description:
      'A divisão clássica de academia dividida em 3 partes. Foco equilibrado em todos os grupos musculares principais.',
    partitions: [
      {
        name: 'Treino A - Peito / Ombros / Tríceps',
        exercises: [
          { name: 'Supino Reto com Barra', muscleGroup: 'Peito', targetSets: 4, targetReps: 8 },
          {
            name: 'Supino Inclinado com Halteres',
            muscleGroup: 'Peito',
            targetSets: 3,
            targetReps: 10,
          },
          { name: 'Crucifixo com Halteres', muscleGroup: 'Peito', targetSets: 3, targetReps: 12 },
          {
            name: 'Desenvolvimento com Barra',
            muscleGroup: 'Ombros',
            targetSets: 3,
            targetReps: 10,
          },
          {
            name: 'Elevação Lateral com Halteres',
            muscleGroup: 'Ombros',
            targetSets: 3,
            targetReps: 12,
          },
          {
            name: 'Tríceps Testa com Barra',
            muscleGroup: 'Tríceps',
            targetSets: 3,
            targetReps: 10,
          },
          { name: 'Tríceps Pulley no Cabo', muscleGroup: 'Tríceps', targetSets: 3, targetReps: 12 },
        ],
      },
      {
        name: 'Treino B - Costas / Bíceps / Abdômen',
        exercises: [
          { name: 'Barra Fixa', muscleGroup: 'Costas', targetSets: 3, targetReps: 8 },
          { name: 'Remada Curvada com Barra', muscleGroup: 'Costas', targetSets: 4, targetReps: 8 },
          {
            name: 'Remada Unilateral com Halter',
            muscleGroup: 'Costas',
            targetSets: 3,
            targetReps: 10,
          },
          { name: 'Rosca Direta com Barra', muscleGroup: 'Bíceps', targetSets: 3, targetReps: 10 },
          {
            name: 'Rosca Alternada com Halteres',
            muscleGroup: 'Bíceps',
            targetSets: 3,
            targetReps: 10,
          },
          { name: 'Abdominal Crunch', muscleGroup: 'Abdômen', targetSets: 3, targetReps: 15 },
          { name: 'Prancha', muscleGroup: 'Abdômen', targetSets: 3, targetReps: 60 },
        ],
      },
      {
        name: 'Treino C - Pernas',
        exercises: [
          { name: 'Agachamento Livre', muscleGroup: 'Pernas', targetSets: 4, targetReps: 8 },
          { name: 'Leg Press 45°', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Cadeira Extensora', muscleGroup: 'Pernas', targetSets: 3, targetReps: 12 },
          { name: 'Mesa Flexora', muscleGroup: 'Pernas', targetSets: 3, targetReps: 12 },
          { name: 'Stiff com Barra', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Panturrilha em Pé', muscleGroup: 'Pernas', targetSets: 4, targetReps: 15 },
        ],
      },
    ],
  },
  {
    id: 'predef-abcde',
    name: 'ABCDE (5 dias)',
    image: require('../../assets/workouts/abcde.png'),
    description:
      'Divisão de alta frequência semanal onde cada dia é dedicado a um grupo muscular principal. Permite estímulos de alta intensidade.',
    partitions: [
      {
        name: 'Treino A - Peito',
        exercises: [
          { name: 'Supino Reto com Barra', muscleGroup: 'Peito', targetSets: 4, targetReps: 8 },
          {
            name: 'Supino Inclinado com Halteres',
            muscleGroup: 'Peito',
            targetSets: 3,
            targetReps: 10,
          },
          { name: 'Crucifixo com Halteres', muscleGroup: 'Peito', targetSets: 3, targetReps: 12 },
          { name: 'Cross-over no Cabo', muscleGroup: 'Peito', targetSets: 3, targetReps: 12 },
          { name: 'Pullover com Halter', muscleGroup: 'Peito', targetSets: 3, targetReps: 10 },
        ],
      },
      {
        name: 'Treino B - Costas',
        exercises: [
          { name: 'Levantamento Terra', muscleGroup: 'Costas', targetSets: 4, targetReps: 6 },
          { name: 'Barra Fixa', muscleGroup: 'Costas', targetSets: 3, targetReps: 8 },
          {
            name: 'Remada Curvada com Barra',
            muscleGroup: 'Costas',
            targetSets: 3,
            targetReps: 10,
          },
          { name: 'Puxada Triângulo', muscleGroup: 'Costas', targetSets: 3, targetReps: 12 },
          { name: 'Remada Serrote', muscleGroup: 'Costas', targetSets: 3, targetReps: 10 },
        ],
      },
      {
        name: 'Treino C - Pernas',
        exercises: [
          { name: 'Agachamento Livre', muscleGroup: 'Pernas', targetSets: 4, targetReps: 8 },
          { name: 'Leg Press 45°', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Agachamento Búlgaro', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Cadeira Extensora', muscleGroup: 'Pernas', targetSets: 3, targetReps: 12 },
          { name: 'Mesa Flexora', muscleGroup: 'Pernas', targetSets: 4, targetReps: 10 },
          { name: 'Panturrilha em Pé', muscleGroup: 'Pernas', targetSets: 4, targetReps: 15 },
        ],
      },
      {
        name: 'Treino D - Ombros',
        exercises: [
          {
            name: 'Desenvolvimento com Barra',
            muscleGroup: 'Ombros',
            targetSets: 4,
            targetReps: 8,
          },
          {
            name: 'Elevação Lateral com Halteres',
            muscleGroup: 'Ombros',
            targetSets: 4,
            targetReps: 12,
          },
          {
            name: 'Elevação Frontal com Halteres',
            muscleGroup: 'Ombros',
            targetSets: 3,
            targetReps: 10,
          },
          { name: 'Face Pull no Cabo', muscleGroup: 'Ombros', targetSets: 3, targetReps: 12 },
          {
            name: 'Encolhimento de Ombros (Shrug)',
            muscleGroup: 'Ombros',
            targetSets: 4,
            targetReps: 12,
          },
        ],
      },
      {
        name: 'Treino E - Braços / Abdômen',
        exercises: [
          { name: 'Rosca Direta com Barra', muscleGroup: 'Bíceps', targetSets: 3, targetReps: 10 },
          {
            name: 'Rosca Alternada com Halteres',
            muscleGroup: 'Bíceps',
            targetSets: 3,
            targetReps: 10,
          },
          {
            name: 'Tríceps Testa com Barra',
            muscleGroup: 'Tríceps',
            targetSets: 3,
            targetReps: 10,
          },
          { name: 'Tríceps Pulley no Cabo', muscleGroup: 'Tríceps', targetSets: 3, targetReps: 12 },
          { name: 'Rosca Martelo', muscleGroup: 'Bíceps', targetSets: 3, targetReps: 12 },
          { name: 'Abdominal Crunch', muscleGroup: 'Abdômen', targetSets: 3, targetReps: 15 },
          { name: 'Prancha', muscleGroup: 'Abdômen', targetSets: 3, targetReps: 60 },
        ],
      },
    ],
  },
  {
    id: 'predef-gluteos-pernas',
    name: 'Glúteos & Pernas',
    image: require('../../assets/workouts/gluteos_pernas.png'),
    description:
      'Foco total no desenvolvimento dos membros inferiores, com ênfase em glúteos, quadríceps e posteriores.',
    partitions: [
      {
        name: 'Treino Único',
        exercises: [
          { name: 'Agachamento Búlgaro', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Elevação Pélvica', muscleGroup: 'Pernas', targetSets: 4, targetReps: 12 },
          { name: 'Stiff com Barra', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Leg Press 45°', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Panturrilha em Pé', muscleGroup: 'Pernas', targetSets: 4, targetReps: 15 },
        ],
      },
    ],
  },
  {
    id: 'predef-cardio-core',
    name: 'Cardio & Core',
    image: require('../../assets/workouts/cardio_core.png'),
    description:
      'Fortalecimento do abdômen aliado a estímulos cardiovasculares para melhora do condicionamento físico.',
    partitions: [
      {
        name: 'Treino Único',
        exercises: [
          { name: 'Prancha', muscleGroup: 'Abdômen', targetSets: 3, targetReps: 60 },
          { name: 'Abdominal Crunch', muscleGroup: 'Abdômen', targetSets: 3, targetReps: 15 },
          { name: 'Agachamento Livre', muscleGroup: 'Pernas', targetSets: 3, targetReps: 15 },
          { name: 'Elevação Pélvica', muscleGroup: 'Pernas', targetSets: 3, targetReps: 15 },
          {
            name: 'Tríceps Mergulho no Banco',
            muscleGroup: 'Tríceps',
            targetSets: 3,
            targetReps: 20,
          },
        ],
      },
    ],
  },
  {
    id: 'predef-superiores-vtaper',
    name: 'Superiores (V-Taper)',
    image: require('../../assets/workouts/superiores_vtaper.png'),
    description:
      'Foco em desenvolver ombros largos e costas densas, criando a clássica e harmônica estética em V.',
    partitions: [
      {
        name: 'Treino Único',
        exercises: [
          { name: 'Barra Fixa', muscleGroup: 'Costas', targetSets: 3, targetReps: 8 },
          {
            name: 'Desenvolvimento com Barra',
            muscleGroup: 'Ombros',
            targetSets: 3,
            targetReps: 10,
          },
          { name: 'Puxada Triângulo', muscleGroup: 'Costas', targetSets: 3, targetReps: 10 },
          {
            name: 'Elevação Lateral com Halteres',
            muscleGroup: 'Ombros',
            targetSets: 4,
            targetReps: 12,
          },
          { name: 'Crucifixo Invertido', muscleGroup: 'Ombros', targetSets: 3, targetReps: 12 },
        ],
      },
    ],
  },
  {
    id: 'predef-forca-maxima',
    name: 'Força Máxima',
    image: require('../../assets/workouts/forca_maxima.png'),
    description:
      'Treino estruturado para o ganho de força bruta focado nos três grandes levantamentos da musculação.',
    partitions: [
      {
        name: 'Treino Único',
        exercises: [
          { name: 'Levantamento Terra', muscleGroup: 'Costas', targetSets: 4, targetReps: 5 },
          { name: 'Supino Reto com Barra', muscleGroup: 'Peito', targetSets: 4, targetReps: 5 },
          { name: 'Agachamento Livre', muscleGroup: 'Pernas', targetSets: 4, targetReps: 5 },
          { name: 'Stiff com Barra', muscleGroup: 'Pernas', targetSets: 3, targetReps: 8 },
        ],
      },
    ],
  },
  {
    id: 'predef-arm-day',
    name: 'Especial de Braços',
    image: require('../../assets/workouts/arm_day.png'),
    description:
      'Treino focado em bíceps e tríceps para pump máximo, hipertrofia e definição dos braços.',
    partitions: [
      {
        name: 'Treino Único',
        exercises: [
          { name: 'Rosca Direta com Barra', muscleGroup: 'Bíceps', targetSets: 3, targetReps: 10 },
          {
            name: 'Tríceps Testa com Barra',
            muscleGroup: 'Tríceps',
            targetSets: 3,
            targetReps: 10,
          },
          {
            name: 'Rosca Alternada com Halteres',
            muscleGroup: 'Bíceps',
            targetSets: 3,
            targetReps: 10,
          },
          { name: 'Tríceps Pulley no Cabo', muscleGroup: 'Tríceps', targetSets: 3, targetReps: 12 },
          { name: 'Rosca Martelo', muscleGroup: 'Bíceps', targetSets: 3, targetReps: 12 },
        ],
      },
    ],
  },
  {
    id: 'predef-arnold-classic',
    name: 'Arnold Classic',
    image: require('../../assets/workouts/arnold.png'),
    description:
      'A lendária divisão de treino de Arnold Schwarzenegger. Foco na Golden Era com superséries antagonistas e alto volume.',
    partitions: [
      {
        name: 'Treino A - Peito e Costas',
        exercises: [
          { name: 'Supino Reto com Barra', muscleGroup: 'Peito', targetSets: 4, targetReps: 10 },
          {
            name: 'Supino Inclinado com Halteres',
            muscleGroup: 'Peito',
            targetSets: 4,
            targetReps: 10,
          },
          { name: 'Crucifixo com Halteres', muscleGroup: 'Peito', targetSets: 3, targetReps: 12 },
          { name: 'Barra Fixa', muscleGroup: 'Costas', targetSets: 4, targetReps: 8 },
          {
            name: 'Remada Curvada com Barra',
            muscleGroup: 'Costas',
            targetSets: 4,
            targetReps: 10,
          },
          { name: 'Levantamento Terra', muscleGroup: 'Costas', targetSets: 3, targetReps: 8 },
        ],
      },
      {
        name: 'Treino B - Ombros e Braços',
        exercises: [
          {
            name: 'Desenvolvimento com Barra',
            muscleGroup: 'Ombros',
            targetSets: 4,
            targetReps: 10,
          },
          {
            name: 'Elevação Lateral com Halteres',
            muscleGroup: 'Ombros',
            targetSets: 4,
            targetReps: 12,
          },
          { name: 'Crucifixo Invertido', muscleGroup: 'Costas', targetSets: 3, targetReps: 12 },
          { name: 'Rosca Direta com Barra', muscleGroup: 'Bíceps', targetSets: 4, targetReps: 10 },
          {
            name: 'Tríceps Testa com Barra',
            muscleGroup: 'Tríceps',
            targetSets: 4,
            targetReps: 10,
          },
          {
            name: 'Rosca Alternada com Halteres',
            muscleGroup: 'Bíceps',
            targetSets: 3,
            targetReps: 12,
          },
          { name: 'Tríceps Pulley no Cabo', muscleGroup: 'Tríceps', targetSets: 3, targetReps: 12 },
        ],
      },
      {
        name: 'Treino C - Pernas',
        exercises: [
          { name: 'Agachamento Livre', muscleGroup: 'Pernas', targetSets: 4, targetReps: 8 },
          { name: 'Leg Press 45°', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Cadeira Extensora', muscleGroup: 'Pernas', targetSets: 3, targetReps: 12 },
          { name: 'Mesa Flexora', muscleGroup: 'Pernas', targetSets: 4, targetReps: 10 },
          { name: 'Stiff com Barra', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Panturrilha em Pé', muscleGroup: 'Pernas', targetSets: 4, targetReps: 15 },
        ],
      },
    ],
  },
  {
    id: 'predef-ronnie-coleman',
    name: 'Ronnie Coleman',
    image: require('../../assets/workouts/ronnie.png'),
    description:
      'O treino do lendário 8x Mr. Olympia. Foco em cargas brutais, exercícios compostos e intensidade máxima. Light weight, baby!',
    partitions: [
      {
        name: 'Treino A - Costas e Bíceps',
        exercises: [
          { name: 'Levantamento Terra', muscleGroup: 'Costas', targetSets: 4, targetReps: 8 },
          {
            name: 'Remada Curvada com Barra',
            muscleGroup: 'Costas',
            targetSets: 4,
            targetReps: 10,
          },
          { name: 'Remada Serrote', muscleGroup: 'Costas', targetSets: 3, targetReps: 10 },
          { name: 'Rosca Direta com Barra', muscleGroup: 'Bíceps', targetSets: 4, targetReps: 10 },
          { name: 'Rosca Martelo', muscleGroup: 'Bíceps', targetSets: 3, targetReps: 12 },
        ],
      },
      {
        name: 'Treino B - Peito e Tríceps',
        exercises: [
          { name: 'Supino Reto com Barra', muscleGroup: 'Peito', targetSets: 4, targetReps: 8 },
          {
            name: 'Supino Inclinado com Halteres',
            muscleGroup: 'Peito',
            targetSets: 4,
            targetReps: 10,
          },
          { name: 'Crucifixo com Halteres', muscleGroup: 'Peito', targetSets: 3, targetReps: 12 },
          {
            name: 'Tríceps Testa com Barra',
            muscleGroup: 'Tríceps',
            targetSets: 4,
            targetReps: 10,
          },
          { name: 'Tríceps Pulley no Cabo', muscleGroup: 'Tríceps', targetSets: 3, targetReps: 12 },
        ],
      },
      {
        name: 'Treino C - Pernas e Ombros',
        exercises: [
          { name: 'Agachamento Livre', muscleGroup: 'Pernas', targetSets: 4, targetReps: 8 },
          { name: 'Leg Press 45°', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Stiff com Barra', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          {
            name: 'Desenvolvimento com Barra',
            muscleGroup: 'Ombros',
            targetSets: 4,
            targetReps: 10,
          },
          {
            name: 'Elevação Lateral com Halteres',
            muscleGroup: 'Ombros',
            targetSets: 4,
            targetReps: 12,
          },
        ],
      },
    ],
  },
  {
    id: 'predef-frank-zane',
    name: 'Frank Zane',
    image: require('../../assets/workouts/frank.png'),
    description:
      'O treino focado em proporção, simetria e definição estética de Frank Zane, 3x Mr. Olympia. Foco em controle de movimento e conexão mente-músculo.',
    partitions: [
      {
        name: 'Treino A - Peito, Ombros e Tríceps',
        exercises: [
          { name: 'Supino Reto com Barra', muscleGroup: 'Peito', targetSets: 4, targetReps: 12 },
          {
            name: 'Supino Inclinado com Halteres',
            muscleGroup: 'Peito',
            targetSets: 4,
            targetReps: 12,
          },
          {
            name: 'Elevação Lateral com Halteres',
            muscleGroup: 'Ombros',
            targetSets: 4,
            targetReps: 15,
          },
          {
            name: 'Desenvolvimento com Barra',
            muscleGroup: 'Ombros',
            targetSets: 3,
            targetReps: 12,
          },
          {
            name: 'Tríceps Testa com Barra',
            muscleGroup: 'Tríceps',
            targetSets: 4,
            targetReps: 12,
          },
          { name: 'Tríceps Pulley no Cabo', muscleGroup: 'Tríceps', targetSets: 3, targetReps: 12 },
        ],
      },
      {
        name: 'Treino B - Costas e Bíceps',
        exercises: [
          { name: 'Puxada Frontal no Cabo', muscleGroup: 'Costas', targetSets: 4, targetReps: 12 },
          {
            name: 'Remada Curvada com Barra',
            muscleGroup: 'Costas',
            targetSets: 4,
            targetReps: 12,
          },
          { name: 'Crucifixo Invertido', muscleGroup: 'Costas', targetSets: 3, targetReps: 15 },
          { name: 'Rosca Direta com Barra', muscleGroup: 'Bíceps', targetSets: 4, targetReps: 12 },
          {
            name: 'Rosca Concentrada',
            muscleGroup: 'Bíceps',
            targetSets: 3,
            targetReps: 12,
          },
        ],
      },
      {
        name: 'Treino C - Pernas e Abdômen',
        exercises: [
          { name: 'Agachamento Livre', muscleGroup: 'Pernas', targetSets: 4, targetReps: 12 },
          { name: 'Leg Press 45°', muscleGroup: 'Pernas', targetSets: 3, targetReps: 12 },
          { name: 'Cadeira Extensora', muscleGroup: 'Pernas', targetSets: 3, targetReps: 15 },
          { name: 'Mesa Flexora', muscleGroup: 'Pernas', targetSets: 4, targetReps: 12 },
          { name: 'Abdominal Crunch', muscleGroup: 'Abdômen', targetSets: 4, targetReps: 25 },
        ],
      },
    ],
  },
  {
    id: 'predef-mike-mentzer',
    name: 'Mike Mentzer Heavy Duty',
    image: require('../../assets/workouts/mike.png'),
    description:
      'O revolucionário treino Heavy Duty de Mike Mentzer. Foco em baixíssimo volume, intensidade extrema levada até a falha total e tempo máximo de recuperação.',
    partitions: [
      {
        name: 'Treino A - Peito, Costas e Ombros',
        exercises: [
          { name: 'Crucifixo com Halteres', muscleGroup: 'Peito', targetSets: 2, targetReps: 8 },
          {
            name: 'Supino Inclinado com Halteres',
            muscleGroup: 'Peito',
            targetSets: 2,
            targetReps: 8,
          },
          { name: 'Pullover com Halter', muscleGroup: 'Peito', targetSets: 2, targetReps: 8 },
          { name: 'Puxada Frontal no Cabo', muscleGroup: 'Costas', targetSets: 2, targetReps: 8 },
          {
            name: 'Elevação Lateral com Halteres',
            muscleGroup: 'Ombros',
            targetSets: 2,
            targetReps: 10,
          },
        ],
      },
      {
        name: 'Treino B - Pernas',
        exercises: [
          { name: 'Cadeira Extensora', muscleGroup: 'Pernas', targetSets: 2, targetReps: 10 },
          { name: 'Leg Press 45°', muscleGroup: 'Pernas', targetSets: 2, targetReps: 8 },
          { name: 'Agachamento Livre', muscleGroup: 'Pernas', targetSets: 2, targetReps: 8 },
          { name: 'Mesa Flexora', muscleGroup: 'Pernas', targetSets: 2, targetReps: 8 },
          { name: 'Panturrilha em Pé', muscleGroup: 'Pernas', targetSets: 2, targetReps: 12 },
        ],
      },
      {
        name: 'Treino C - Braços e Abdômen',
        exercises: [
          { name: 'Rosca Direta com Barra', muscleGroup: 'Bíceps', targetSets: 2, targetReps: 8 },
          { name: 'Tríceps Pulley no Cabo', muscleGroup: 'Tríceps', targetSets: 2, targetReps: 8 },
          {
            name: 'Tríceps Mergulho no Banco',
            muscleGroup: 'Tríceps',
            targetSets: 2,
            targetReps: 10,
          },
          { name: 'Abdominal Crunch', muscleGroup: 'Abdômen', targetSets: 3, targetReps: 15 },
        ],
      },
    ],
  },
];
