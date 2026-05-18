const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
import { supabase } from './supabase';

interface FetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function supabaseFetch<T>(path: string, options: FetchOptions = {}): Promise<T | null> {
  try {
    const url = `${SUPABASE_URL}${path}`;
    
    // Configura os headers base
    const fetchHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      ...options.headers,
    };

    // Pega a sessão atual injetada pelo nosso store
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      fetchHeaders['Authorization'] = `Bearer ${session.access_token}`;
    } else {
      fetchHeaders['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
    }

    const res = await fetch(url, {
      method: options.method || 'GET',
      headers: fetchHeaders,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// Sync endpoint (Edge Function)
export const api = {
  post: async (url: string, data: unknown) => {
    return supabaseFetch<{ synced_ids?: string[]; synced_count?: number; conflicts?: string[] }>(
      `/functions/v1${url}`,
      { method: 'POST', body: data }
    ).then(d => ({ data: d }));
  },
};

// ── Weekly summary ──────────────────────────────────────────
export interface WeeklySummary {
  workouts: number;
  volume_kg: number;
  duration_minutes: number;
}

interface WeeklySummaryResponse {
  workouts?: number;
  volume_kg?: number;
  duration_minutes?: number;
  workouts_completed?: number;
  total_volume_kg?: number;
  time_spent_minutes?: number;
}

export async function fetchWeeklySummary(): Promise<WeeklySummary> {
  const data = await supabaseFetch<WeeklySummaryResponse>('/functions/v1/weekly-summary');
  if (!data) {
    return { workouts: 0, volume_kg: 0, duration_minutes: 0 };
  }
  return {
    workouts: data.workouts ?? data.workouts_completed ?? 0,
    volume_kg: data.volume_kg ?? data.total_volume_kg ?? 0,
    duration_minutes: data.duration_minutes ?? data.time_spent_minutes ?? 0,
  };
}

export async function fetchWorkoutLogs(): Promise<any[]> {
  // Busca até 100 treinos mais recentes com suas respectivas séries
  const data = await supabaseFetch<any[]>('/rest/v1/user_workout_logs?select=client_id,completed_at,duration_seconds,user_set_logs(weight_kg,reps_done)&order=completed_at.desc&limit=100');
  
  if (!data) return [];
  
  return data.map((log) => {
    let total_volume = 0;
    let total_sets = 0;
    
    if (log.user_set_logs) {
      total_sets = log.user_set_logs.length;
      total_volume = log.user_set_logs.reduce((acc: number, set: any) => {
        return acc + ((Number(set.weight_kg) || 0) * (Number(set.reps_done) || 0));
      }, 0);
    }
    
    return {
      client_id: log.client_id,
      completed_at: log.completed_at,
      duration_seconds: log.duration_seconds,
      total_volume_kg: total_volume,
      total_sets: total_sets
    };
  });
}


// ── Featured plans ──────────────────────────────────────────
export interface WorkoutPlan {
  id: string;
  name: string;
  athlete_name: string;
  exercise_count: number;
  youtube_thumbnail: string | null;
  badge: string | null;
}

export async function fetchFeaturedPlans(): Promise<WorkoutPlan[]> {
  const data = await supabaseFetch<WorkoutPlan[]>(
    '/rest/v1/workout_plans?is_published=eq.true&limit=2&select=id,name,athlete_name,exercise_count,youtube_thumbnail,badge'
  );
  return data ?? [];
}

// ── Exercises ───────────────────────────────────────────────
export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  youtube_video_id: string;
  equipment: string[];
}

export async function fetchExercises(): Promise<Exercise[]> {
  const data = await supabaseFetch<Exercise[]>('/rest/v1/exercises?select=*');
  if (data && data.length > 0) return data;

  // FALLBACK OFFLINE / MOCK
  // Se a API falhar (Supabase down ou sem internet), injeta a biblioteca base
  return [
    { id: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Supino Reto com Barra', muscle_group: 'Peito', youtube_video_id: '50RSzhMG5Hc', equipment: ['Barra', 'Banco Reto'] },
    { id: '2b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Supino Inclinado com Halteres', muscle_group: 'Peito', youtube_video_id: 'B9gGcbEdYBQ', equipment: ['Halteres', 'Banco Inclinado'] },
    { id: '3b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Crucifixo com Halteres', muscle_group: 'Peito', youtube_video_id: 'pU80usRU99Y', equipment: ['Halteres', 'Banco Reto'] },
    { id: '4b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Cross-over no Cabo', muscle_group: 'Peito', youtube_video_id: 'nuTuKjcQRHg', equipment: ['Polia Alta'] },
    { id: '5b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Supino Inclinado com Barra', muscle_group: 'Peito', youtube_video_id: '6jBx5YwAb7E', equipment: ['Barra', 'Banco Inclinado'] },
    { id: '6b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Pullover com Halter', muscle_group: 'Peito', youtube_video_id: '1hWxh0WI7lE', equipment: ['Halter', 'Banco Reto'] },
    
    { id: '7b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Agachamento Livre', muscle_group: 'Pernas', youtube_video_id: 'wzsUfTMPrEg', equipment: ['Barra', 'Rack'] },
    { id: '8b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Leg Press 45°', muscle_group: 'Pernas', youtube_video_id: 'lHZUF_s3q9c', equipment: ['Leg Press'] },
    { id: '9b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Cadeira Extensora', muscle_group: 'Pernas', youtube_video_id: 'y7GhuVphn4s', equipment: ['Máquina'] },
    { id: 'ab9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Mesa Flexora', muscle_group: 'Pernas', youtube_video_id: 'DZMUEPq98c8', equipment: ['Máquina'] },
    { id: 'bb9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Stiff com Barra', muscle_group: 'Pernas', youtube_video_id: 'B5R6qfyIqqA', equipment: ['Barra'] },
    { id: 'cb9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Agachamento Sumô', muscle_group: 'Pernas', youtube_video_id: 'qnZEgVXSbHo', equipment: ['Halter', 'Barra'] },
    { id: 'db9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Elevação Pélvica', muscle_group: 'Pernas', youtube_video_id: '_i6qpcI1Nw4', equipment: ['Barra', 'Banco'] },
    { id: 'eb9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Panturrilha em Pé', muscle_group: 'Pernas', youtube_video_id: 'ZQdqLXtNpMQ', equipment: ['Máquina'] },
    { id: 'fb9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Hack Squat', muscle_group: 'Pernas', youtube_video_id: 'TA5oAKI_Nxw', equipment: ['Máquina'] },
    { id: '0c9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Avanço com Halteres', muscle_group: 'Pernas', youtube_video_id: 'io3KJ3oN5mk', equipment: ['Halteres'] },
    { id: '1c9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Agachamento Búlgaro', muscle_group: 'Pernas', youtube_video_id: 'VJFHersLOqU', equipment: ['Halteres', 'Banco'] },
    { id: '2c9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Cadeira Adutora', muscle_group: 'Pernas', youtube_video_id: 'AmHRbGPzJ70', equipment: ['Máquina'] },
    { id: '3c9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Cadeira Abdutora', muscle_group: 'Pernas', youtube_video_id: 'XbhmXUYp8hs', equipment: ['Máquina'] },

    { id: '4c9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Levantamento Terra', muscle_group: 'Costas', youtube_video_id: 'ASO89bLkLqU', equipment: ['Barra'] },
    { id: '5c9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Barra Fixa', muscle_group: 'Costas', youtube_video_id: 'eGo4IWqAX8', equipment: ['Barra Fixa'] },
    { id: '6c9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Remada Curvada com Barra', muscle_group: 'Costas', youtube_video_id: 'cMQpvkZGQrE', equipment: ['Barra'] },
    { id: '7c9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Remada Unilateral com Halter', muscle_group: 'Costas', youtube_video_id: 'eeg6REnybpI', equipment: ['Halter', 'Banco'] },
    { id: '8c9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Puxada Frontal no Cabo', muscle_group: 'Costas', youtube_video_id: 'Ro45Ju8eBak', equipment: ['Polia Alta'] },
    { id: '9c9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Crucifixo Invertido', muscle_group: 'Costas', youtube_video_id: 'K5T1YBbKEXI', equipment: ['Halteres'] },
    { id: 'ac9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Remada Serrote', muscle_group: 'Costas', youtube_video_id: 'mjFIZX68F_8', equipment: ['Halter', 'Banco'] },
    { id: 'bc9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Puxada Triângulo', muscle_group: 'Costas', youtube_video_id: 'KquN56BZR9c', equipment: ['Polia Alta'] },

    { id: 'cc9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Desenvolvimento com Barra', muscle_group: 'Ombros', youtube_video_id: 'm1dtZHPSmHg', equipment: ['Barra'] },
    { id: 'dc9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Elevação Lateral com Halteres', muscle_group: 'Ombros', youtube_video_id: 'QlENCLwEx_Q', equipment: ['Halteres'] },
    { id: 'ec9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Elevação Frontal com Halteres', muscle_group: 'Ombros', youtube_video_id: 'YyNMDsPedPk', equipment: ['Halteres'] },
    { id: 'fc9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Encolhimento de Ombros (Shrug)', muscle_group: 'Ombros', youtube_video_id: 'Dl5jKuF4hLY', equipment: ['Halteres', 'Barra'] },
    { id: '0d9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Elevação Lateral no Cabo', muscle_group: 'Ombros', youtube_video_id: '89J3D_XDa3A', equipment: ['Polia Baixa'] },
    { id: '1d9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Face Pull no Cabo', muscle_group: 'Ombros', youtube_video_id: 'IeOqdw9WI90', equipment: ['Polia Alta', 'Corda'] },

    { id: '2d9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Rosca Direta com Barra', muscle_group: 'Bíceps', youtube_video_id: 'ojlJslnaae4', equipment: ['Barra Reta'] },
    { id: '3d9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Rosca Alternada com Halteres', muscle_group: 'Bíceps', youtube_video_id: 'Xe_SJmQ5wmI', equipment: ['Halteres'] },
    { id: '4d9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Rosca Martelo', muscle_group: 'Bíceps', youtube_video_id: 'RejYUX31uVo', equipment: ['Halteres'] },
    { id: '5d9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Rosca Scott', muscle_group: 'Bíceps', youtube_video_id: 'lQEE8Nvhamw', equipment: ['Banco Scott', 'Barra W'] },
    { id: '6d9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Rosca Concentrada', muscle_group: 'Bíceps', youtube_video_id: 'Qm4NdQttdi8', equipment: ['Halter'] },
    { id: '7d9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Rosca no Cabo', muscle_group: 'Bíceps', youtube_video_id: '2v1LDRklTnU', equipment: ['Polia Baixa'] },

    { id: '8d9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Tríceps Testa com Barra', muscle_group: 'Tríceps', youtube_video_id: '8LFsUN913r4', equipment: ['Barra W'] },
    { id: '9d9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Tríceps Pulley no Cabo', muscle_group: 'Tríceps', youtube_video_id: 'HFs7OiOy8TE', equipment: ['Polia Alta'] },
    { id: 'ad9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Mergulho em Barras Paralelas', muscle_group: 'Tríceps', youtube_video_id: '4NWWB0f0vzQ', equipment: ['Paralelas'] },
    { id: 'bd9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Tríceps Francês com Halter', muscle_group: 'Tríceps', youtube_video_id: 'TkGyrH6EQK4', equipment: ['Halter'] },
    { id: 'cd9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Tríceps Mergulho no Banco', muscle_group: 'Tríceps', youtube_video_id: 'p_DeBmkbCUc', equipment: ['Banco'] },

    { id: 'dd9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Abdominal Crunch', muscle_group: 'Abdômen', youtube_video_id: 'P5ySsdvCMyE', equipment: ['Colchonete'] },
    { id: 'ed9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Prancha', muscle_group: 'Abdômen', youtube_video_id: 'ffHr8a6DRvU', equipment: ['Colchonete'] }
  ];
}
