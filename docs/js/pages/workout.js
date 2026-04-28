// workout.js — Interactive workout runner. Maps directly to ExerciseProgram/ExerciseLibrary data shapes.
(function() {
  'use strict';

  function cycle() {
    var sd = Utils.getSetting('program_start_date', Utils.dateStr());
    var start = new Date(sd + 'T00:00:00');
    var now = new Date(); now.setHours(0,0,0,0);
    var d = Math.max(0, Math.floor((now - start) / 86400000));
    var dow = d % 7; var rest = dow >= 5; var wdi = -1;
    if (!rest) { var t = 0; for (var i = 0; i <= d; i++) { if (i % 7 < 5) t++; } wdi = (t - 1) % 20; }
    return { rest: rest, week: rest ? 0 : Math.floor(wdi / 5), day: rest ? 0 : wdi % 5 };
  }

  function getWo(c) {
    if (c.rest || typeof ExerciseProgram === 'undefined') return null;
    var w = ExerciseProgram.weeks; if (!w || !w[c.week]) return null;
    return w[c.week].days[c.day] || null;
  }

  function lib(id) {
    if (typeof ExerciseLibrary === 'undefined' || !id) return null;
    return ExerciseLibrary[id] || null;
  }

  function esc(s) { return Utils.escapeHtml(s || ''); }

  // YouTube thumbnail URL
  function ytThumb(id) { return 'https://img.youtube.com/vi/' + id + '/mqdefault.jpg'; }

  // Render a single exercise card
  function renderExercise(ex, index, section) {
    var info = lib(ex.exerciseId);
    var name = (info && info.name) ? info.name : (ex.exerciseId || 'Exercise ' + (index + 1));
    var muscles = (info && info.targetMuscles) ? info.targetMuscles.join(', ') : '';
    var why = (info && info.why) ? info.why : '';
    var cues = (info && info.formCues) ? info.formCues : [];
    var ytId = (info && info.youtubeId) ? info.youtubeId : '';
    var goutMod = (info && info.goutModification) ? info.goutModification : '';
    var placeholder = (info && info.placeholder);

    var h = '<div class="card mb-4" style="padding:var(--space-4)">';

    // Header
    h += '<div class="flex items-center justify-between mb-2">';
    h += '<h4 class="font-semibold" style="font-size:var(--text-lg)">' + esc(name) + '</h4>';
    h += '<span class="tag tag-blue">' + section + '</span>';
    h += '</div>';

    // Target muscles
    if (muscles) h += '<p class="text-xs text-muted mb-2">Targets: ' + esc(muscles) + '</p>';

    // Why this exercise
    if (why) h += '<p class="text-sm text-secondary mb-4">' + esc(why) + '</p>';

    // YouTube thumbnail + expandable video
    if (ytId && !placeholder) {
      h += '<div class="mb-4">';
      h += '<details class="yt-detail" data-ytid="' + esc(ytId) + '">';
      h += '<summary style="cursor:pointer;list-style:none">';
      h += '<div style="position:relative;border-radius:var(--radius);overflow:hidden">';
      h += '<img src="' + ytThumb(ytId) + '" alt="' + esc(name) + ' demo" style="width:100%;display:block;border-radius:var(--radius)">';
      h += '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.3)">';
      h += '<span style="font-size:2.5rem">▶️</span>';
      h += '</div></div>';
      h += '<span class="text-xs text-muted">Tap to watch form video</span>';
      h += '</summary>';
      h += '<div class="yt-container" style="margin-top:var(--space-2)"></div>';
      h += '<a href="https://www.youtube.com/watch?v=' + esc(ytId) + '" target="_blank" rel="noopener" class="text-xs" style="color:var(--color-primary)">Open in YouTube ↗</a>';
      h += '</details></div>';
    }

    // Sets / Reps / Weight / Rest / RPE
    h += '<div class="grid grid-2 gap-2 mb-4" style="grid-template-columns:repeat(3,1fr)">';
    h += '<div class="metric-card card" style="padding:var(--space-2)"><div class="card-label">Sets</div><div class="card-value" style="font-size:var(--text-lg)">' + (ex.sets || '—') + '</div></div>';
    h += '<div class="metric-card card" style="padding:var(--space-2)"><div class="card-label">Reps</div><div class="card-value" style="font-size:var(--text-lg)">' + esc(String(ex.reps || '—')) + '</div></div>';
    h += '<div class="metric-card card" style="padding:var(--space-2)"><div class="card-label">Weight</div><div class="card-value" style="font-size:var(--text-lg)">' + esc(ex.weight || 'BW') + '</div></div>';
    h += '</div>';

    h += '<div class="flex gap-4 mb-4 text-sm">';
    h += '<span>⏱️ Rest: <strong>' + (ex.restSeconds || 60) + 's</strong></span>';
    h += '<span>💪 RPE: <strong>' + esc(String(ex.rpe || '6')) + '</strong>/10</span>';
    h += '</div>';

    // Form cues
    if (cues.length > 0) {
      h += '<div class="mb-4"><p class="text-sm font-semibold mb-2">✅ Form Cues:</p><ul style="padding-left:var(--space-4)">';
      for (var i = 0; i < cues.length; i++) {
        h += '<li class="text-sm mb-1">' + esc(cues[i]) + '</li>';
      }
      h += '</ul></div>';
    }

    // Notes
    if (ex.notes) h += '<p class="text-sm text-muted mb-2">💡 ' + esc(ex.notes) + '</p>';

    // Gout modification
    if (goutMod && goutMod !== 'None' && goutMod !== 'No change — fully seated.') {
      h += '<div class="alert alert-warning">⚠️ <strong>Gout modification:</strong> ' + esc(goutMod) + '</div>';
    }

    // Set completion checkboxes
    if (ex.sets) {
      h += '<div class="flex gap-2 mt-4">';
      for (var s = 1; s <= ex.sets; s++) {
        h += '<label class="form-check" style="flex:1;justify-content:center;background:var(--color-surface-raised);border-radius:var(--radius);padding:var(--space-2)">';
        h += '<input type="checkbox" class="set-check"> Set ' + s;
        h += '</label>';
      }
      h += '</div>';
    }

    h += '</div>';
    return h;
  }

  // Render warm-up or cool-down list
  function renderRoutine(items, title, emoji) {
    if (!items || items.length === 0) return '';
    var h = '<div class="card mb-4"><div class="card-header"><h3 class="card-title">' + emoji + ' ' + title + '</h3></div>';
    for (var i = 0; i < items.length; i++) {
      var w = items[i];
      var info = lib(w.exerciseId);
      var name = (info && info.name) ? info.name : (w.exerciseId || 'Exercise');
      h += '<div class="log-entry">';
      h += '<div class="log-entry-header">';
      h += '<span class="font-semibold">' + esc(name) + '</span>';
      h += '<span class="text-sm text-muted">' + esc(w.duration || '') + '</span>';
      h += '</div>';
      if (w.notes) h += '<span class="text-xs text-muted">' + esc(w.notes) + '</span>';
      h += '</div>';
    }
    h += '</div>';
    return h;
  }

  // Render cardio block
  function renderCardio(cardio) {
    if (!cardio) return '';
    var info = lib(cardio.exerciseId);
    var name = (info && info.name) ? info.name : 'Cardio';
    var h = '<div class="card mb-4" style="border-left:4px solid var(--color-primary)">';
    h += '<div class="card-header"><h3 class="card-title">🫀 Cardio — ' + esc(name) + '</h3></div>';
    h += '<div class="grid grid-2 gap-2 mb-2">';
    h += '<div><span class="text-sm text-muted">Duration:</span><br><strong>' + esc(cardio.duration) + '</strong></div>';
    h += '<div><span class="text-sm text-muted">Intensity:</span><br><strong>' + esc(cardio.intensity) + '</strong></div>';
    h += '</div>';
    if (cardio.notes) h += '<p class="text-sm text-muted">' + esc(cardio.notes) + '</p>';
    h += '</div>';
    return h;
  }

  App.register('workout', {
    render: function() {
      var c = cycle();
      var wo = getWo(c);

      var h = '<div class="page">';

      if (c.rest) {
        h += '<div class="page-header"><h1 class="page-title">🧘 Rest Day</h1>';
        h += '<p class="page-subtitle">Active recovery — light walk, stretching, foam rolling</p></div>';
        h += '<div class="card"><p class="text-sm">Take it easy today. Recovery is when your muscles grow stronger. Consider a 20-30 min easy walk and some foam rolling.</p></div>';
        h += '</div>';
        return h;
      }

      if (!wo) {
        h += '<div class="page-header"><h1 class="page-title">🏋️ Workout</h1></div>';
        h += '<div class="alert alert-warning">Loading program data...</div></div>';
        return h;
      }

      // Header
      h += '<div class="page-header"><h1 class="page-title">🏋️ Day ' + wo.dayNumber + ' — ' + esc(wo.label) + '</h1>';
      h += '<p class="page-subtitle">Week ' + (c.week + 4) + ' · ~' + (wo.estimatedMinutes || 80) + ' min</p></div>';

      // Pre-workout checklist
      h += '<div class="card mb-4"><div class="card-header"><h3 class="card-title">📋 Pre-Workout Checklist</h3></div>';
      var checks = ['💧 Drank 500ml water 30 min ago', '🦶 Joint check: ankle & knee pain < 3/10', '💊 Took medications as prescribed', '🍌 Light snack 60-90 min ago', '👟 Proper footwear on'];
      for (var i = 0; i < checks.length; i++) {
        h += '<label class="form-check"><input type="checkbox"><span class="text-sm">' + checks[i] + '</span></label>';
      }
      h += '</div>';

      // Warm-up
      h += renderRoutine(wo.warmup, 'Warm-Up', '🔥');

      // Cardio (if placement is after-warmup)
      if (wo.cardio && wo.cardio.placement === 'after-warmup') {
        h += renderCardio(wo.cardio);
      }

      // Main workout
      if (wo.mainWorkout && wo.mainWorkout.length > 0) {
        h += '<div class="mb-2"><h2 style="font-size:var(--text-xl);font-weight:var(--font-bold)">💪 Main Workout</h2></div>';
        for (var i = 0; i < wo.mainWorkout.length; i++) {
          h += renderExercise(wo.mainWorkout[i], i, 'Main');
        }
      }

      // Core block
      if (wo.coreBlock && wo.coreBlock.length > 0) {
        h += '<div class="mb-2"><h2 style="font-size:var(--text-xl);font-weight:var(--font-bold)">🦴 Core</h2></div>';
        for (var i = 0; i < wo.coreBlock.length; i++) {
          h += renderExercise(wo.coreBlock[i], i, 'Core');
        }
      }

      // Cardio (if placement is before-cooldown)
      if (wo.cardio && wo.cardio.placement === 'before-cooldown') {
        h += renderCardio(wo.cardio);
      }

      // Cool-down
      h += renderRoutine(wo.cooldown, 'Cool-Down', '🧘');

      // Post-workout checklist
      h += '<div class="card mb-4"><div class="card-header"><h3 class="card-title">✅ Post-Workout Checklist</h3></div>';
      var postChecks = ['💧 Rehydrate: 500-750ml water', '🥛 Protein: 30-40g within 60 min', '🧽 Foam roll: quads, upper back, lats (30s each)', '🦶 Joint scan: any swelling/warmth in ankle or knee? → ice 15 min', '📊 Log this workout'];
      for (var i = 0; i < postChecks.length; i++) {
        h += '<label class="form-check"><input type="checkbox"><span class="text-sm">' + postChecks[i] + '</span></label>';
      }
      h += '</div>';

      h += '<div class="disclaimer"><strong>⚕️</strong> Stop any exercise if pain exceeds 3/10 in gout-affected joints.</div>';
      h += '</div>';
      return h;
    },

    afterRender: function() {
      // YouTube iframe injection on details expand
      var details = document.querySelectorAll('.yt-detail');
      for (var i = 0; i < details.length; i++) {
        (function(det) {
          det.addEventListener('toggle', function() {
            var container = det.querySelector('.yt-container');
            if (det.open) {
              var ytId = det.getAttribute('data-ytid');
              container.innerHTML = '<iframe width="100%" height="220" src="https://www.youtube.com/embed/' + ytId + '?rel=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius:var(--radius)"></iframe>';
            } else {
              container.innerHTML = '';
            }
          });
        })(details[i]);
      }
    }
  });
})();
