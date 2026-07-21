// Base de dados estática do ProTrack para o Emulador Web
const PREDEFINED_WORKOUTS = [
  {
    id: 'predef-arnold-classic',
    name: 'Arnold Classic',
    image: 'assets/workouts/arnold.png',
    badge: 'LEGENDARY',
    description: 'A lendária divisão de treino de Arnold Schwarzenegger. Foco na Golden Era com superséries antagonistas e alto volume.',
    partitions: [
      {
        name: 'Treino A - Peito e Costas',
        exercises: [
          { name: 'Supino Reto com Barra', muscleGroup: 'Peito', targetSets: 4, targetReps: 10 },
          { name: 'Supino Inclinado com Halteres', muscleGroup: 'Peito', targetSets: 4, targetReps: 10 },
          { name: 'Crucifixo com Halteres', muscleGroup: 'Peito', targetSets: 3, targetReps: 12 },
          { name: 'Barra Fixa', muscleGroup: 'Costas', targetSets: 4, targetReps: 8 },
          { name: 'Remada Curvada com Barra', muscleGroup: 'Costas', targetSets: 4, targetReps: 10 },
          { name: 'Levantamento Terra', muscleGroup: 'Costas', targetSets: 3, targetReps: 8 }
        ]
      },
      {
        name: 'Treino B - Ombros e Braços',
        exercises: [
          { name: 'Desenvolvimento com Barra', muscleGroup: 'Ombros', targetSets: 4, targetReps: 10 },
          { name: 'Elevação Lateral com Halteres', muscleGroup: 'Ombros', targetSets: 4, targetReps: 12 },
          { name: 'Crucifixo Invertido', muscleGroup: 'Costas', targetSets: 3, targetReps: 12 },
          { name: 'Rosca Direta com Barra', muscleGroup: 'Bíceps', targetSets: 4, targetReps: 10 },
          { name: 'Tríceps Testa com Barra', muscleGroup: 'Tríceps', targetSets: 4, targetReps: 10 },
          { name: 'Rosca Alternada com Halteres', muscleGroup: 'Bíceps', targetSets: 3, targetReps: 12 },
          { name: 'Tríceps Pulley no Cabo', muscleGroup: 'Tríceps', targetSets: 3, targetReps: 12 }
        ]
      },
      {
        name: 'Treino C - Pernas',
        exercises: [
          { name: 'Agachamento Livre', muscleGroup: 'Pernas', targetSets: 4, targetReps: 8 },
          { name: 'Leg Press 45°', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Cadeira Extensora', muscleGroup: 'Pernas', targetSets: 3, targetReps: 12 },
          { name: 'Mesa Flexora', muscleGroup: 'Pernas', targetSets: 4, targetReps: 10 },
          { name: 'Stiff com Barra', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Panturrilha em Pé', muscleGroup: 'Pernas', targetSets: 4, targetReps: 15 }
        ]
      }
    ]
  },
  {
    id: 'predef-ronnie-coleman',
    name: 'Ronnie Coleman',
    image: 'assets/workouts/ronnie.png',
    badge: '8X OLYMPIA',
    description: 'O treino do lendário 8x Mr. Olympia. Foco em cargas brutais, exercícios compostos e intensidade máxima. Light weight, baby!',
    partitions: [
      {
        name: 'Treino A - Costas e Bíceps',
        exercises: [
          { name: 'Levantamento Terra', muscleGroup: 'Costas', targetSets: 4, targetReps: 8 },
          { name: 'Remada Curvada com Barra', muscleGroup: 'Costas', targetSets: 4, targetReps: 10 },
          { name: 'Remada Serrote', muscleGroup: 'Costas', targetSets: 3, targetReps: 10 },
          { name: 'Rosca Direta com Barra', muscleGroup: 'Bíceps', targetSets: 4, targetReps: 10 },
          { name: 'Rosca Martelo', muscleGroup: 'Bíceps', targetSets: 3, targetReps: 12 }
        ]
      },
      {
        name: 'Treino B - Peito e Tríceps',
        exercises: [
          { name: 'Supino Reto com Barra', muscleGroup: 'Peito', targetSets: 4, targetReps: 8 },
          { name: 'Supino Inclinado com Halteres', muscleGroup: 'Peito', targetSets: 4, targetReps: 10 },
          { name: 'Crucifixo com Halteres', muscleGroup: 'Peito', targetSets: 3, targetReps: 12 },
          { name: 'Tríceps Testa com Barra', muscleGroup: 'Tríceps', targetSets: 4, targetReps: 10 },
          { name: 'Tríceps Pulley no Cabo', muscleGroup: 'Tríceps', targetSets: 3, targetReps: 12 }
        ]
      },
      {
        name: 'Treino C - Pernas e Ombros',
        exercises: [
          { name: 'Agachamento Livre', muscleGroup: 'Pernas', targetSets: 4, targetReps: 8 },
          { name: 'Leg Press 45°', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Stiff com Barra', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Desenvolvimento com Barra', muscleGroup: 'Ombros', targetSets: 4, targetReps: 10 },
          { name: 'Elevação Lateral com Halteres', muscleGroup: 'Ombros', targetSets: 4, targetReps: 12 }
        ]
      }
    ]
  },
  {
    id: 'predef-frank-zane',
    name: 'Frank Zane Aesthetics',
    image: 'assets/workouts/frank.png',
    badge: 'ESTÉTICA',
    description: 'O treino focado em proporção, simetria e definição estética de Frank Zane, 3x Mr. Olympia. Foco em controle de movimento.',
    partitions: [
      {
        name: 'Treino A - Peito, Ombros e Tríceps',
        exercises: [
          { name: 'Supino Reto com Barra', muscleGroup: 'Peito', targetSets: 4, targetReps: 12 },
          { name: 'Supino Inclinado com Halteres', muscleGroup: 'Peito', targetSets: 4, targetReps: 12 },
          { name: 'Elevação Lateral com Halteres', muscleGroup: 'Ombros', targetSets: 4, targetReps: 15 },
          { name: 'Desenvolvimento com Barra', muscleGroup: 'Ombros', targetSets: 3, targetReps: 12 },
          { name: 'Tríceps Testa com Barra', muscleGroup: 'Tríceps', targetSets: 4, targetReps: 12 },
          { name: 'Tríceps Pulley no Cabo', muscleGroup: 'Tríceps', targetSets: 3, targetReps: 12 }
        ]
      },
      {
        name: 'Treino B - Costas e Bíceps',
        exercises: [
          { name: 'Puxada Frontal no Cabo', muscleGroup: 'Costas', targetSets: 4, targetReps: 12 },
          { name: 'Remada Curvada com Barra', muscleGroup: 'Costas', targetSets: 4, targetReps: 12 },
          { name: 'Crucifixo Invertido', muscleGroup: 'Costas', targetSets: 3, targetReps: 15 },
          { name: 'Rosca Direta com Barra', muscleGroup: 'Bíceps', targetSets: 4, targetReps: 12 },
          { name: 'Rosca Concentrada', muscleGroup: 'Bíceps', targetSets: 3, targetReps: 12 }
        ]
      },
      {
        name: 'Treino C - Pernas e Abdômen',
        exercises: [
          { name: 'Agachamento Livre', muscleGroup: 'Pernas', targetSets: 4, targetReps: 12 },
          { name: 'Leg Press 45°', muscleGroup: 'Pernas', targetSets: 3, targetReps: 12 },
          { name: 'Cadeira Extensora', muscleGroup: 'Pernas', targetSets: 3, targetReps: 15 },
          { name: 'Mesa Flexora', muscleGroup: 'Pernas', targetSets: 4, targetReps: 12 },
          { name: 'Abdominal Crunch', muscleGroup: 'Abdômen', targetSets: 4, targetReps: 25 }
        ]
      }
    ]
  },
  {
    id: 'predef-mike-mentzer',
    name: 'Mike Mentzer Heavy Duty',
    image: 'assets/workouts/mike.png',
    badge: 'HEAVY DUTY',
    description: 'O revolucionário treino Heavy Duty de Mike Mentzer. Foco em baixíssimo volume, intensidade extrema e falha total.',
    partitions: [
      {
        name: 'Treino A - Peito, Costas e Ombros',
        exercises: [
          { name: 'Crucifixo com Halteres', muscleGroup: 'Peito', targetSets: 2, targetReps: 8 },
          { name: 'Supino Inclinado com Halteres', muscleGroup: 'Peito', targetSets: 2, targetReps: 8 },
          { name: 'Pullover com Halter', muscleGroup: 'Peito', targetSets: 2, targetReps: 8 },
          { name: 'Puxada Frontal no Cabo', muscleGroup: 'Costas', targetSets: 2, targetReps: 8 },
          { name: 'Elevação Lateral com Halteres', muscleGroup: 'Ombros', targetSets: 2, targetReps: 10 }
        ]
      },
      {
        name: 'Treino B - Pernas',
        exercises: [
          { name: 'Cadeira Extensora', muscleGroup: 'Pernas', targetSets: 2, targetReps: 10 },
          { name: 'Leg Press 45°', muscleGroup: 'Pernas', targetSets: 2, targetReps: 8 },
          { name: 'Agachamento Livre', muscleGroup: 'Pernas', targetSets: 2, targetReps: 8 },
          { name: 'Mesa Flexora', muscleGroup: 'Pernas', targetSets: 2, targetReps: 8 },
          { name: 'Panturrilha em Pé', muscleGroup: 'Pernas', targetSets: 2, targetReps: 12 }
        ]
      },
      {
        name: 'Treino C - Braços e Abdômen',
        exercises: [
          { name: 'Rosca Direta com Barra', muscleGroup: 'Bíceps', targetSets: 2, targetReps: 8 },
          { name: 'Tríceps Pulley no Cabo', muscleGroup: 'Tríceps', targetSets: 2, targetReps: 8 },
          { name: 'Tríceps Mergulho no Banco', muscleGroup: 'Tríceps', targetSets: 2, targetReps: 10 },
          { name: 'Abdominal Crunch', muscleGroup: 'Abdômen', targetSets: 3, targetReps: 15 }
        ]
      }
    ]
  },
  {
    id: 'predef-ppl',
    name: 'Push Pull Legs (PPL)',
    image: 'assets/workouts/ppl.png',
    badge: 'POPULAR',
    description: 'Divisão clássica focada em padrões de movimento (Empurrar, Puxar, Pernas). Altamente eficiente para hipertrofia.',
    partitions: [
      {
        name: 'Treino A - Push',
        exercises: [
          { name: 'Supino Reto com Barra', muscleGroup: 'Peito', targetSets: 4, targetReps: 8 },
          { name: 'Supino Inclinado com Halteres', muscleGroup: 'Peito', targetSets: 3, targetReps: 10 },
          { name: 'Desenvolvimento com Barra', muscleGroup: 'Ombros', targetSets: 3, targetReps: 10 },
          { name: 'Elevação Lateral com Halteres', muscleGroup: 'Ombros', targetSets: 4, targetReps: 12 },
          { name: 'Tríceps Testa com Barra', muscleGroup: 'Tríceps', targetSets: 3, targetReps: 10 }
        ]
      },
      {
        name: 'Treino B - Pull',
        exercises: [
          { name: 'Barra Fixa', muscleGroup: 'Costas', targetSets: 3, targetReps: 8 },
          { name: 'Remada Curvada com Barra', muscleGroup: 'Costas', targetSets: 4, targetReps: 8 },
          { name: 'Puxada Triângulo', muscleGroup: 'Costas', targetSets: 3, targetReps: 10 },
          { name: 'Rosca Scott', muscleGroup: 'Bíceps', targetSets: 3, targetReps: 10 }
        ]
      },
      {
        name: 'Treino C - Legs',
        exercises: [
          { name: 'Agachamento Livre', muscleGroup: 'Pernas', targetSets: 4, targetReps: 8 },
          { name: 'Leg Press 45°', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Mesa Flexora', muscleGroup: 'Pernas', targetSets: 4, targetReps: 10 },
          { name: 'Panturrilha em Pé', muscleGroup: 'Pernas', targetSets: 4, targetReps: 15 }
        ]
      }
    ]
  },
  {
    id: 'predef-full-body',
    name: 'Full Body 3x',
    image: 'assets/workouts/full_body.png',
    badge: 'INICIANTE',
    description: 'Treino de corpo inteiro ideal para iniciantes ou para quem tem pouca disponibilidade na semana.',
    partitions: [
      {
        name: 'Treino Único',
        exercises: [
          { name: 'Agachamento Livre', muscleGroup: 'Pernas', targetSets: 3, targetReps: 10 },
          { name: 'Supino Reto com Barra', muscleGroup: 'Peito', targetSets: 3, targetReps: 10 },
          { name: 'Remada Curvada com Barra', muscleGroup: 'Costas', targetSets: 3, targetReps: 10 },
          { name: 'Desenvolvimento com Barra', muscleGroup: 'Ombros', targetSets: 3, targetReps: 10 },
          { name: 'Rosca Direta com Barra', muscleGroup: 'Bíceps', targetSets: 3, targetReps: 10 }
        ]
      }
    ]
  }
];

const EXERCISES_CATALOG = [
  { id: '1', name: 'Supino Reto com Barra', muscle_group: 'Peito' },
  { id: '2', name: 'Supino Inclinado com Halteres', muscle_group: 'Peito' },
  { id: '3', name: 'Crucifixo com Halteres', muscle_group: 'Peito' },
  { id: '4', name: 'Cross-over no Cabo', muscle_group: 'Peito' },
  { id: '5', name: 'Pullover com Halter', muscle_group: 'Peito' },
  { id: '6', name: 'Agachamento Livre', muscle_group: 'Pernas' },
  { id: '7', name: 'Leg Press 45°', muscle_group: 'Pernas' },
  { id: '8', name: 'Cadeira Extensora', muscle_group: 'Pernas' },
  { id: '9', name: 'Mesa Flexora', muscle_group: 'Pernas' },
  { id: '10', name: 'Stiff com Barra', muscle_group: 'Pernas' },
  { id: '11', name: 'Panturrilha em Pé', muscle_group: 'Pernas' },
  { id: '12', name: 'Levantamento Terra', muscle_group: 'Costas' },
  { id: '13', name: 'Barra Fixa', muscle_group: 'Costas' },
  { id: '14', name: 'Remada Curvada com Barra', muscle_group: 'Costas' },
  { id: '15', name: 'Remada Serrote', muscle_group: 'Costas' },
  { id: '16', name: 'Puxada Frontal no Cabo', muscle_group: 'Costas' },
  { id: '17', name: 'Crucifixo Invertido', muscle_group: 'Costas' },
  { id: '18', name: 'Desenvolvimento com Barra', muscle_group: 'Ombros' },
  { id: '19', name: 'Elevação Lateral com Halteres', muscle_group: 'Ombros' },
  { id: '20', name: 'Elevação Frontal com Halteres', muscle_group: 'Ombros' },
  { id: '21', name: 'Rosca Direta com Barra', muscle_group: 'Bíceps' },
  { id: '22', name: 'Rosca Alternada com Halteres', muscle_group: 'Bíceps' },
  { id: '23', name: 'Rosca Martelo', muscle_group: 'Bíceps' },
  { id: '24', name: 'Rosca Scott', muscle_group: 'Bíceps' },
  { id: '25', name: 'Rosca Concentrada', muscle_group: 'Bíceps' },
  { id: '26', name: 'Tríceps Testa com Barra', muscle_group: 'Tríceps' },
  { id: '27', name: 'Tríceps Pulley no Cabo', muscle_group: 'Tríceps' },
  { id: '28', name: 'Tríceps Mergulho no Banco', muscle_group: 'Tríceps' },
  { id: '29', name: 'Abdominal Crunch', muscle_group: 'Abdômen' },
  { id: '30', name: 'Prancha Isométrica', muscle_group: 'Abdômen' }
];
