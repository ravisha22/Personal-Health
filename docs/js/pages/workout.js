// workout.js — Interactive workout runner with step-by-step experience
(function() {

  // ===== Cycle Calculator (shared logic) =====
  function getTodaysPlan(startDate) {
    var start = new Date(startDate + 'T00:00:00');
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var daysSinceStart = Math.floor((now - start) / 86400000);
    if (daysSinceStart < 0) daysSinceStart = 0;

    var exerciseDay = daysSinceStart % 7;
    var isRestDay = exerciseDay >= 5;
    var workoutDayIndex = -1;
    if (!isRestDay) {
      var totalWorkoutDays = 0;
      for (var i = 0; i <= daysSinceStart; i++) {
        if (i % 7 < 5) totalWorkoutDays++;
      }
      workoutDayIndex = (totalWorkoutDays - 1) % 20;
    }

    return {
      isRestDay: isRestDay,
      exerciseWeek: isRestDay ? -1 : Math.floor(workoutDayIndex / 5),
      exerciseDay: isRestDay ? -1 : workoutDayIndex % 5,
      workoutDayIndex: workoutDayIndex,
      mealDay: daysSinceStart % 7,
      daysSinceStart: daysSinceStart
    };
  }

  function getStartDate() {
    return Utils.getSetting('program_start_date', '2025-04-28');
  }

  // ===== Safe data access =====
  function safeGetWorkout(plan) {
    if (typeof ExerciseProgram === 'undefined' || !ExerciseProgram) return null;
    var weeks = ExerciseProgram.weeks;
    if (!weeks) return null;
    var wk = weeks[plan.exerciseWeek];
    if (!wk || !wk.days) return null;
    return wk.days[plan.exerciseDay] || null;
  }

  function safeGetExercise(exerciseId) {
    if (typeof ExerciseLibrary === 'undefined' || !ExerciseLibrary) return null;
    return ExerciseLibrary[exerciseId] || null;
  }

  // ===== State =====
  var workoutState = {
    warmupComplete: false,
    cardioComplete: false,
    setsCompleted: {}, // exerciseId-setIdx -> true
    preChecklist: {},
    postChecklist: {},
    startTime: null,
    rpe: 6,
    notes: ''
  };

  // ===== Render =====
  function render() {
    var plan = getTodaysPlan(getStartDate());

    if (plan.isRestDay) {
      return '<div class="page">' +
        '<div class="page-header">' +
          '<h1 class="page-title">\uD83E\uDDD8 Rest Day</h1>' +
          '<p class="page-subtitle">No workout scheduled today</p>' +
        '</div>' +
        '<div class="card">' +
          '<p class="text-secondary">Enjoy your rest day! Consider gentle mobility work, foam rolling, or a light walk.</p>' +
          '<a href="#/today" class="btn btn-secondary btn-block mt-4">\u2190 Back to Today</a>' +
        '</div>' +
        '</div>';
    }

    var workout = safeGetWorkout(plan);
    if (!workout) {
      return '<div class="page">' +
        '<div class="page-header">' +
          '<h1 class="page-title">\uD83C\uDFCB\uFE0F Workout</h1>' +
          '<p class="page-subtitle">Loading program data\u2026</p>' +
        '</div>' +
        '<div class="card">' +
          '<div class="alert alert-info">Exercise program data is loading or not yet available. Please check back shortly.</div>' +
          '<a href="#/today" class="btn btn-secondary btn-block mt-4">\u2190 Back to Today</a>' +
        '</div>' +
        '</div>';
    }

    // Reset state for fresh render
    workoutState.startTime = Date.now();

    var dayLabel = 'Day ' + (plan.workoutDayIndex + 1);
    var name = workout.name || ('Week ' + (plan.exerciseWeek + 1) + ', Day ' + (plan.exerciseDay + 1));

    var html = '<div class="page">';

    // Header
    html += '<div class="page-header">' +
      '<h1 class="page-title">\uD83C\uDFCB\uFE0F ' + Utils.escapeHtml(dayLabel + ' \u2014 ' + name) + '</h1>' +
      '<p class="page-subtitle">Week ' + (plan.exerciseWeek + 1) + ' \u2022 ' +
        (workout.estimatedMinutes ? '~' + workout.estimatedMinutes + ' min' : '') + '</p>' +
      '</div>';

    // Pre-workout checklist
    html += renderPreChecklist();

    // Warm-up section
    html += renderWarmup(workout);

    // Cardio block
    html += renderCardio(workout);

    // Main workout exercises
    html += renderMainExercises(workout);

    // Core block
    html += renderCoreBlock(workout);

    // Cool-down section
    html += renderCooldown(workout);

    // Post-workout checklist
    html += renderPostChecklist();

    // Complete workout button
    html += '<div class="card mt-4" style="text-align:center">' +
      '<div class="form-group">' +
        '<label class="form-label">Overall RPE</label>' +
        '<div class="flex items-center gap-3">' +
          '<input type="range" class="form-range" id="wo-final-rpe" min="1" max="10" value="6" style="flex:1">' +
          '<span id="wo-rpe-display" class="font-bold" style="min-width:2rem;text-align:center">6</span>' +
        '</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label">Notes</label>' +
        '<textarea class="form-textarea" id="wo-final-notes" placeholder="How did it feel? Any issues\u2026"></textarea>' +
      '</div>' +
      '<button class="btn btn-primary btn-block btn-lg" id="wo-complete-btn">' +
        '\u2705 Complete Workout' +
      '</button>' +
      '</div>';

    html += Safety.renderDisclaimer();
    html += '</div>';
    return html;
  }

  // ===== Pre-workout Checklist =====
  function renderPreChecklist() {
    var items = [
      { id: 'hydration', label: '\uD83D\uDCA7 Hydrated (500ml+ water)' },
      { id: 'joints', label: '\uD83E\uDDB4 Joint check \u2014 no acute pain' },
      { id: 'meds', label: '\uD83D\uDC8A Medications taken' },
      { id: 'fuel', label: '\uD83C\uDF4C Pre-workout fuel eaten' },
      { id: 'footwear', label: '\uD83D\uDC5F Proper footwear on' }
    ];

    var html = '<div class="card mb-4">' +
      '<div class="card-header">' +
        '<h2 class="card-title">\u2705 Pre-Workout Checklist</h2>' +
      '</div>';

    for (var i = 0; i < items.length; i++) {
      html += '<label class="form-check" style="border-bottom:1px solid var(--color-border);padding:var(--space-2) 0">' +
        '<input type="checkbox" class="pre-check-item" data-check-id="' + items[i].id + '">' +
        '<span>' + items[i].label + '</span>' +
        '</label>';
    }

    html += '</div>';
    return html;
  }

  // ===== Warm-up Section =====
  function renderWarmup(workout) {
    var warmup = workout.warmup;
    if (!warmup || warmup.length === 0) {
      return '<div class="card mb-4">' +
        '<div class="card-header">' +
          '<h2 class="card-title">\uD83E\uDD38 Warm-Up</h2>' +
        '</div>' +
        '<ul style="padding-left:1.25rem;margin:0;color:var(--color-text-secondary);font-size:var(--text-sm)">' +
          '<li>5 min light cardio (walk, jog in place)</li>' +
          '<li>Arm circles \u2014 10 each direction</li>' +
          '<li>Leg swings \u2014 10 each leg</li>' +
          '<li>Bodyweight squats \u2014 10 reps</li>' +
          '<li>Cat-cow stretches \u2014 10 reps</li>' +
        '</ul>' +
        '<button class="btn btn-secondary btn-block mt-4 section-complete-btn" data-section="warmup">' +
          'Complete Warm-Up \u2713' +
        '</button>' +
        '</div>';
    }

    var html = '<div class="card mb-4">' +
      '<div class="card-header">' +
        '<h2 class="card-title">\uD83E\uDD38 Warm-Up</h2>' +
      '</div>';

    for (var i = 0; i < warmup.length; i++) {
      var w = warmup[i];
      var wName = (typeof w === 'string') ? w : (w.name || 'Warm-up exercise');
      var wDuration = (w && w.duration) ? ' \u2014 ' + w.duration : '';
      var wReps = (w && w.reps) ? ' \u2014 ' + w.reps : '';
      html += '<div style="padding:var(--space-2) 0;border-bottom:1px solid var(--color-border);font-size:var(--text-sm)">' +
        '<span class="font-medium">' + Utils.escapeHtml(wName) + '</span>' +
        '<span class="text-muted">' + Utils.escapeHtml(wDuration + wReps) + '</span>' +
        '</div>';
    }

    html += '<button class="btn btn-secondary btn-block mt-4 section-complete-btn" data-section="warmup">' +
      'Complete Warm-Up \u2713' +
      '</button>' +
      '</div>';

    return html;
  }

  // ===== Cardio Block =====
  function renderCardio(workout) {
    var cardio = workout.cardio;
    if (!cardio) return '';

    var duration = cardio.duration || '20 min';
    var intensity = cardio.intensity || 'Moderate';
    var rpe = cardio.rpe || '4-6';
    var type = cardio.type || 'Treadmill walk';

    return '<div class="card mb-4">' +
      '<div class="card-header">' +
        '<h2 class="card-title">\uD83C\uDFC3 Cardio</h2>' +
        '<span class="tag tag-blue">' + Utils.escapeHtml(String(intensity)) + '</span>' +
      '</div>' +
      '<div class="grid grid-3" style="gap:var(--space-2);margin-bottom:var(--space-3)">' +
        '<div class="text-center">' +
          '<div class="text-xs text-muted">Type</div>' +
          '<div class="font-semibold text-sm">' + Utils.escapeHtml(String(type)) + '</div>' +
        '</div>' +
        '<div class="text-center">' +
          '<div class="text-xs text-muted">Duration</div>' +
          '<div class="font-semibold text-sm">' + Utils.escapeHtml(String(duration)) + '</div>' +
        '</div>' +
        '<div class="text-center">' +
          '<div class="text-xs text-muted">RPE</div>' +
          '<div class="font-semibold text-sm">' + Utils.escapeHtml(String(rpe)) + '</div>' +
        '</div>' +
      '</div>' +
      (cardio.notes ? '<p class="text-xs text-muted">' + Utils.escapeHtml(cardio.notes) + '</p>' : '') +
      '<button class="btn btn-secondary btn-block mt-4 section-complete-btn" data-section="cardio">' +
        'Complete Cardio \u2713' +
      '</button>' +
      '</div>';
  }

  // ===== Main Exercises =====
  function renderMainExercises(workout) {
    var exercises = workout.exercises;
    if (!exercises || exercises.length === 0) return '';

    var html = '<div class="dashboard-section">' +
      '<h2 class="dashboard-section-title">\uD83D\uDCAA Main Workout</h2>';

    for (var i = 0; i < exercises.length; i++) {
      html += renderExerciseCard(exercises[i], i, 'main');
    }

    html += '</div>';
    return html;
  }

  function renderExerciseCard(ex, index, section) {
    var exId = ex.exerciseId || ex.id || '';
    var libEntry = safeGetExercise(exId);
    var name = (libEntry && libEntry.name) || ex.name || ('Exercise ' + (index + 1));
    var targetMuscles = (libEntry && libEntry.targetMuscles) || ex.targetMuscles || [];
    var youtubeId = (libEntry && libEntry.youtubeId) || ex.youtubeId || '';
    var formCues = (libEntry && libEntry.formCues) || ex.formCues || [];
    var goutMod = (libEntry && libEntry.goutModification) || ex.goutModification || '';
    var sets = ex.sets || 3;
    var reps = ex.reps || '10';
    var weight = ex.weight || '';
    var rpe = ex.rpe || '';
    var rest = ex.rest || '90s';
    var cardId = 'ex-' + section + '-' + index;

    var html = '<div class="card mb-4" id="' + cardId + '">';

    // Exercise header
    html += '<div class="flex items-center justify-between mb-2">' +
      '<div>' +
        '<h3 class="font-semibold" style="font-size:var(--text-lg);margin:0">' + Utils.escapeHtml(name) + '</h3>';

    if (targetMuscles.length > 0) {
      html += '<div class="flex gap-1 mt-2" style="flex-wrap:wrap">';
      for (var t = 0; t < targetMuscles.length; t++) {
        html += '<span class="tag" style="font-size:0.65rem">' + Utils.escapeHtml(targetMuscles[t]) + '</span>';
      }
      html += '</div>';
    }

    html += '</div>' +
      '<span class="text-xs text-muted">#' + (index + 1) + '</span>' +
      '</div>';

    // YouTube thumbnail (lazy iframe injection)
    if (youtubeId) {
      html += '<div class="video-container" data-youtube-id="' + Utils.escapeHtml(youtubeId) + '" ' +
        'style="cursor:pointer;position:relative;margin-bottom:var(--space-3);border-radius:var(--radius);overflow:hidden">' +
        '<img src="https://img.youtube.com/vi/' + Utils.escapeHtml(youtubeId) + '/mqdefault.jpg" ' +
          'alt="' + Utils.escapeHtml(name) + ' demo" ' +
          'style="width:100%;display:block;border-radius:var(--radius)"' +
          ' loading="lazy">' +
        '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
          'background:rgba(0,0,0,0.3);border-radius:var(--radius)">' +
          '<span style="font-size:2.5rem">\u25B6\uFE0F</span>' +
        '</div>' +
        '</div>';
    }

    // Sets / Reps / Weight / RPE
    html += '<div class="grid grid-' + (rpe ? '4' : '3') + '" style="gap:var(--space-2);margin-bottom:var(--space-3);text-align:center">' +
      '<div>' +
        '<div class="text-xs text-muted">Sets</div>' +
        '<div class="font-bold">' + sets + '</div>' +
      '</div>' +
      '<div>' +
        '<div class="text-xs text-muted">Reps</div>' +
        '<div class="font-bold">' + Utils.escapeHtml(String(reps)) + '</div>' +
      '</div>' +
      '<div>' +
        '<div class="text-xs text-muted">Weight</div>' +
        '<div class="font-bold">' + (weight ? Utils.escapeHtml(String(weight)) : '\u2014') + '</div>' +
      '</div>';

    if (rpe) {
      html += '<div>' +
        '<div class="text-xs text-muted">RPE</div>' +
        '<div class="font-bold">' + Utils.escapeHtml(String(rpe)) + '</div>' +
        '</div>';
    }

    html += '</div>';

    // Rest timer display
    html += '<div class="flex items-center justify-between mb-4" style="font-size:var(--text-sm)">' +
      '<span class="text-muted">\u23F1 Rest: ' + Utils.escapeHtml(String(rest)) + '</span>' +
      '<button class="btn btn-ghost btn-sm rest-timer-btn" data-rest="' + Utils.escapeHtml(String(rest)) + '" ' +
        'data-card="' + cardId + '">Start Timer</button>' +
      '</div>';

    // Form cues
    if (formCues.length > 0) {
      html += '<details style="margin-bottom:var(--space-3)">' +
        '<summary class="font-medium text-sm" style="cursor:pointer;padding:var(--space-2) 0;min-height:44px;display:flex;align-items:center">' +
          '\uD83D\uDCCB Form Cues' +
        '</summary>' +
        '<ul style="padding-left:1.25rem;margin:var(--space-2) 0 0 0;font-size:var(--text-sm);color:var(--color-text-secondary)">';
      for (var f = 0; f < formCues.length; f++) {
        html += '<li>' + Utils.escapeHtml(formCues[f]) + '</li>';
      }
      html += '</ul></details>';
    }

    // Gout modification warning
    if (goutMod) {
      html += '<div class="alert alert-warning" style="margin-bottom:var(--space-3)">' +
        '<strong>\u26A0\uFE0F Gout Modification:</strong> ' + Utils.escapeHtml(goutMod) +
        '</div>';
    }

    // Set completion checkboxes
    html += '<div class="flex gap-3" style="flex-wrap:wrap">';
    for (var s = 0; s < sets; s++) {
      var checkId = section + '-' + index + '-set-' + s;
      html += '<label class="form-check set-check" style="min-width:auto">' +
        '<input type="checkbox" class="set-checkbox" data-exercise="' + section + '-' + index + '" data-set="' + s + '">' +
        '<span class="text-sm">Set ' + (s + 1) + '</span>' +
        '</label>';
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  // ===== Core Block =====
  function renderCoreBlock(workout) {
    var core = workout.core;
    if (!core || core.length === 0) return '';

    var html = '<div class="dashboard-section">' +
      '<h2 class="dashboard-section-title">\uD83E\uDDBE Core</h2>';

    for (var i = 0; i < core.length; i++) {
      html += renderExerciseCard(core[i], i, 'core');
    }

    html += '</div>';
    return html;
  }

  // ===== Cool-down Section =====
  function renderCooldown(workout) {
    var cooldown = workout.cooldown;
    if (!cooldown || cooldown.length === 0) {
      return '<div class="card mb-4">' +
        '<div class="card-header">' +
          '<h2 class="card-title">\uD83E\uDDD8 Cool-Down</h2>' +
        '</div>' +
        '<ul style="padding-left:1.25rem;margin:0;color:var(--color-text-secondary);font-size:var(--text-sm)">' +
          '<li>Hamstring stretch \u2014 30s each side</li>' +
          '<li>Quad stretch \u2014 30s each side</li>' +
          '<li>Chest doorway stretch \u2014 30s</li>' +
          '<li>Child\'s pose \u2014 60s</li>' +
          '<li>Deep breathing \u2014 5 breaths</li>' +
        '</ul>' +
        '<button class="btn btn-secondary btn-block mt-4 section-complete-btn" data-section="cooldown">' +
          'Complete Cool-Down \u2713' +
        '</button>' +
        '</div>';
    }

    var html = '<div class="card mb-4">' +
      '<div class="card-header">' +
        '<h2 class="card-title">\uD83E\uDDD8 Cool-Down</h2>' +
      '</div>';

    for (var i = 0; i < cooldown.length; i++) {
      var c = cooldown[i];
      var cName = (typeof c === 'string') ? c : (c.name || 'Stretch');
      var cHold = (c && c.hold) ? ' \u2014 ' + c.hold : '';
      var cReps = (c && c.reps) ? ' \u2014 ' + c.reps : '';
      html += '<div style="padding:var(--space-2) 0;border-bottom:1px solid var(--color-border);font-size:var(--text-sm)">' +
        '<span class="font-medium">' + Utils.escapeHtml(cName) + '</span>' +
        '<span class="text-muted">' + Utils.escapeHtml(cHold + cReps) + '</span>' +
        '</div>';
    }

    html += '<button class="btn btn-secondary btn-block mt-4 section-complete-btn" data-section="cooldown">' +
      'Complete Cool-Down \u2713' +
      '</button>' +
      '</div>';

    return html;
  }

  // ===== Post-workout Checklist =====
  function renderPostChecklist() {
    var items = [
      { id: 'rehydrate', label: '\uD83D\uDCA7 Rehydrate (500ml+ water)' },
      { id: 'protein', label: '\uD83E\uDD69 Protein within 30 min' },
      { id: 'foam-roll', label: '\uD83E\uDDBF Foam roll worked muscles' },
      { id: 'stretch', label: '\uD83E\uDDD8 Full-body stretch' },
      { id: 'joint-scan', label: '\uD83E\uDDB4 Joint pain scan \u2014 any new pain?' },
      { id: 'log-it', label: '\uD83D\uDCDD Log it (happening now!)' }
    ];

    var html = '<div class="card mb-4">' +
      '<div class="card-header">' +
        '<h2 class="card-title">\u2705 Post-Workout Checklist</h2>' +
      '</div>';

    for (var i = 0; i < items.length; i++) {
      html += '<label class="form-check" style="border-bottom:1px solid var(--color-border);padding:var(--space-2) 0">' +
        '<input type="checkbox" class="post-check-item" data-check-id="' + items[i].id + '">' +
        '<span>' + items[i].label + '</span>' +
        '</label>';
    }

    html += '</div>';
    return html;
  }

  // ===== After Render: Event Bindings =====
  function afterRender() {
    // RPE slider
    var rpeSlider = document.getElementById('wo-final-rpe');
    var rpeDisplay = document.getElementById('wo-rpe-display');
    if (rpeSlider && rpeDisplay) {
      rpeSlider.addEventListener('input', function() {
        rpeDisplay.textContent = rpeSlider.value;
      });
    }

    // Section complete buttons
    var sectionBtns = document.querySelectorAll('.section-complete-btn');
    for (var i = 0; i < sectionBtns.length; i++) {
      (function(btn) {
        btn.addEventListener('click', function() {
          btn.textContent = '\u2705 Done!';
          btn.disabled = true;
          btn.style.opacity = '0.6';
          var section = btn.getAttribute('data-section');
          if (section === 'warmup') workoutState.warmupComplete = true;
          if (section === 'cardio') workoutState.cardioComplete = true;
        });
      })(sectionBtns[i]);
    }

    // YouTube thumbnail → iframe injection
    var videoContainers = document.querySelectorAll('.video-container');
    for (var v = 0; v < videoContainers.length; v++) {
      (function(container) {
        container.addEventListener('click', function() {
          var ytId = container.getAttribute('data-youtube-id');
          if (!ytId) return;

          var iframe = container.querySelector('iframe');
          if (iframe) {
            // Collapse: remove iframe, restore thumbnail
            container.innerHTML = '<img src="https://img.youtube.com/vi/' + Utils.escapeHtml(ytId) + '/mqdefault.jpg" ' +
              'alt="Exercise demo" style="width:100%;display:block;border-radius:var(--radius)" loading="lazy">' +
              '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
                'background:rgba(0,0,0,0.3);border-radius:var(--radius)">' +
                '<span style="font-size:2.5rem">\u25B6\uFE0F</span>' +
              '</div>';
          } else {
            // Expand: inject iframe
            container.innerHTML = '<iframe src="https://www.youtube.com/embed/' + Utils.escapeHtml(ytId) + '?autoplay=1&rel=0" ' +
              'style="width:100%;aspect-ratio:16/9;border:none;border-radius:var(--radius)" ' +
              'allow="autoplay;encrypted-media" allowfullscreen></iframe>' +
              '<a href="https://www.youtube.com/watch?v=' + Utils.escapeHtml(ytId) + '" ' +
                'target="_blank" rel="noopener" class="text-xs text-muted" ' +
                'style="display:block;text-align:center;margin-top:var(--space-1);text-decoration:underline"' +
                ' onclick="event.stopPropagation()">' +
                'Open in YouTube \u2197' +
              '</a>';
          }
        });
      })(videoContainers[v]);
    }

    // Rest timer buttons
    var restBtns = document.querySelectorAll('.rest-timer-btn');
    for (var r = 0; r < restBtns.length; r++) {
      (function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var restStr = btn.getAttribute('data-rest') || '90s';
          var seconds = parseInt(restStr) || 90;
          startRestTimer(btn, seconds);
        });
      })(restBtns[r]);
    }

    // Complete workout button
    var completeBtn = document.getElementById('wo-complete-btn');
    if (completeBtn) {
      completeBtn.addEventListener('click', function() {
        saveWorkout();
      });
    }
  }

  // ===== Rest Timer =====
  function startRestTimer(btn, totalSeconds) {
    if (btn._timerRunning) return;
    btn._timerRunning = true;
    var remaining = totalSeconds;
    var originalText = btn.textContent;

    btn.className = 'btn btn-primary btn-sm rest-timer-btn';

    var interval = setInterval(function() {
      remaining--;
      if (remaining <= 0) {
        clearInterval(interval);
        btn.textContent = '\u2705 Go!';
        btn.className = 'btn btn-ghost btn-sm rest-timer-btn';
        btn._timerRunning = false;
        setTimeout(function() {
          btn.textContent = originalText;
        }, 3000);
      } else {
        var mins = Math.floor(remaining / 60);
        var secs = remaining % 60;
        btn.textContent = (mins > 0 ? mins + ':' : '') + (secs < 10 ? '0' : '') + secs;
      }
    }, 1000);

    btn.textContent = totalSeconds + 's';
  }

  // ===== Save Workout =====
  async function saveWorkout() {
    // Calculate completion percentage
    var allSets = document.querySelectorAll('.set-checkbox');
    var checkedSets = document.querySelectorAll('.set-checkbox:checked');
    var totalSets = allSets.length || 1;
    var completedSets = checkedSets.length;
    var completionPct = Math.round((completedSets / totalSets) * 100);

    var rpeEl = document.getElementById('wo-final-rpe');
    var notesEl = document.getElementById('wo-final-notes');
    var rpe = rpeEl ? parseInt(rpeEl.value) : 6;
    var notes = notesEl ? notesEl.value.trim() : '';

    var elapsed = workoutState.startTime ? Math.round((Date.now() - workoutState.startTime) / 60000) : 0;

    var entry = {
      date: Utils.dateStr(),
      type: 'strength',
      durationMin: elapsed || 60,
      rpe: rpe,
      completionPercent: completionPct,
      setsCompleted: completedSets,
      totalSets: totalSets,
      warmupDone: workoutState.warmupComplete,
      cardioDone: workoutState.cardioComplete,
      notes: notes,
      adherence: completionPct >= 80 ? 'completed' : (completionPct >= 40 ? 'partial' : 'skipped'),
      source: 'workout-runner'
    };

    try {
      await Store.add('workouts', entry);
      Utils.toast('Workout saved! \uD83D\uDCAA ' + completionPct + '% completed', 'success');
      setTimeout(function() {
        App.go('today');
      }, 1500);
    } catch (err) {
      Utils.toast('Error saving workout', 'danger');
      console.error('Workout save error:', err);
    }
  }

  App.register('workout', { render: render, afterRender: afterRender });

})();
