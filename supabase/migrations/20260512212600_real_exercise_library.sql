-- Migration: 20260512212600_real_exercise_library.sql
-- Description: Substitui dados de seed placeholders por uma biblioteca curada gigante
--              com 46 exercícios fornecidos pelo usuário via links youtube.
-- Rollback: DELETE FROM public.exercises;

-- Limpa os dados de seed antigos para evitar duplicatas
DELETE FROM public.exercises;

-- Insere a biblioteca curada com vídeos reais verificados
INSERT INTO public.exercises (name, muscle_group, youtube_video_id, instructions, equipment, thumbnail_url, description)
VALUES
-- PEITO
('Supino Reto com Barra', 'Peito', '50RSzhMG5Hc', 'Execução padrão', ARRAY['Barra', 'Banco Reto'], 'https://img.youtube.com/vi/50RSzhMG5Hc/hqdefault.jpg', 'Excelente para peitoral maior.'),
('Supino Inclinado com Halteres', 'Peito', 'B9gGcbEdYBQ', 'Execução padrão', ARRAY['Halteres', 'Banco Inclinado'], 'https://img.youtube.com/vi/B9gGcbEdYBQ/hqdefault.jpg', 'Foco no peitoral superior.'),
('Crucifixo com Halteres', 'Peito', 'pU80usRU99Y', 'Execução padrão', ARRAY['Halteres', 'Banco Reto'], 'https://img.youtube.com/vi/pU80usRU99Y/hqdefault.jpg', 'Isolador de peito.'),
('Cross-over no Cabo', 'Peito', 'nuTuKjcQRHg', 'Execução padrão', ARRAY['Polia Alta'], 'https://img.youtube.com/vi/nuTuKjcQRHg/hqdefault.jpg', 'Tensão contínua no peitoral.'),
('Supino Inclinado com Barra', 'Peito', '6jBx5YwAb7E', 'Execução padrão', ARRAY['Barra', 'Banco Inclinado'], 'https://img.youtube.com/vi/6jBx5YwAb7E/hqdefault.jpg', 'Foco peitoral superior com barra.'),
('Pullover com Halter', 'Peito', '1hWxh0WI7lE', 'Execução padrão', ARRAY['Halter', 'Banco Reto'], 'https://img.youtube.com/vi/1hWxh0WI7lE/hqdefault.jpg', 'Trabalha peitoral e dorsais.'),

-- PERNAS
('Agachamento Livre', 'Pernas', 'wzsUfTMPrEg', 'Execução padrão', ARRAY['Barra', 'Rack'], 'https://img.youtube.com/vi/wzsUfTMPrEg/hqdefault.jpg', 'Exercício base para pernas.'),
('Leg Press 45°', 'Pernas', 'lHZUF_s3q9c', 'Execução padrão', ARRAY['Leg Press'], 'https://img.youtube.com/vi/lHZUF_s3q9c/hqdefault.jpg', 'Desenvolvimento de quadríceps.'),
('Cadeira Extensora', 'Pernas', 'y7GhuVphn4s', 'Execução padrão', ARRAY['Máquina'], 'https://img.youtube.com/vi/y7GhuVphn4s/hqdefault.jpg', 'Isolador de quadríceps.'),
('Mesa Flexora', 'Pernas', 'DZMUEPq98c8', 'Execução padrão', ARRAY['Máquina'], 'https://img.youtube.com/vi/DZMUEPq98c8/hqdefault.jpg', 'Isolador de isquiotibiais.'),
('Stiff com Barra', 'Pernas', 'B5R6qfyIqqA', 'Execução padrão', ARRAY['Barra'], 'https://img.youtube.com/vi/B5R6qfyIqqA/hqdefault.jpg', 'Foco em isquiotibiais e glúteos.'),
('Agachamento Sumô', 'Pernas', 'qnZEgVXSbHo', 'Execução padrão', ARRAY['Halter', 'Barra'], 'https://img.youtube.com/vi/qnZEgVXSbHo/hqdefault.jpg', 'Foco em glúteos e adutores.'),
('Elevação Pélvica', 'Pernas', '_i6qpcI1Nw4', 'Execução padrão', ARRAY['Barra', 'Banco'], 'https://img.youtube.com/vi/_i6qpcI1Nw4/hqdefault.jpg', 'Isolador de glúteos.'),
('Panturrilha em Pé', 'Pernas', 'ZQdqLXtNpMQ', 'Execução padrão', ARRAY['Máquina', 'Peso do Corpo'], 'https://img.youtube.com/vi/ZQdqLXtNpMQ/hqdefault.jpg', 'Desenvolvimento de panturrilhas.'),
('Hack Squat', 'Pernas', 'TA5oAKI_Nxw', 'Execução padrão', ARRAY['Máquina'], 'https://img.youtube.com/vi/TA5oAKI_Nxw/hqdefault.jpg', 'Variação do agachamento.'),
('Avanço com Halteres', 'Pernas', 'io3KJ3oN5mk', 'Execução padrão', ARRAY['Halteres'], 'https://img.youtube.com/vi/io3KJ3oN5mk/hqdefault.jpg', 'Trabalho unilateral de pernas.'),
('Agachamento Búlgaro', 'Pernas', 'VJFHersLOqU', 'Execução padrão', ARRAY['Halteres', 'Banco'], 'https://img.youtube.com/vi/VJFHersLOqU/hqdefault.jpg', 'Exercício de perna unilateral extremo.'),
('Cadeira Adutora', 'Pernas', 'AmHRbGPzJ70', 'Execução padrão', ARRAY['Máquina'], 'https://img.youtube.com/vi/AmHRbGPzJ70/hqdefault.jpg', 'Isolador de adutores.'),
('Cadeira Abdutora', 'Pernas', 'XbhmXUYp8hs', 'Execução padrão', ARRAY['Máquina'], 'https://img.youtube.com/vi/XbhmXUYp8hs/hqdefault.jpg', 'Isolador de glúteo médio.'),

-- COSTAS
('Levantamento Terra', 'Costas', 'ASO89bLkLqU', 'Execução padrão', ARRAY['Barra'], 'https://img.youtube.com/vi/ASO89bLkLqU/hqdefault.jpg', 'Trabalho de cadeia posterior.'),
('Barra Fixa', 'Costas', 'eGo4IWqAX8', 'Execução padrão', ARRAY['Barra Fixa'], 'https://img.youtube.com/vi/eGo4IWqAX8/hqdefault.jpg', 'Puxada vertical com peso do corpo.'),
('Remada Curvada com Barra', 'Costas', 'cMQpvkZGQrE', 'Execução padrão', ARRAY['Barra'], 'https://img.youtube.com/vi/cMQpvkZGQrE/hqdefault.jpg', 'Remada livre para volume.'),
('Remada Unilateral com Halter', 'Costas', 'eeg6REnybpI', 'Execução padrão', ARRAY['Halter', 'Banco'], 'https://img.youtube.com/vi/eeg6REnybpI/hqdefault.jpg', 'Remada serrote clássica.'),
('Puxada Frontal no Cabo', 'Costas', 'Ro45Ju8eBak', 'Execução padrão', ARRAY['Polia Alta'], 'https://img.youtube.com/vi/Ro45Ju8eBak/hqdefault.jpg', 'Substituto da barra fixa.'),
('Crucifixo Invertido', 'Costas', 'K5T1YBbKEXI', 'Execução padrão', ARRAY['Halteres'], 'https://img.youtube.com/vi/K5T1YBbKEXI/hqdefault.jpg', 'Foco no deltóide posterior.'),
('Remada Serrote', 'Costas', 'mjFIZX68F_8', 'Execução padrão', ARRAY['Halter', 'Banco'], 'https://img.youtube.com/vi/mjFIZX68F_8/hqdefault.jpg', 'Ótimo para hipertrofia dorsal.'),
('Puxada Triângulo', 'Costas', 'KquN56BZR9c', 'Execução padrão', ARRAY['Polia Alta'], 'https://img.youtube.com/vi/KquN56BZR9c/hqdefault.jpg', 'Puxada com pegada neutra.'),

-- OMBROS
('Desenvolvimento com Barra', 'Ombros', 'm1dtZHPSmHg', 'Execução padrão', ARRAY['Barra'], 'https://img.youtube.com/vi/m1dtZHPSmHg/hqdefault.jpg', 'Press pesado para ombros.'),
('Elevação Lateral com Halteres', 'Ombros', 'QlENCLwEx_Q', 'Execução padrão', ARRAY['Halteres'], 'https://img.youtube.com/vi/QlENCLwEx_Q/hqdefault.jpg', 'Isolador deltóide medial.'),
('Elevação Frontal com Halteres', 'Ombros', 'YyNMDsPedPk', 'Execução padrão', ARRAY['Halteres'], 'https://img.youtube.com/vi/YyNMDsPedPk/hqdefault.jpg', 'Foco no deltóide anterior.'),
('Encolhimento de Ombros (Shrug)', 'Ombros', 'Dl5jKuF4hLY', 'Execução padrão', ARRAY['Halteres', 'Barra'], 'https://img.youtube.com/vi/Dl5jKuF4hLY/hqdefault.jpg', 'Foco no trapézio.'),
('Elevação Lateral no Cabo', 'Ombros', '89J3D_XDa3A', 'Execução padrão', ARRAY['Polia Baixa'], 'https://img.youtube.com/vi/89J3D_XDa3A/hqdefault.jpg', 'Tensão constante no deltóide medial.'),
('Face Pull no Cabo', 'Ombros', 'IeOqdw9WI90', 'Execução padrão', ARRAY['Polia Alta', 'Corda'], 'https://img.youtube.com/vi/IeOqdw9WI90/hqdefault.jpg', 'Saúde dos ombros e deltóide posterior.'),

-- BÍCEPS
('Rosca Direta com Barra', 'Bíceps', 'ojlJslnaae4', 'Execução padrão', ARRAY['Barra Reta'], 'https://img.youtube.com/vi/ojlJslnaae4/hqdefault.jpg', 'Exercício primário para bíceps.'),
('Rosca Alternada com Halteres', 'Bíceps', 'Xe_SJmQ5wmI', 'Execução padrão', ARRAY['Halteres'], 'https://img.youtube.com/vi/Xe_SJmQ5wmI/hqdefault.jpg', 'Rosca unilateral para equilíbrio.'),
('Rosca Martelo', 'Bíceps', 'RejYUX31uVo', 'Execução padrão', ARRAY['Halteres'], 'https://img.youtube.com/vi/RejYUX31uVo/hqdefault.jpg', 'Foco no braquiorradial.'),
('Rosca Scott', 'Bíceps', 'lQEE8Nvhamw', 'Execução padrão', ARRAY['Banco Scott', 'Barra W'], 'https://img.youtube.com/vi/lQEE8Nvhamw/hqdefault.jpg', 'Isolador máximo de bíceps.'),
('Rosca Concentrada', 'Bíceps', 'Qm4NdQttdi8', 'Execução padrão', ARRAY['Halter'], 'https://img.youtube.com/vi/Qm4NdQttdi8/hqdefault.jpg', 'Trabalho de pico de bíceps.'),
('Rosca no Cabo', 'Bíceps', '2v1LDRklTnU', 'Execução padrão', ARRAY['Polia Baixa'], 'https://img.youtube.com/vi/2v1LDRklTnU/hqdefault.jpg', 'Tensão contínua para bíceps.'),

-- TRÍCEPS
('Tríceps Testa com Barra', 'Tríceps', '8LFsUN913r4', 'Execução padrão', ARRAY['Barra W'], 'https://img.youtube.com/vi/8LFsUN913r4/hqdefault.jpg', 'Clássico para tríceps isolado.'),
('Tríceps Pulley no Cabo', 'Tríceps', 'HFs7OiOy8TE', 'Execução padrão', ARRAY['Polia Alta'], 'https://img.youtube.com/vi/HFs7OiOy8TE/hqdefault.jpg', 'Pushdown para tríceps medial.'),
('Mergulho em Barras Paralelas', 'Tríceps', '4NWWB0f0vzQ', 'Execução padrão', ARRAY['Paralelas'], 'https://img.youtube.com/vi/4NWWB0f0vzQ/hqdefault.jpg', 'Exercício composto forte para tríceps e peito.'),
('Tríceps Francês com Halter', 'Tríceps', 'TkGyrH6EQK4', 'Execução padrão', ARRAY['Halter'], 'https://img.youtube.com/vi/TkGyrH6EQK4/hqdefault.jpg', 'Foco na porção longa do tríceps.'),
('Tríceps Mergulho no Banco', 'Tríceps', 'p_DeBmkbCUc', 'Execução padrão', ARRAY['Banco'], 'https://img.youtube.com/vi/p_DeBmkbCUc/hqdefault.jpg', 'Exercício com peso do corpo acessível.'),

-- ABDÔMEN / CORE
('Abdominal Crunch', 'Abdômen', 'P5ySsdvCMyE', 'Execução padrão', ARRAY['Colchonete'], 'https://img.youtube.com/vi/P5ySsdvCMyE/hqdefault.jpg', 'Flexão de tronco clássica.'),
('Prancha', 'Abdômen', 'ffHr8a6DRvU', 'Execução padrão', ARRAY['Colchonete'], 'https://img.youtube.com/vi/ffHr8a6DRvU/hqdefault.jpg', 'Isometria de core.')
ON CONFLICT DO NOTHING;
