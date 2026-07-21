// Lógica Interativa do Emulador ProTrack Web
document.addEventListener('DOMContentLoaded', () => {
  // Inicialização de Relógio e Estado
  initClock();
  initApp();
});

// Estado Global da Demo
const AppState = {
  currentUser: { name: 'Pedro Vieira', email: 'pedro@protrack.app' },
  activeWorkout: {
    id: 'arnold-active',
    name: 'Arnold Classic - Treino A',
    partitionName: 'Peito e Costas',
    exercises: [
      { name: 'Supino Reto com Barra', sets: 4, reps: 10, weight: 80, completed: [true, true, false, false] },
      { name: 'Supino Inclinado com Halteres', sets: 4, reps: 10, weight: 32, completed: [false, false, false, false] },
      { name: 'Remada Curvada com Barra', sets: 4, reps: 10, weight: 70, completed: [false, false, false, false] }
    ]
  },
  customWorkouts: [],
  restTimer: {
    running: false,
    duration: 60,
    remaining: 60,
    intervalId: null
  },
  currentPreviewWorkout: null,
  activePreviewPartition: 0,
  builderPartitions: [
    { id: 1, name: 'Treino A - Peito e Tríceps', exercises: [] }
  ]
};

function initClock() {
  const clockEl = document.getElementById('status-clock');
  function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    if (clockEl) clockEl.textContent = `${hours}:${minutes}`;
  }
  updateTime();
  setInterval(updateTime, 10000);
}

function initApp() {
  renderHomeWorkouts();
  renderFichasProntas();
  renderExercisesCatalog();
  renderActiveWorkout();

  // Event Listeners para botões da interface
  document.getElementById('btn-login-demo')?.addEventListener('click', () => {
    switchTab('home');
  });

  document.getElementById('btn-toggle-frame')?.addEventListener('click', () => {
    document.body.classList.toggle('fullscreen-mode');
    const btn = document.getElementById('btn-toggle-frame');
    if (document.body.classList.contains('fullscreen-mode')) {
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg> Moldura de Celular`;
    } else {
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg> Tela Cheia`;
    }
  });

  // Busca em Fichas Prontas
  document.getElementById('search-fichas')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    renderFichasProntas(query);
  });

  // Busca no Modal de Exercícios
  document.getElementById('search-exercises')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    renderExercisesCatalog(query);
  });
}

// Navegação entre Telas (Tab Router)
function switchTab(tabName) {
  const screens = document.querySelectorAll('.screen');
  const tabs = document.querySelectorAll('.tab-item');

  screens.forEach(s => s.classList.remove('active'));
  tabs.forEach(t => t.classList.remove('active'));

  const targetScreen = document.getElementById(`screen-${tabName}`);
  const targetTab = document.querySelector(`.tab-item[data-tab="${tabName}"]`);

  if (targetScreen) targetScreen.classList.add('active');
  if (targetTab) targetTab.classList.add('active');

  // Rolar tela para o topo
  const viewport = document.querySelector('.screen-viewport');
  if (viewport) viewport.scrollTop = 0;
}

// Renderização dos Cards da Home
function renderHomeWorkouts() {
  const container = document.getElementById('home-featured-list');
  if (!container) return;

  container.innerHTML = PREDEFINED_WORKOUTS.slice(0, 4).map(w => `
    <div class="workout-card" onclick="openPreviewModal('${w.id}')">
      <img src="${w.image}" alt="${w.name}">
      <div class="workout-card-overlay">
        <span class="workout-badge">${w.badge}</span>
        <div class="workout-card-title">${w.name}</div>
        <div class="workout-card-sub">${w.partitions.length} fichas • ${w.partitions[0].exercises.length} exercícios</div>
      </div>
    </div>
  `).join('');
}

// Renderização da Lista de Fichas Prontas
function renderFichasProntas(filterQuery = '') {
  const container = document.getElementById('fichas-list');
  if (!container) return;

  const filtered = PREDEFINED_WORKOUTS.filter(w => 
    w.name.toLowerCase().includes(filterQuery) || 
    w.description.toLowerCase().includes(filterQuery)
  );

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
        <p>Nenhuma ficha encontrada</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(w => `
    <div class="workout-card" onclick="openPreviewModal('${w.id}')">
      <img src="${w.image}" alt="${w.name}">
      <div class="workout-card-overlay">
        <span class="workout-badge">${w.badge}</span>
        <div class="workout-card-title">${w.name}</div>
        <div class="workout-card-sub" style="color: var(--text-secondary); font-size: 13px; margin-top: 4px;">
          ${w.description}
        </div>
      </div>
    </div>
  `).join('');
}

// Modal de Detalhes da Ficha
function openPreviewModal(workoutId) {
  const workout = PREDEFINED_WORKOUTS.find(w => w.id === workoutId);
  if (!workout) return;

  AppState.currentPreviewWorkout = workout;
  AppState.activePreviewPartition = 0;

  document.getElementById('modal-preview-title').textContent = workout.name;
  document.getElementById('modal-preview-desc').textContent = workout.description;
  document.getElementById('modal-preview-img').src = workout.image;

  renderPreviewPartitions();
  renderPreviewExercises();

  document.getElementById('modal-preview').classList.add('active');
}

function closePreviewModal() {
  document.getElementById('modal-preview').classList.remove('active');
}

function renderPreviewPartitions() {
  const container = document.getElementById('modal-preview-tabs');
  if (!container || !AppState.currentPreviewWorkout) return;

  const partitions = AppState.currentPreviewWorkout.partitions;
  container.innerHTML = partitions.map((p, idx) => `
    <button class="btn btn-outline ${idx === AppState.activePreviewPartition ? 'btn-primary' : ''}" 
            style="height: 36px; padding: 0 14px; font-size: 12px; width: auto;" 
            onclick="switchPreviewPartition(${idx})">
      ${p.name}
    </button>
  `).join('');
}

function switchPreviewPartition(index) {
  AppState.activePreviewPartition = index;
  renderPreviewPartitions();
  renderPreviewExercises();
}

function renderPreviewExercises() {
  const container = document.getElementById('modal-preview-exercises');
  if (!container || !AppState.currentPreviewWorkout) return;

  const currentPartition = AppState.currentPreviewWorkout.partitions[AppState.activePreviewPartition];
  if (!currentPartition) return;

  container.innerHTML = currentPartition.exercises.map(ex => `
    <div style="display: flex; align-items: center; justify-content: space-between; background: var(--surface-highlight); padding: 12px 14px; border-radius: 12px; margin-bottom: 8px;">
      <div>
        <div style="font-weight: 600; font-size: 14px;">${ex.name}</div>
        <div style="font-size: 12px; color: var(--primary);">${ex.muscleGroup}</div>
      </div>
      <div style="background: var(--surface-elevated); padding: 4px 10px; border-radius: 8px; font-weight: 700; font-size: 13px;">
        ${ex.targetSets} x ${ex.targetReps}
      </div>
    </div>
  `).join('');
}

function useCurrentPreviewWorkout() {
  if (!AppState.currentPreviewWorkout) return;
  closePreviewModal();

  // Iniciar treino ativo com a ficha selecionada
  const p = AppState.currentPreviewWorkout.partitions[0];
  AppState.activeWorkout = {
    id: AppState.currentPreviewWorkout.id,
    name: AppState.currentPreviewWorkout.name,
    partitionName: p.name,
    exercises: p.exercises.map(ex => ({
      name: ex.name,
      sets: ex.targetSets,
      reps: ex.targetReps,
      weight: 40,
      completed: new Array(ex.targetSets).fill(false)
    }))
  };

  renderActiveWorkout();
  switchTab('ativo');
}

// Modo Ativo e Timer
function renderActiveWorkout() {
  const nameEl = document.getElementById('active-workout-name');
  const partEl = document.getElementById('active-partition-name');
  const container = document.getElementById('active-exercises-list');

  if (nameEl) nameEl.textContent = AppState.activeWorkout.name;
  if (partEl) partEl.textContent = AppState.activeWorkout.partitionName;

  if (!container) return;

  container.innerHTML = AppState.activeWorkout.exercises.map((ex, exIdx) => `
    <div class="card" style="margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <div>
          <div style="font-size: 16px; font-weight: 700;">${exIdx + 1}. ${ex.name}</div>
          <div style="font-size: 12px; color: var(--primary); font-weight: 600;">${ex.sets} séries • ${ex.reps} reps</div>
        </div>
      </div>
      
      <div>
        ${Array.from({ length: ex.sets }).map((_, setIdx) => `
          <div class="exercise-set-row">
            <span style="font-size: 13px; font-weight: 600; color: var(--text-secondary);">SÉRIE ${setIdx + 1}</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="number" value="${ex.weight}" style="width: 50px; height: 32px; background: var(--surface); border: 1px solid var(--border-subtle); border-radius: 6px; color: #fff; text-align: center; font-weight: 700;" readonly> kg
            </div>
            <div class="set-check ${ex.completed[setIdx] ? 'completed' : ''}" onclick="toggleSetCheck(${exIdx}, ${setIdx})">
              ${ex.completed[setIdx] ? '✓' : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function toggleSetCheck(exIdx, setIdx) {
  const isNowCompleted = !AppState.activeWorkout.exercises[exIdx].completed[setIdx];
  AppState.activeWorkout.exercises[exIdx].completed[setIdx] = isNowCompleted;
  
  renderActiveWorkout();

  // Disparar descanso se concluiu a série
  if (isNowCompleted) {
    startRestTimer(60);
  }
}

function startRestTimer(seconds = 60) {
  clearInterval(AppState.restTimer.intervalId);
  AppState.restTimer.duration = seconds;
  AppState.restTimer.remaining = seconds;
  AppState.restTimer.running = true;

  updateTimerDisplay();

  AppState.restTimer.intervalId = setInterval(() => {
    AppState.restTimer.remaining--;
    updateTimerDisplay();

    if (AppState.restTimer.remaining <= 0) {
      clearInterval(AppState.restTimer.intervalId);
      AppState.restTimer.running = false;
      alert('⏰ Tempo de descanso finalizado!');
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerDigits = document.getElementById('timer-digits');
  if (!timerDigits) return;

  const mins = String(Math.floor(AppState.restTimer.remaining / 60)).padStart(2, '0');
  const secs = String(AppState.restTimer.remaining % 60).padStart(2, '0');
  timerDigits.textContent = `${mins}:${secs}`;
}

function finishActiveWorkout() {
  alert('🎉 Parabéns! Treino finalizado e salvo no seu histórico.');
  switchTab('home');
}

// Modal de Seleção de Exercícios para o Construtor
function openExerciseSelectorModal() {
  renderExercisesCatalog();
  document.getElementById('modal-exercises').classList.add('active');
}

function closeExerciseSelectorModal() {
  document.getElementById('modal-exercises').classList.remove('active');
}

function renderExercisesCatalog(filterQuery = '') {
  const container = document.getElementById('exercises-catalog-list');
  if (!container) return;

  const filtered = EXERCISES_CATALOG.filter(ex => 
    ex.name.toLowerCase().includes(filterQuery) || 
    ex.muscle_group.toLowerCase().includes(filterQuery)
  );

  container.innerHTML = filtered.map(ex => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border-bottom: 1px solid var(--border-subtle); cursor: pointer;" onclick="addExerciseToBuilder('${ex.name}', '${ex.muscle_group}')">
      <div>
        <div style="font-weight: 600; font-size: 14px;">${ex.name}</div>
        <div style="font-size: 12px; color: var(--primary);">${ex.muscle_group}</div>
      </div>
      <button class="btn btn-outline" style="width: 36px; height: 36px; border-radius: 50%; padding: 0;">+</button>
    </div>
  `).join('');
}

function addExerciseToBuilder(name, muscleGroup) {
  if (AppState.builderPartitions.length > 0) {
    AppState.builderPartitions[0].exercises.push({
      name,
      muscleGroup,
      sets: 3,
      reps: 10
    });
    renderBuilderPartitions();
  }
  closeExerciseSelectorModal();
}

function renderBuilderPartitions() {
  const container = document.getElementById('builder-partitions-list');
  if (!container) return;

  container.innerHTML = AppState.builderPartitions.map((p, pIdx) => `
    <div class="card">
      <input type="text" value="${p.name}" style="background: transparent; border: none; font-size: 16px; font-weight: 700; color: var(--primary); margin-bottom: 12px; outline: none; width: 100%;">
      
      ${p.exercises.length === 0 ? `
        <p style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 10px 0;">Nenhum exercício nesta ficha.</p>
      ` : p.exercises.map((ex, exIdx) => `
        <div style="background: var(--surface-highlight); padding: 10px 12px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 14px; font-weight: 600;">${ex.name}</div>
            <div style="font-size: 11px; color: var(--primary);">${ex.muscleGroup} • ${ex.sets}x${ex.reps}</div>
          </div>
        </div>
      `).join('')}

      <button class="btn btn-outline" style="height: 38px; font-size: 13px; margin-top: 8px;" onclick="openExerciseSelectorModal()">
        + Adicionar Exercício
      </button>
    </div>
  `).join('');
}

function saveCustomPlan() {
  alert('✨ Plano salvo com sucesso no seu perfil!');
  switchTab('home');
}
