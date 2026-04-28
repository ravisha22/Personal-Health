// today.js — Home screen: today's workout + meals + targets
(function() {
  'use strict';

  function cycle() {
    var sd = Utils.getSetting('program_start_date', Utils.dateStr());
    var start = new Date(sd + 'T00:00:00');
    var now = new Date(); now.setHours(0,0,0,0);
    var d = Math.max(0, Math.floor((now - start) / 86400000));
    var dow = d % 7;
    var rest = dow >= 5;
    var wdi = -1;
    if (!rest) { var t = 0; for (var i = 0; i <= d; i++) { if (i % 7 < 5) t++; } wdi = (t - 1) % 20; }
    return { rest: rest, week: rest ? 0 : Math.floor(wdi / 5), day: rest ? 0 : wdi % 5, mealDay: d % 7 };
  }

  function getWorkout(c) {
    if (c.rest || typeof ExerciseProgram === 'undefined') return null;
    var w = ExerciseProgram.weeks; if (!w || !w[c.week]) return null;
    return w[c.week].days[c.day] || null;
  }

  function getMeals(c) {
    if (typeof MealPlan === 'undefined') return null;
    return MealPlan.days[c.mealDay] || null;
  }

  function getRecipe(id) {
    if (typeof RecipeLibrary === 'undefined') return null;
    return RecipeLibrary[id] || null;
  }

  function getLib(id) {
    if (typeof ExerciseLibrary === 'undefined') return null;
    return ExerciseLibrary[id] || null;
  }

  App.register('today', {
    render: function() {
      var c = cycle();
      var wo = getWorkout(c);
      var ml = getMeals(c);
      var days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
      var now = new Date();
      var dayName = days[now.getDay() === 0 ? 6 : now.getDay() - 1];
      var dateStr = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

      var h = '<div class="page">';
      h += '<div class="page-header"><h1 class="page-title">👋 Today</h1>';
      h += '<p class="page-subtitle">' + dateStr + '</p></div>';

      // Workout card
      h += '<div class="card mb-4">';
      if (c.rest) {
        h += '<div class="card-header"><h3 class="card-title">🧘 Rest Day</h3></div>';
        h += '<p class="text-sm text-secondary">Light stretching or a gentle walk. Recovery is part of the plan.</p>';
      } else if (wo) {
        var exCount = (wo.mainWorkout ? wo.mainWorkout.length : 0) + (wo.coreBlock ? wo.coreBlock.length : 0);
        h += '<div class="card-header"><h3 class="card-title">🏋️ Day ' + wo.dayNumber + ' — ' + (wo.label || 'Workout') + '</h3></div>';
        h += '<p class="text-sm text-secondary">~' + (wo.estimatedMinutes || 80) + ' min · ' + exCount + ' exercises + cardio</p>';
        h += '<div class="mt-4"><a href="#/workout" class="btn btn-primary btn-block btn-lg">Start Workout →</a></div>';
      } else {
        h += '<div class="card-header"><h3 class="card-title">🏋️ Workout</h3></div>';
        h += '<p class="text-sm text-muted">Loading program data...</p>';
      }
      h += '</div>';

      // Meals timeline
      h += '<div class="card mb-4">';
      h += '<div class="card-header"><h3 class="card-title">🍽️ Today\'s Meals</h3></div>';
      if (ml && ml.meals) {
        var hr = now.getHours();
        for (var i = 0; i < ml.meals.length; i++) {
          var m = ml.meals[i];
          var r = getRecipe(m.recipeId);
          var active = (m.type === 'breakfast' && hr < 12) || (m.type === 'lunch' && hr >= 12 && hr < 15) ||
                       (m.type === 'snack' && hr >= 15 && hr < 18) || (m.type === 'dinner' && hr >= 18);
          h += '<a href="#/meals" class="log-entry" style="display:block;text-decoration:none;' + (active ? 'background:var(--color-surface-raised);border-radius:var(--radius);padding:var(--space-2) var(--space-3);margin:0 calc(-1 * var(--space-3))' : '') + '">';
          h += '<div class="log-entry-header">';
          h += '<span class="font-semibold">' + (r ? r.name : m.recipeId) + '</span>';
          h += '<span class="text-sm text-muted">' + (m.time || '') + '</span>';
          h += '</div>';
          if (r) h += '<span class="text-xs text-muted">' + r.nutrition.calories + ' kcal · ' + r.nutrition.protein + 'g protein</span>';
          h += '</a>';
        }
      } else {
        h += '<p class="text-sm text-muted">Loading meal plan...</p>';
      }
      h += '<div class="mt-4"><a href="#/meals" class="btn btn-secondary btn-block btn-sm">View Recipes & Details →</a></div>';
      h += '</div>';

      // Quick log
      h += '<div class="card mb-4">';
      h += '<div class="card-header"><h3 class="card-title">📝 Quick Log</h3></div>';
      h += '<div class="grid grid-2 gap-2">';
      h += '<a href="#/log/vitals" class="btn btn-secondary btn-sm">⚖️ Weight</a>';
      h += '<a href="#/log/hydration" class="btn btn-secondary btn-sm">💧 Water</a>';
      h += '<a href="#/log/pain" class="btn btn-secondary btn-sm">🩹 Pain</a>';
      h += '<a href="#/log/checkin" class="btn btn-secondary btn-sm">📋 Check-in</a>';
      h += '</div></div>';

      h += '<div class="disclaimer"><strong>⚕️</strong> Personal tracking companion — not medical advice.</div>';
      h += '</div>';
      return h;
    },
    afterRender: function() {}
  });
})();
