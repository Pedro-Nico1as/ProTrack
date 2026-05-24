# Instruções para o Agente de Frontend (Mobile) — ProTrack & Flow

> **Contexto:** Este documento detalha todos os ajustes necessários no app React Native (Expo) identificados na auditoria técnica completa do projeto. O app passou a ser **online-only** — toda a arquitetura de sync offline foi descontinuada. Execute as tarefas na ordem apresentada (prioridade decrescente de criticidade).

---

## 🗑️ PRIORIDADE 1 — REMOÇÃO DO SISTEMA OFFLINE

### 1.1 — Excluir arquivos de sincronização offline

**Ação — Excluir os seguintes arquivos:**
- `protrack-mobile/src/stores/useSyncStore.ts`
- `protrack-mobile/src/services/syncEngine.ts` _(se existir)_

Esses arquivos gerenciavam a fila `pendingLogs` / `pendingSets` que não é mais necessária com a arquitetura online-only.

---

### 1.2 — Refatorar `ActiveWorkoutScreen.tsx` para usar o novo endpoint `save-workout`

**Arquivo:** `protrack-mobile/src/screens/ActiveWorkout/ActiveWorkoutScreen.tsx`

**Problema atual:** A função `handleFinishWorkout` (linha 99) constrói um payload complexo com `client_id` e `log_client_id` e envia para `/sync-workout` — endpoint que será removido do backend. Além disso, `generateUUID()` é usado para criar IDs no cliente, o que não é mais necessário.

**Ação — Refatorar `handleFinishWorkout` completamente:**

```typescript
// ANTES (linhas 99–153 do arquivo atual):
const handleFinishWorkout = async () => {
  setIsSaving(true);
  const now = new Date();
  const startedAt = workoutStartedAtRef.current;
  const startedDate = new Date(startedAt);
  const durationSeconds = Math.round((now.getTime() - startedDate.getTime()) / 1000);

  const logId = generateUUID(); // ← REMOVER
  const workoutSessionId = sessionId || null;

  let totalVolumeKg = 0;
  const allSets: any[] = [];
  exercises.forEach(ex => {
    ex.loggedSets.forEach(set => {
      totalVolumeKg += set.weight * set.reps;
      allSets.push({
        client_id: generateUUID(),      // ← REMOVER
        log_client_id: logId,           // ← REMOVER
        session_exercise_id: sessionId ? ex.id : null,
        exercise_id: ex.exerciseId || ex.id,
        set_number: set.setNumber,
        weight_kg: set.weight,
        reps_done: set.reps,
        completed_at: set.completedAt,
      });
    });
  });

  try {
    await api.post('/sync-workout', {  // ← MUDAR ENDPOINT
      logs: [{ client_id: logId, ... }],
      sets: allSets
    });
    ...
  } catch (error) { ... }
};

// DEPOIS (versão online-only):
const handleFinishWorkout = async () => {
  setIsSaving(true);

  const now = new Date();
  const startedAt = workoutStartedAtRef.current;
  const durationSeconds = Math.round((now.getTime() - new Date(startedAt).getTime()) / 1000);

  const sets = exercises.flatMap(ex =>
    ex.loggedSets.map((set, i) => ({
      session_exercise_id: sessionId ? ex.id : null,
      exercise_id: ex.exerciseId || ex.id,
      set_number: set.setNumber ?? i + 1,
      weight_kg: set.weight,
      reps_done: set.reps,
      completed_at: set.completedAt,
    }))
  );

  try {
    await api.post('/save-workout', {
      workout: {
        session_id: sessionId || null,
        started_at: startedAt,
        completed_at: now.toISOString(),
        duration_seconds: durationSeconds,
      },
      sets,
    });

    isFinishingRef.current = true;
    finishWorkout();
    navigation.goBack();
  } catch (error) {
    setIsSaving(false);
    Alert.alert(strings.activeWorkout.alertErrorTitle, strings.activeWorkout.alertErrorMsg);
  }
};
```

**Remover também** o import de `generateUUID` na linha 13, caso não seja mais utilizado em nenhum outro lugar do arquivo:
```typescript
// REMOVER:
import { generateUUID } from '../../utils/uuid';
```

---

## 🚨 PRIORIDADE 2 — TELAS FALTANTES NO MVP

### 2.1 — Adicionar `HistoryScreen` e `ExploreScreen` ao `TabNavigator`

**Arquivo:** `protrack-mobile/src/navigation/TabNavigator.tsx`

**Problema:** As telas `HistoryScreen` e `ExploreScreen` existem como arquivos mas **não estão registradas** no `TabNavigator`. A tab bar atual só tem `Home`, `NewWorkoutPlaceholder` e `Profile`. Os usuários não conseguem acessar Histórico ou Explorar.

**Ação — Atualizar `TabNavigator.tsx`:**

1. Adicionar os imports das telas:
```typescript
import { HistoryScreen } from '../screens/History/HistoryScreen';
import { ExploreScreen } from '../screens/Explore/ExploreScreen';
```

2. Adicionar ícones para as novas abas (já disponíveis em `@tabler/icons-react-native`):
```typescript
import { IconHome2, IconUser, IconPlus, IconHistory, IconCompass } from '@tabler/icons-react-native';
```

3. Atualizar o tipo `TabParamList` em `navigation/types.ts` para incluir as novas abas:
```typescript
export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  NewWorkoutPlaceholder: undefined;
  History: undefined;
  Profile: undefined;
};
```

4. Atualizar o `TabNavigator` para incluir as 5 abas:
```typescript
export const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="NewWorkoutPlaceholder" component={EmptyScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
```

5. Atualizar `TabItem` e `CustomTabBar` para suportar as rotas adicionais com seus ícones. O type `routeName` precisa aceitar `'Home' | 'Explore' | 'History' | 'Profile'` e o mapeamento de ícones deve incluir os novos valores:
```typescript
const iconMap: Record<string, React.ElementType> = {
  Home: IconHome2,
  Explore: IconCompass,
  History: IconHistory,
  Profile: IconUser,
};
const IconComponent = iconMap[routeName] ?? IconHome2;
```

---

### 2.2 — Implementar busca de dados reais na `HistoryScreen`

**Arquivo:** `protrack-mobile/src/screens/History/HistoryScreen.tsx`

**Problema:** A função `fetchHistory` (linhas 17–26) está vazia — apenas seta arrays vazios. O usuário nunca vê seus treinos passados.

**Ação — Implementar a query real via Supabase:**

```typescript
import { supabase } from '../../services/supabase';

// Dentro de fetchHistory:
const fetchHistory = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('user_workout_logs')
      .select(`
        id,
        started_at,
        completed_at,
        duration_seconds,
        session_id,
        user_set_logs(id)
      `)
      .eq('user_id', session.user.id)
      .order('completed_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    if (isActive) {
      setWorkouts(data ?? []);
      const total = (data ?? []).reduce(
        (acc, w) => acc + (w.user_set_logs?.length ?? 0),
        0
      );
      setSetsCount(total);
    }
  } catch (e) {
    console.error('Erro ao buscar histórico', e);
  }
};
```

Também atualizar o card renderizado na FlatList para mostrar:
- Nome da sessão (se houver `session_id`, buscar o nome; caso contrário, mostrar "Treino Livre")
- Data formatada
- Duração em minutos (`Math.round(item.duration_seconds / 60)`)
- Quantidade de séries (`item.user_set_logs?.length ?? 0`)

---

### 2.3 — Implementar busca de planos de treino reais na `ExploreScreen`

**Arquivo:** `protrack-mobile/src/screens/Explore/ExploreScreen.tsx`

**Problema:** A tela é um placeholder estático com texto "Em breve".

**Ação — Implementar a listagem de planos publicados:**

```typescript
import { supabase } from '../../services/supabase';

// Adicionar estado e query:
const [plans, setPlans] = useState<any[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from('workout_plans')
      .select(`
        id,
        title,
        description,
        level,
        duration_weeks,
        days_per_week,
        athletes(name, avatar_url, is_verified)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (!error) setPlans(data ?? []);
    setIsLoading(false);
  };
  fetchPlans();
}, []);
```

Renderizar com uma `FlatList` de cards mostrando: título, nível (`beginner` / `intermediate` / `advanced`), duração em semanas, dias por semana e nome do athlete com badge de verificado se `is_verified = true`.

---

## 🔐 PRIORIDADE 3 — FLUXO DE AUTH INCOMPLETO

### 3.1 — Adicionar link "Esqueci minha senha" na `AuthScreen`

**Arquivo:** `protrack-mobile/src/screens/Auth/AuthScreen.tsx`

**Problema:** Não existe nenhuma forma de o usuário recuperar a senha caso a esqueça.

**Ação — Adicionar o botão de recuperação de senha no modo `login`:**

```typescript
// Adicionar função de recuperação:
const handleForgotPassword = async () => {
  if (!watch('email')) {
    Alert.alert('Atenção', 'Digite seu e-mail no campo acima primeiro.');
    return;
  }
  setIsLoading(true);
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(watch('email'), {
      redirectTo: 'protrack://reset-password',
    });
    if (error) throw error;
    Alert.alert('E-mail enviado', 'Verifique sua caixa de entrada para redefinir sua senha.');
  } catch (error: any) {
    Alert.alert('Erro', error.message);
  } finally {
    setIsLoading(false);
  }
};

// Adicionar no JSX, após o botão de submit e antes do link de alternar modo:
{mode === 'login' && (
  <TouchableOpacity
    style={styles.forgotPasswordButton}
    onPress={handleForgotPassword}
  >
    <Text variant="caption" color={colors.textSecondary} align="center">
      Esqueci minha senha
    </Text>
  </TouchableOpacity>
)}

// Adicionar o style:
forgotPasswordButton: {
  marginTop: spacing.sm,
  paddingVertical: spacing.xs,
  alignItems: 'center',
},
```

**Nota:** O `watch` do `react-hook-form` precisa ser desestruturado junto com os demais: `const { control, handleSubmit, watch, ... } = useForm(...)`.

---

## ⚡ PRIORIDADE 4 — PERFORMANCE E POLIMENTO

### 4.1 — Corrigir a query N+1 implícita no `user-progress` chamado do app

**Contexto:** Quando o `HomeScreen` (ou `ProfileScreen`) busca progresso por exercício chamando a Edge Function `user-progress`, cada chamada individual busca todos os sets de um exercício. Se a tela fizer isso para múltiplos exercícios em paralelo, a carga no banco cresce linearmente.

**Ação no mobile:** Garantir que o app faça no máximo **uma chamada por exercício** e armazene o resultado em cache local (Zustand ou React state com `useMemo`). Evitar chamar `/user-progress` repetidamente em re-renders.

---

### 4.2 — Adicionar `getItemLayout` nas `FlatList`s para listas de altura fixa

**Problema:** FlatLists sem `getItemLayout` não conseguem fazer scroll otimizado nem pular para índices específicos. Se os cards tiverem altura fixa, adicionar `getItemLayout` melhora a performance significativamente.

**Ação:** Em `HistoryScreen` e `ExploreScreen`, após determinar a altura do card (ex: `CARD_HEIGHT = 88`):

```typescript
const CARD_HEIGHT = 88; // ajustar para o valor real do card
const CARD_SEPARATOR = spacing.sm; // ex: 8

// Na FlatList:
getItemLayout={(_, index) => ({
  length: CARD_HEIGHT + CARD_SEPARATOR,
  offset: (CARD_HEIGHT + CARD_SEPARATOR) * index,
  index,
})}
```

---

### 4.3 — Verificar e garantir Hermes habilitado no `app.json`

**Problema identificado:** O `app.json` pode não ter o Hermes explicitamente habilitado. O Hermes melhora o tempo de inicialização e uso de memória no Android.

**Ação — Verificar `protrack-mobile/app.json`:**

```json
{
  "expo": {
    "jsEngine": "hermes"
  }
}
```

Se essa chave não existir, adicionar.

---

## 🧹 PRIORIDADE 5 — QUALIDADE DE CÓDIGO

### 5.1 — Configurar ESLint e Prettier

**Problema:** Não existe arquivo de configuração de lint no projeto mobile, o que permite inconsistências de estilo e potencialmente bugs silenciosos (variáveis não utilizadas, `any` excessivo, etc.)

**Ação:**

```bash
# Na pasta protrack-mobile:
npx expo install -- --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-expo prettier eslint-config-prettier eslint-plugin-prettier
```

Criar `protrack-mobile/.eslintrc.js`:
```js
module.exports = {
  extends: ['expo', 'plugin:@typescript-eslint/recommended', 'prettier'],
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

Criar `protrack-mobile/.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}
```

Adicionar scripts no `package.json`:
```json
"scripts": {
  "lint": "eslint src --ext .ts,.tsx",
  "lint:fix": "eslint src --ext .ts,.tsx --fix",
  "format": "prettier --write src/**/*.{ts,tsx}"
}
```

---

### 5.2 — Criar workflow de CI no GitHub Actions

**Ação — Criar `.github/workflows/ci.yml` na raiz do repositório:**

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: protrack-mobile/package-lock.json

      - name: Install dependencies (mobile)
        run: npm ci
        working-directory: protrack-mobile

      - name: Run lint
        run: npm run lint
        working-directory: protrack-mobile

      - name: Run tests
        run: npm test -- --watchAll=false --passWithNoTests
        working-directory: protrack-tests
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Antes de marcar as tarefas como concluídas, valide:

- [ ] `useSyncStore.ts` e `syncEngine.ts` excluídos (sem erros de TypeScript no build)
- [ ] `handleFinishWorkout` em `ActiveWorkoutScreen` chama `/save-workout` (sem `client_id` ou `log_client_id`)
- [ ] Import de `generateUUID` removido do `ActiveWorkoutScreen` (ou ainda em uso em outro local)
- [ ] `HistoryScreen` e `ExploreScreen` aparecem na tab bar ao rodar o app
- [ ] `HistoryScreen` exibe treinos reais da tabela `user_workout_logs` após completar um treino de teste
- [ ] `ExploreScreen` exibe planos de treino publicados da tabela `workout_plans`
- [ ] Link "Esqueci minha senha" visível na tela de login
- [ ] `supabase.auth.resetPasswordForEmail` chamado com sucesso (verificar e-mail recebido)
- [ ] `app.json` contém `"jsEngine": "hermes"`
- [ ] `npm run lint` executa sem erros críticos
- [ ] Workflow de CI configurado e passando no GitHub Actions
