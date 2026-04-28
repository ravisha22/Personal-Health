// meals.js — Today's meal plan viewer with expandable recipe cards
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

  // ===== State =====
  var DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var MEAL_LABELS = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
  var MEAL_TIMES = ['7:30 AM', '12:30 PM', '3:30 PM', '7:00 PM'];
  var MEAL_EMOJIS = ['\uD83C\uDF73', '\uD83E\uDD57', '\uD83C\uDF4E', '\uD83C\uDF5D'];
  var viewOffset = 0; // offset from today's meal day, for day navigation

  // ===== Safe data access =====
  function safeGetMealDay(dayIndex) {
    if (typeof MealPlan === 'undefined' || !MealPlan) return null;
    var days = MealPlan.days;
    if (!days || days.length === 0) return null;
    var idx = ((dayIndex % days.length) + days.length) % days.length;
    return days[idx] || null;
  }

  function safeGetRecipe(recipeId) {
    if (typeof RecipeLibrary === 'undefined' || !RecipeLibrary) return null;
    return RecipeLibrary[recipeId] || null;
  }

  // ===== Render =====
  function render(sub) {
    var plan = getTodaysPlan(getStartDate());
    var mealDayIndex = (plan.mealDay + viewOffset + 700) % 7; // +700 to avoid negative modulo
    var dayData = safeGetMealDay(mealDayIndex);
    var dayName = DAY_NAMES[mealDayIndex] || ('Day ' + (mealDayIndex + 1));
    var isToday = viewOffset === 0;

    // Parse expand param from URL hash query
    var expandIndex = -1;
    if (typeof sub === 'string' && sub.indexOf('expand=') >= 0) {
      expandIndex = parseInt(sub.split('expand=')[1]) || 0;
    } else {
      try {
        var hash = window.location.hash || '';
        var qIdx = hash.indexOf('expand=');
        if (qIdx >= 0) {
          expandIndex = parseInt(hash.substring(qIdx + 7)) || 0;
        }
      } catch (e) {}
    }

    var html = '<div class="page">';

    // Day header with navigation
    html += '<div class="page-header">' +
      '<div class="flex items-center justify-between">' +
        '<button class="btn btn-ghost btn-sm" id="meals-prev" style="min-width:44px">\u2190</button>' +
        '<div class="text-center">' +
          '<h1 class="page-title">\uD83C\uDF7D Day ' + (mealDayIndex + 1) + ' Meals</h1>' +
          '<p class="page-subtitle">' + Utils.escapeHtml(dayName) +
            (isToday ? ' \u2022 Today' : '') +
          '</p>' +
        '</div>' +
        '<button class="btn btn-ghost btn-sm" id="meals-next" style="min-width:44px">\u2192</button>' +
      '</div>' +
      '</div>';

    if (!dayData || !dayData.meals) {
      html += '<div class="card">' +
        '<div class="alert alert-info">Loading meal plan data\u2026 The meal plan hasn\'t been loaded yet.</div>' +
        '<a href="#/today" class="btn btn-secondary btn-block mt-4">\u2190 Back to Today</a>' +
        '</div></div>';
      return html;
    }

    // Pre-workout fuel (on gym days)
    if (!plan.isRestDay && isToday) {
      html += renderPreWorkoutFuel();
    }

    // Meal cards
    var meals = dayData.meals;
    for (var i = 0; i < meals.length; i++) {
      var shouldExpand = (i === expandIndex);
      html += renderMealCard(meals[i], i, shouldExpand);
    }

    // Post-workout recovery (on gym days)
    if (!plan.isRestDay && isToday) {
      html += renderPostWorkoutRecovery();
    }

    // Day totals
    html += '<div id="meals-day-totals"></div>';

    // Back button
    if (!isToday) {
      html += '<div class="mt-4 text-center">' +
        '<button class="btn btn-ghost btn-sm" id="meals-go-today">Go to Today</button>' +
        '</div>';
    }

    html += Safety.renderDisclaimer();
    html += '</div>';
    return html;
  }

  // ===== Pre-workout Fuel =====
  function renderPreWorkoutFuel() {
    return '<div class="card mb-4" style="border-left:3px solid var(--color-warning)">' +
      '<div class="flex items-center gap-2 mb-2">' +
        '<span style="font-size:var(--text-lg)">\uD83C\uDF4C</span>' +
        '<span class="font-semibold">Pre-Workout Fuel</span>' +
      '</div>' +
      '<p class="text-sm text-secondary">30\u201360 min before gym: banana + handful of almonds, or a small oatmeal bowl. Keep it light and carb-focused.</p>' +
      '</div>';
  }

  // ===== Post-workout Recovery =====
  function renderPostWorkoutRecovery() {
    return '<div class="card mb-4" style="border-left:3px solid var(--color-success)">' +
      '<div class="flex items-center gap-2 mb-2">' +
        '<span style="font-size:var(--text-lg)">\uD83E\uDD64</span>' +
        '<span class="font-semibold">Post-Workout Recovery</span>' +
      '</div>' +
      '<p class="text-sm text-secondary">Within 30 min of finishing: protein shake or Greek yogurt with fruit. Aim for 30\u201340g protein + fast carbs.</p>' +
      '</div>';
  }

  // ===== Meal Card =====
  function renderMealCard(meal, index, expanded) {
    var recipe = safeGetRecipe(meal.recipeId);
    var mealLabel = MEAL_LABELS[index] || meal.type || ('Meal ' + (index + 1));
    var mealEmoji = MEAL_EMOJIS[index] || '\uD83C\uDF7D';
    var mealTime = meal.time || MEAL_TIMES[index] || '';
    var mealName = (recipe && recipe.name) || meal.name || mealLabel;
    var cal = meal.calories || (recipe && recipe.nutrition ? recipe.nutrition.calories : 0) || 0;
    var protein = meal.protein || (recipe && recipe.nutrition ? recipe.nutrition.protein : 0) || 0;

    var detailsOpen = expanded ? ' open' : '';
    var cardId = 'meal-card-' + index;

    var html = '<details class="card mb-4 meal-details" id="' + cardId + '"' + detailsOpen + '>';

    // Summary (collapsed state — single line)
    html += '<summary class="flex items-center justify-between" ' +
      'style="cursor:pointer;min-height:52px;list-style:none;-webkit-appearance:none">' +
      '<div class="flex items-center gap-2">' +
        '<span style="font-size:var(--text-lg)">' + mealEmoji + '</span>' +
        '<div>' +
          '<span class="font-semibold">' + Utils.escapeHtml(mealName) + '</span>' +
          '<div class="text-xs text-muted">' + Utils.escapeHtml(mealLabel + ' \u2022 ' + mealTime) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="text-right">' +
        '<div class="text-sm font-medium">' + cal + ' cal</div>' +
        '<div class="text-xs text-muted">' + protein + 'g protein</div>' +
      '</div>' +
      '</summary>';

    // Expanded state: full recipe
    html += '<div class="divider"></div>';

    if (!recipe) {
      html += '<p class="text-sm text-muted" style="padding:var(--space-2) 0">' +
        'Recipe details not available. ' +
        (meal.recipeId ? 'Recipe ID: ' + Utils.escapeHtml(meal.recipeId) : 'No recipe linked.') +
        '</p>';
    } else {
      // Tags row
      html += '<div class="flex gap-2 mb-4" style="flex-wrap:wrap">';
      if (recipe.cuisine) {
        html += '<span class="tag tag-blue">' + Utils.escapeHtml(recipe.cuisine) + '</span>';
      }
      if (recipe.prepTime) {
        html += '<span class="tag">\uD83D\uDD2A Prep: ' + Utils.escapeHtml(String(recipe.prepTime)) + '</span>';
      }
      if (recipe.cookTime) {
        html += '<span class="tag">\uD83D\uDD25 Cook: ' + Utils.escapeHtml(String(recipe.cookTime)) + '</span>';
      }
      if (recipe.difficulty) {
        var diffColor = recipe.difficulty === 'Easy' ? 'tag-green' :
                        (recipe.difficulty === 'Hard' ? 'tag-red' : 'tag-yellow');
        html += '<span class="tag ' + diffColor + '">' + Utils.escapeHtml(recipe.difficulty) + '</span>';
      }
      html += '</div>';

      // Ingredients
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        html += '<h4 class="font-semibold text-sm mb-2">\uD83E\uDDC2 Ingredients</h4>' +
          '<ul style="padding-left:1.25rem;margin:0 0 var(--space-4) 0;font-size:var(--text-sm);color:var(--color-text-secondary)">';
        for (var ing = 0; ing < recipe.ingredients.length; ing++) {
          var item = recipe.ingredients[ing];
          if (typeof item === 'string') {
            html += '<li>' + Utils.escapeHtml(item) + '</li>';
          } else if (item && item.name) {
            var qty = item.quantity ? item.quantity + ' ' : '';
            var unit = item.unit ? item.unit + ' ' : '';
            html += '<li>' + Utils.escapeHtml(qty + unit + item.name) + '</li>';
          }
        }
        html += '</ul>';
      }

      // Method
      if (recipe.method && recipe.method.length > 0) {
        html += '<h4 class="font-semibold text-sm mb-2">\uD83D\uDC68\u200D\uD83C\uDF73 Method</h4>' +
          '<ol style="padding-left:1.25rem;margin:0 0 var(--space-4) 0;font-size:var(--text-sm);color:var(--color-text-secondary)">';
        for (var step = 0; step < recipe.method.length; step++) {
          html += '<li style="margin-bottom:var(--space-2)">' + Utils.escapeHtml(recipe.method[step]) + '</li>';
        }
        html += '</ol>';
      }

      // Nutrition breakdown
      if (recipe.nutrition) {
        var n = recipe.nutrition;
        html += '<h4 class="font-semibold text-sm mb-2">\uD83D\uDCCA Nutrition</h4>' +
          '<div class="grid grid-' + (n.fat ? '4' : '3') + '" style="gap:var(--space-2);margin-bottom:var(--space-4);text-align:center">';

        html += '<div class="card" style="padding:var(--space-2)">' +
          '<div class="text-xs text-muted">Calories</div>' +
          '<div class="font-bold">' + (n.calories || 0) + '</div>' +
          '</div>';
        html += '<div class="card" style="padding:var(--space-2)">' +
          '<div class="text-xs text-muted">Protein</div>' +
          '<div class="font-bold">' + (n.protein || 0) + 'g</div>' +
          '</div>';
        html += '<div class="card" style="padding:var(--space-2)">' +
          '<div class="text-xs text-muted">Carbs</div>' +
          '<div class="font-bold">' + (n.carbs || 0) + 'g</div>' +
          '</div>';
        if (n.fat !== undefined) {
          html += '<div class="card" style="padding:var(--space-2)">' +
            '<div class="text-xs text-muted">Fat</div>' +
            '<div class="font-bold">' + (n.fat || 0) + 'g</div>' +
            '</div>';
        }
        html += '</div>';
      }

      // "Why this meal" explanation
      if (recipe.whyThisMeal) {
        html += '<div class="alert alert-info" style="margin-bottom:var(--space-3)">' +
          '<strong>\uD83D\uDCA1 Why this meal:</strong> ' + Utils.escapeHtml(recipe.whyThisMeal) +
          '</div>';
      }

      // Source link
      if (recipe.sourceUrl) {
        var sourceName = recipe.sourceName || recipe.source || 'Original Recipe';
        html += '<a href="' + Utils.escapeHtml(recipe.sourceUrl) + '" target="_blank" rel="noopener" ' +
          'class="text-sm" style="display:block;margin-bottom:var(--space-3);color:var(--color-accent)">' +
          '\uD83D\uDCD6 Recipe from ' + Utils.escapeHtml(sourceName) + ' \u2197' +
          '</a>';
      }
    }

    // Meal logging buttons
    html += '<div class="divider"></div>' +
      '<div class="flex gap-2" style="flex-wrap:wrap">' +
        '<button class="btn btn-primary btn-sm meal-log-btn" data-meal-index="' + index + '" data-action="ate">' +
          '\u2705 I ate this' +
        '</button>' +
        '<button class="btn btn-secondary btn-sm meal-log-btn" data-meal-index="' + index + '" data-action="alt">' +
          '\uD83D\uDD04 Ate something else' +
        '</button>' +
        '<button class="btn btn-ghost btn-sm meal-log-btn" data-meal-index="' + index + '" data-action="skip">' +
          '\u274C Skipped' +
        '</button>' +
      '</div>';

    html += '</details>';
    return html;
  }

  // ===== Day Totals =====
  async function renderDayTotals() {
    var plan = getTodaysPlan(getStartDate());
    var mealDayIndex = (plan.mealDay + viewOffset + 700) % 7;
    var dayData = safeGetMealDay(mealDayIndex);

    // Target totals from the plan
    var planCal = 0;
    var planProtein = 0;
    var planCarbs = 0;
    var planFat = 0;

    if (dayData && dayData.meals) {
      for (var i = 0; i < dayData.meals.length; i++) {
        var m = dayData.meals[i];
        var r = safeGetRecipe(m.recipeId);
        planCal += m.calories || (r && r.nutrition ? r.nutrition.calories : 0) || 0;
        planProtein += m.protein || (r && r.nutrition ? r.nutrition.protein : 0) || 0;
        planCarbs += (r && r.nutrition ? r.nutrition.carbs : 0) || 0;
        planFat += (r && r.nutrition ? r.nutrition.fat : 0) || 0;
      }
    }

    // Logged totals from Store (only for today)
    var loggedCal = 0;
    var loggedProtein = 0;
    if (viewOffset === 0) {
      try {
        var todayMeals = await Store.getByDate('meals', Utils.dateStr());
        for (var j = 0; j < todayMeals.length; j++) {
          loggedCal += todayMeals[j].calories || 0;
          loggedProtein += todayMeals[j].protein || 0;
        }
      } catch (e) {}
    }

    var html = '<div class="card mt-4">' +
      '<div class="card-header">' +
        '<h2 class="card-title">\uD83D\uDCCA Day Totals</h2>' +
      '</div>' +
      '<div class="grid grid-' + (planFat ? '4' : '3') + '" style="gap:var(--space-2);text-align:center">';

    html += '<div>' +
      '<div class="text-xs text-muted">Calories</div>' +
      '<div class="font-bold">' + planCal + '</div>' +
      (viewOffset === 0 ? '<div class="text-xs text-muted">' + loggedCal + ' logged</div>' : '') +
      '</div>';

    html += '<div>' +
      '<div class="text-xs text-muted">Protein</div>' +
      '<div class="font-bold">' + planProtein + 'g</div>' +
      (viewOffset === 0 ? '<div class="text-xs text-muted">' + loggedProtein + 'g logged</div>' : '') +
      '</div>';

    html += '<div>' +
      '<div class="text-xs text-muted">Carbs</div>' +
      '<div class="font-bold">' + planCarbs + 'g</div>' +
      '</div>';

    if (planFat) {
      html += '<div>' +
        '<div class="text-xs text-muted">Fat</div>' +
        '<div class="font-bold">' + planFat + 'g</div>' +
        '</div>';
    }

    html += '</div></div>';
    return html;
  }

  // ===== After Render: Event Bindings =====
  function afterRender() {
    // Day navigation
    var prevBtn = document.getElementById('meals-prev');
    var nextBtn = document.getElementById('meals-next');
    var goTodayBtn = document.getElementById('meals-go-today');

    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        viewOffset--;
        rerender();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        viewOffset++;
        rerender();
      });
    }

    if (goTodayBtn) {
      goTodayBtn.addEventListener('click', function() {
        viewOffset = 0;
        rerender();
      });
    }

    // Meal logging buttons
    var logBtns = document.querySelectorAll('.meal-log-btn');
    for (var i = 0; i < logBtns.length; i++) {
      (function(btn) {
        btn.addEventListener('click', function() {
          var mealIndex = parseInt(btn.getAttribute('data-meal-index'));
          var action = btn.getAttribute('data-action');
          logMeal(mealIndex, action, btn);
        });
      })(logBtns[i]);
    }

    // Render day totals asynchronously
    renderDayTotals().then(function(html) {
      var totalsContainer = document.getElementById('meals-day-totals');
      if (totalsContainer) totalsContainer.innerHTML = html;
    });
  }

  // ===== Re-render the page (for day navigation) =====
  function rerender() {
    var app = document.getElementById('app');
    if (!app) return;
    var html = render();
    if (typeof html === 'string') {
      app.innerHTML = html;
      requestAnimationFrame(function() {
        afterRender();
      });
    }
  }

  // ===== Log Meal =====
  async function logMeal(mealIndex, action, btn) {
    var plan = getTodaysPlan(getStartDate());
    var mealDayIndex = (plan.mealDay + viewOffset + 700) % 7;
    var dayData = safeGetMealDay(mealDayIndex);
    var meal = (dayData && dayData.meals) ? dayData.meals[mealIndex] : null;
    var recipe = meal ? safeGetRecipe(meal.recipeId) : null;

    var mealName = (recipe && recipe.name) || (meal && meal.name) || MEAL_LABELS[mealIndex] || 'Meal';
    var cal = (meal && meal.calories) || (recipe && recipe.nutrition ? recipe.nutrition.calories : 0) || 0;
    var protein = (meal && meal.protein) || (recipe && recipe.nutrition ? recipe.nutrition.protein : 0) || 0;

    if (action === 'skip') {
      cal = 0;
      protein = 0;
    }

    var entry = {
      date: Utils.dateStr(),
      meal: MEAL_LABELS[mealIndex] || 'meal',
      type: (MEAL_LABELS[mealIndex] || 'meal').toLowerCase(),
      foodItems: action === 'ate' ? mealName : (action === 'alt' ? 'Alternative meal' : 'Skipped'),
      calories: action === 'alt' ? 0 : cal,
      protein: action === 'alt' ? 0 : protein,
      adherence: action === 'ate' ? 'on-plan' : (action === 'alt' ? 'off-plan' : 'skipped'),
      planMealIndex: mealIndex,
      planMealName: mealName,
      source: 'meals-page'
    };

    try {
      await Store.add('meals', entry);

      // Visual feedback on the button
      var originalText = btn.textContent;
      btn.textContent = '\u2705 Logged!';
      btn.disabled = true;
      btn.style.opacity = '0.6';

      // Disable sibling buttons
      var card = btn.closest('.meal-details');
      if (card) {
        var siblings = card.querySelectorAll('.meal-log-btn');
        for (var s = 0; s < siblings.length; s++) {
          siblings[s].disabled = true;
          siblings[s].style.opacity = '0.6';
        }
      }

      Utils.toast(mealName + ' logged!', 'success');

      // Refresh day totals
      renderDayTotals().then(function(html) {
        var totalsContainer = document.getElementById('meals-day-totals');
        if (totalsContainer) totalsContainer.innerHTML = html;
      });

    } catch (err) {
      Utils.toast('Error logging meal', 'danger');
      console.error('Meal log error:', err);
    }
  }

  App.register('meals', { render: render, afterRender: afterRender });

})();
