// today.js — Home screen: today's workout, meals, targets, streak
(function() {

  // ===== Cycle Calculator =====
  function getTodaysPlan(startDate) {
    var start = new Date(startDate + 'T00:00:00');
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var daysSinceStart = Math.floor((now - start) / 86400000);
    if (daysSinceStart < 0) daysSinceStart = 0;

    var exerciseDay = daysSinceStart % 7; // 0=Mon through 6=Sun
    var isRestDay = exerciseDay >= 5; // Sat/Sun
    var workoutDayIndex = -1;
    if (!isRestDay) {
      var totalWorkoutDays = 0;
      for (var i = 0; i <= daysSinceStart; i++) {
        if (i % 7 < 5) totalWorkoutDays++;
      }
      workoutDayIndex = (totalWorkoutDays - 1) % 20; // 20 workout days in 4-week cycle
    }

    var mealDayIndex = daysSinceStart % 7;

    return {
      isRestDay: isRestDay,
      exerciseWeek: isRestDay ? -1 : Math.floor(workoutDayIndex / 5), // 0-3
      exerciseDay: isRestDay ? -1 : workoutDayIndex % 5, // 0-4
      workoutDayIndex: workoutDayIndex,
      mealDay: mealDayIndex, // 0-6
      daysSinceStart: daysSinceStart
    };
  }

  // ===== Helpers =====
  var DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var DAY_EMOJIS = ['\uD83D\uDCAA', '\uD83D\uDD25', '\u26A1', '\uD83C\uDFAF', '\uD83D\uDE80', '\uD83E\uDDD8', '\uD83D\uDE34'];
  var MEAL_TIMES = ['7:30 AM', '12:30 PM', '3:30 PM', '7:00 PM'];
  var MEAL_LABELS = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

  function getStartDate() {
    return Utils.getSetting('program_start_date', '2025-04-28');
  }

  function formatDateHeader() {
    var now = new Date();
    var options = { weekday: 'long', month: 'long', day: 'numeric' };
    try {
      return now.toLocaleDateString(undefined, options);
    } catch (e) {
      return DAY_NAMES[now.getDay() === 0 ? 6 : now.getDay() - 1] + ', ' + now.toLocaleDateString();
    }
  }

  function getDayEmoji(plan) {
    var idx = plan.mealDay;
    return DAY_EMOJIS[idx] || '\uD83D\uDCC5';
  }

  function getCurrentMealIndex() {
    var hour = new Date().getHours();
    if (hour < 10) return 0; // breakfast
    if (hour < 15) return 1; // lunch
    if (hour < 17) return 2; // snack
    return 3; // dinner
  }

  function safeGetWorkout(plan) {
    if (typeof ExerciseProgram === 'undefined' || !ExerciseProgram) return null;
    var weeks = ExerciseProgram.weeks;
    if (!weeks) return null;
    var wk = weeks[plan.exerciseWeek];
    if (!wk || !wk.days) return null;
    return wk.days[plan.exerciseDay] || null;
  }

  function safeGetMeals(plan) {
    if (typeof MealPlan === 'undefined' || !MealPlan) return null;
    var days = MealPlan.days;
    if (!days) return null;
    return days[plan.mealDay] || null;
  }

  function safeGetRecipe(recipeId) {
    if (typeof RecipeLibrary === 'undefined' || !RecipeLibrary) return null;
    return RecipeLibrary[recipeId] || null;
  }

  function countExercises(workout) {
    var count = 0;
    if (workout.exercises) count += workout.exercises.length;
    if (workout.core) count += workout.core.length;
    return count;
  }

  // ===== Render =====
  async function render() {
    var plan = getTodaysPlan(getStartDate());
    var dateStr = formatDateHeader();
    var emoji = getDayEmoji(plan);

    var html = '<div class="page">';

    // Date header
    html += '<div class="page-header">' +
      '<h1 class="page-title">' + emoji + ' ' + Utils.escapeHtml(dateStr) + '</h1>' +
      '<p class="page-subtitle">Day ' + (plan.daysSinceStart + 1) + ' of your program</p>' +
      '</div>';

    // Today's workout card
    html += renderWorkoutCard(plan);

    // Today's meals timeline
    html += renderMealsTimeline(plan);

    // Daily targets
    html += await renderDailyTargets();

    // Quick log row
    html += renderQuickLogRow();

    // Streak counter
    html += await renderStreak();

    html += Safety.renderDisclaimer();
    html += '</div>';
    return html;
  }

  function renderWorkoutCard(plan) {
    if (plan.isRestDay) {
      return '<div class="card mb-4">' +
        '<div class="card-header">' +
          '<h2 class="card-title">\uD83E\uDDD8 Rest Day</h2>' +
          '<span class="tag tag-green">Recovery</span>' +
        '</div>' +
        '<p class="text-sm text-secondary" style="margin-bottom:var(--space-3)">' +
          'Your body rebuilds on rest days. Consider light activity:' +
        '</p>' +
        '<ul style="padding-left:1.25rem;margin:0 0 var(--space-3) 0;color:var(--color-text-secondary);font-size:var(--text-sm)">' +
          '<li>10-15 min gentle walk</li>' +
          '<li>Foam rolling &amp; stretching</li>' +
          '<li>Joint mobility drills</li>' +
          '<li>Hydrate extra today</li>' +
        '</ul>' +
        '</div>';
    }

    var workout = safeGetWorkout(plan);
    if (!workout) {
      return '<div class="card mb-4">' +
        '<div class="card-header">' +
          '<h2 class="card-title">\uD83C\uDFCB\uFE0F Today\'s Workout</h2>' +
        '</div>' +
        '<div class="alert alert-info">Loading program data\u2026</div>' +
        '</div>';
    }

    var dayLabel = 'Day ' + (plan.workoutDayIndex + 1);
    var name = workout.name || ('Week ' + (plan.exerciseWeek + 1) + ' Day ' + (plan.exerciseDay + 1));
    var estTime = workout.estimatedMinutes ? ('~' + workout.estimatedMinutes + ' min') : '~60 min';
    var numExercises = countExercises(workout);

    return '<div class="card mb-4">' +
      '<div class="card-header">' +
        '<h2 class="card-title">\uD83C\uDFCB\uFE0F Today\'s Workout</h2>' +
        '<span class="tag tag-blue">Week ' + (plan.exerciseWeek + 1) + '</span>' +
      '</div>' +
      '<p class="font-semibold" style="font-size:var(--text-lg);margin-bottom:var(--space-2)">' +
        Utils.escapeHtml(dayLabel + ' \u2014 ' + name) +
      '</p>' +
      '<div class="flex items-center gap-3 mb-4" style="flex-wrap:wrap">' +
        '<span class="tag">\u23F1 ' + estTime + '</span>' +
        '<span class="tag">\uD83D\uDCAA ' + numExercises + ' exercises</span>' +
      '</div>' +
      '<a href="#/workout" class="btn btn-primary btn-block btn-lg">' +
        'Start Workout \u2192' +
      '</a>' +
      '</div>';
  }

  function renderMealsTimeline(plan) {
    var dayData = safeGetMeals(plan);
    var currentMealIdx = getCurrentMealIndex();

    var html = '<div class="dashboard-section">' +
      '<h2 class="dashboard-section-title">\uD83C\uDF7D Today\'s Meals</h2>';

    if (!dayData || !dayData.meals) {
      html += '<div class="card"><div class="alert alert-info">Loading meal plan data\u2026</div></div>';
      html += '</div>';
      return html;
    }

    var meals = dayData.meals;
    for (var i = 0; i < meals.length; i++) {
      var meal = meals[i];
      var recipe = safeGetRecipe(meal.recipeId);
      var mealName = recipe ? recipe.name : (meal.name || MEAL_LABELS[i] || 'Meal');
      var mealTime = meal.time || MEAL_TIMES[i] || '';
      var cal = meal.calories || (recipe && recipe.nutrition ? recipe.nutrition.calories : 0) || 0;
      var protein = meal.protein || (recipe && recipe.nutrition ? recipe.nutrition.protein : 0) || 0;
      var isCurrent = (i === currentMealIdx);

      var borderStyle = isCurrent
        ? 'border-left:3px solid var(--color-primary);'
        : 'border-left:3px solid var(--color-border);';

      html += '<a href="#/meals?expand=' + i + '" class="card mb-2" ' +
        'style="display:block;text-decoration:none;color:inherit;padding:var(--space-3) var(--space-4);' + borderStyle + '">' +
        '<div class="flex items-center justify-between">' +
          '<div>' +
            '<span class="font-semibold">' + Utils.escapeHtml(mealName) + '</span>' +
            (isCurrent ? ' <span class="tag tag-green" style="font-size:0.65rem">NOW</span>' : '') +
          '</div>' +
          '<span class="text-xs text-muted">' + Utils.escapeHtml(mealTime) + '</span>' +
        '</div>' +
        '<div class="flex gap-3 mt-2 text-xs text-secondary">' +
          '<span>\uD83D\uDD25 ' + cal + ' cal</span>' +
          '<span>\uD83E\uDD69 ' + protein + 'g protein</span>' +
        '</div>' +
        '</a>';
    }

    html += '</div>';
    return html;
  }

  async function renderDailyTargets() {
    var todayHydration = 0;
    var todayCalories = 0;
    var todayProtein = 0;

    try { todayHydration = await Store.getTodayHydration(); } catch (e) {}

    var todayMeals = [];
    try { todayMeals = await Store.getByDate('meals', Utils.dateStr()); } catch (e) {}
    for (var i = 0; i < todayMeals.length; i++) {
      todayCalories += todayMeals[i].calories || 0;
      todayProtein += todayMeals[i].protein || 0;
    }

    var waterTarget = 3000; // 3L in ml
    var calTarget = 2200;
    var proteinTarget = 180;

    var waterPct = Math.min(Math.round((todayHydration / waterTarget) * 100), 100);
    var calPct = Math.min(Math.round((todayCalories / calTarget) * 100), 100);
    var proteinPct = Math.min(Math.round((todayProtein / proteinTarget) * 100), 100);

    return '<div class="dashboard-section">' +
      '<h2 class="dashboard-section-title">\uD83C\uDFAF Daily Targets</h2>' +
      '<div class="grid grid-3" style="gap:var(--space-2)">' +

        '<div class="card" style="padding:var(--space-3);text-align:center">' +
          '<div class="text-xs text-muted">\uD83D\uDCA7 Water</div>' +
          '<div class="font-bold" style="font-size:var(--text-lg)">' + waterPct + '%</div>' +
          '<div style="background:var(--color-surface-raised);height:4px;border-radius:4px;margin-top:var(--space-1)">' +
            '<div style="background:var(--color-info);width:' + waterPct + '%;height:100%;border-radius:4px"></div>' +
          '</div>' +
          '<div class="text-xs text-muted mt-2">' + (todayHydration / 1000).toFixed(1) + ' / 3L</div>' +
        '</div>' +

        '<div class="card" style="padding:var(--space-3);text-align:center">' +
          '<div class="text-xs text-muted">\uD83D\uDD25 Calories</div>' +
          '<div class="font-bold" style="font-size:var(--text-lg)">' + calPct + '%</div>' +
          '<div style="background:var(--color-surface-raised);height:4px;border-radius:4px;margin-top:var(--space-1)">' +
            '<div style="background:var(--color-warning);width:' + calPct + '%;height:100%;border-radius:4px"></div>' +
          '</div>' +
          '<div class="text-xs text-muted mt-2">' + todayCalories + ' / ' + calTarget + '</div>' +
        '</div>' +

        '<div class="card" style="padding:var(--space-3);text-align:center">' +
          '<div class="text-xs text-muted">\uD83E\uDD69 Protein</div>' +
          '<div class="font-bold" style="font-size:var(--text-lg)">' + proteinPct + '%</div>' +
          '<div style="background:var(--color-surface-raised);height:4px;border-radius:4px;margin-top:var(--space-1)">' +
            '<div style="background:var(--color-success);width:' + proteinPct + '%;height:100%;border-radius:4px"></div>' +
          '</div>' +
          '<div class="text-xs text-muted mt-2">' + todayProtein + 'g / ' + proteinTarget + 'g</div>' +
        '</div>' +

      '</div>' +
      '</div>';
  }

  function renderQuickLogRow() {
    return '<div class="dashboard-section">' +
      '<div class="flex gap-2" style="flex-wrap:wrap">' +
        '<a href="#/log/vitals" class="btn btn-secondary btn-sm">\u2696\uFE0F Weight</a>' +
        '<a href="#/log/pain" class="btn btn-secondary btn-sm">\uD83E\uDE79 Pain</a>' +
        '<a href="#/log/hydration" class="btn btn-secondary btn-sm">\uD83D\uDCA7 Water</a>' +
        '<a href="#/log/checkin" class="btn btn-secondary btn-sm">\uD83D\uDCCB Check-in</a>' +
      '</div>' +
      '</div>';
  }

  async function renderStreak() {
    var streak = 0;
    try {
      var workouts = await Store.getAll('workouts');
      if (workouts && workouts.length > 0) {
        // Sort descending by date
        workouts.sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); });

        // Build set of workout dates
        var dateSet = {};
        for (var i = 0; i < workouts.length; i++) {
          if (workouts[i].date) dateSet[workouts[i].date] = true;
        }

        // Count consecutive weekdays with workouts, going backwards from today
        var d = new Date();
        d.setHours(0, 0, 0, 0);
        var checking = true;
        while (checking) {
          var dow = d.getDay(); // 0=Sun, 6=Sat
          if (dow === 0 || dow === 6) {
            // Weekend — skip, don't break streak
            d.setDate(d.getDate() - 1);
            continue;
          }
          var ds = d.toISOString().split('T')[0];
          if (dateSet[ds]) {
            streak++;
            d.setDate(d.getDate() - 1);
          } else {
            // Today might not have been logged yet — give grace for today
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            if (d.getTime() === today.getTime() && streak === 0) {
              d.setDate(d.getDate() - 1);
              continue;
            }
            checking = false;
          }
        }
      }
    } catch (e) {}

    if (streak === 0) return '';

    return '<div class="card mb-4" style="text-align:center;padding:var(--space-3)">' +
      '<span style="font-size:var(--text-2xl)">\uD83D\uDD25 ' + streak + ' day' + (streak !== 1 ? 's' : '') + '</span>' +
      '<div class="text-xs text-muted mt-2">Consecutive workout days completed</div>' +
      '</div>';
  }

  function afterRender() {
    // No special event bindings needed — links handle navigation
  }

  App.register('today', { render: render, afterRender: afterRender });

})();
