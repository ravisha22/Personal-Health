// meals.js — Meal plan viewer with collapsible recipe cards. Maps to RecipeLibrary/MealPlan data.
(function() {
  'use strict';

  var currentDay = -1; // -1 means auto-detect

  function cycle() {
    var sd = Utils.getSetting('program_start_date', Utils.dateStr());
    var start = new Date(sd + 'T00:00:00');
    var now = new Date(); now.setHours(0,0,0,0);
    var d = Math.max(0, Math.floor((now - start) / 86400000));
    return d % 7;
  }

  function getDay() {
    if (currentDay >= 0) return currentDay;
    return cycle();
  }

  function recipe(id) {
    if (typeof RecipeLibrary === 'undefined' || !id) return null;
    return RecipeLibrary[id] || null;
  }

  function esc(s) { return Utils.escapeHtml(s || ''); }

  function renderMealCard(meal) {
    var r = recipe(meal.recipeId);
    if (!r) return '<div class="card mb-4"><p class="text-sm text-muted">Recipe not found: ' + esc(meal.recipeId) + '</p></div>';

    var typeIcons = { breakfast: '🌅', lunch: '☀️', snack: '🍎', dinner: '🌙' };
    var icon = typeIcons[meal.type] || '🍽️';
    var typeName = meal.type.charAt(0).toUpperCase() + meal.type.slice(1);

    var h = '<div class="card mb-4">';

    // Summary header (always visible)
    h += '<details class="meal-detail">';
    h += '<summary style="cursor:pointer;list-style:none">';
    h += '<div class="flex items-center justify-between">';
    h += '<div>';
    h += '<span class="text-xs text-muted">' + icon + ' ' + typeName + ' · ' + esc(meal.time || '') + '</span>';
    h += '<h4 class="font-semibold" style="font-size:var(--text-lg)">' + esc(r.name) + '</h4>';
    h += '</div>';
    h += '<div class="text-right">';
    h += '<div class="font-bold" style="color:var(--color-primary)">' + r.nutrition.calories + ' kcal</div>';
    h += '<div class="text-xs text-muted">' + r.nutrition.protein + 'g protein</div>';
    h += '</div></div>';
    h += '<div class="flex gap-2 mt-2">';
    h += '<span class="tag">' + esc(r.cuisine) + '</span>';
    h += '<span class="tag">⏱️ ' + esc(r.prepTime) + ' prep</span>';
    if (r.difficulty) h += '<span class="tag">' + esc(r.difficulty) + '</span>';
    h += '</div>';
    h += '<p class="text-xs text-muted mt-2">Tap to see recipe ▼</p>';
    h += '</summary>';

    // Expanded recipe details
    h += '<div class="divider"></div>';

    // Why this meal
    if (r.why) {
      h += '<p class="text-sm mb-4" style="color:var(--color-primary)">💡 ' + esc(r.why) + '</p>';
    }

    // Ingredients
    h += '<h5 class="font-semibold mb-2">🧾 Ingredients</h5>';
    h += '<ul style="padding-left:var(--space-4);margin-bottom:var(--space-4)">';
    if (r.ingredients) {
      for (var i = 0; i < r.ingredients.length; i++) {
        var ing = r.ingredients[i];
        h += '<li class="text-sm mb-1"><strong>' + esc(ing.item) + '</strong> — ' + esc(ing.qty) + '</li>';
      }
    }
    h += '</ul>';

    // Method
    if (r.method && r.method.length > 0) {
      h += '<h5 class="font-semibold mb-2">👩‍🍳 Method</h5>';
      h += '<ol style="padding-left:var(--space-4);margin-bottom:var(--space-4)">';
      for (var i = 0; i < r.method.length; i++) {
        h += '<li class="text-sm mb-2">' + esc(r.method[i]) + '</li>';
      }
      h += '</ol>';
    }

    // Nutrition breakdown
    h += '<h5 class="font-semibold mb-2">📊 Nutrition</h5>';
    h += '<div class="grid" style="grid-template-columns:repeat(4,1fr);gap:var(--space-2);margin-bottom:var(--space-4)">';
    h += '<div class="text-center"><div class="text-xs text-muted">Calories</div><div class="font-bold">' + r.nutrition.calories + '</div></div>';
    h += '<div class="text-center"><div class="text-xs text-muted">Protein</div><div class="font-bold">' + r.nutrition.protein + 'g</div></div>';
    h += '<div class="text-center"><div class="text-xs text-muted">Carbs</div><div class="font-bold">' + r.nutrition.carbs + 'g</div></div>';
    h += '<div class="text-center"><div class="text-xs text-muted">Fat</div><div class="font-bold">' + r.nutrition.fat + 'g</div></div>';
    h += '</div>';

    // Source link
    if (r.sourceUrl) {
      h += '<a href="' + esc(r.sourceUrl) + '" target="_blank" rel="noopener" class="btn btn-secondary btn-sm mb-4" style="display:inline-flex">';
      h += '📖 Recipe from ' + esc(r.sourceLabel || 'Source') + ' ↗</a>';
    } else if (r.sourceLabel) {
      h += '<p class="text-xs text-muted mb-4">📖 Search: ' + esc(r.sourceLabel) + '</p>';
    }

    // South Indian alternative
    if (r.southIndianAlt) {
      var alt = recipe(r.southIndianAlt.recipeId);
      h += '<div class="alert alert-info mb-4">';
      h += '<strong>🍛 South Indian alternative:</strong> ' + esc(r.southIndianAlt.name || (alt && alt.name) || '');
      if (alt && alt.nutrition) h += ' (' + alt.nutrition.calories + ' kcal, ' + alt.nutrition.protein + 'g protein)';
      h += '</div>';
    }

    // Notes
    if (meal.notes) h += '<p class="text-sm text-muted mb-2">📝 ' + esc(meal.notes) + '</p>';

    h += '</details></div>';
    return h;
  }

  App.register('meals', {
    render: function() {
      if (typeof MealPlan === 'undefined') {
        return '<div class="page"><div class="page-header"><h1 class="page-title">🍽️ Meals</h1></div><div class="alert alert-warning">Loading meal plan data...</div></div>';
      }

      var dayIdx = getDay();
      var day = MealPlan.days[dayIdx];
      if (!day) {
        return '<div class="page"><div class="page-header"><h1 class="page-title">🍽️ Meals</h1></div><div class="alert alert-warning">No meal plan for this day.</div></div>';
      }

      var h = '<div class="page">';

      // Day navigation
      h += '<div class="flex items-center justify-between mb-4">';
      h += '<button class="btn btn-ghost btn-sm" id="meal-prev">← Prev</button>';
      h += '<h1 class="page-title">🍽️ ' + esc(day.label || 'Day ' + (dayIdx + 1)) + '</h1>';
      h += '<button class="btn btn-ghost btn-sm" id="meal-next">Next →</button>';
      h += '</div>';

      // Day totals
      if (day.dailyTotals) {
        var t = day.dailyTotals;
        h += '<div class="card mb-4" style="background:var(--color-surface-raised)">';
        h += '<div class="grid" style="grid-template-columns:repeat(4,1fr);gap:var(--space-2);text-align:center">';
        h += '<div><div class="text-xs text-muted">Calories</div><div class="font-bold">' + t.calories + '</div></div>';
        h += '<div><div class="text-xs text-muted">Protein</div><div class="font-bold">' + t.protein + 'g</div></div>';
        h += '<div><div class="text-xs text-muted">Carbs</div><div class="font-bold">' + t.carbs + 'g</div></div>';
        h += '<div><div class="text-xs text-muted">Fat</div><div class="font-bold">' + t.fat + 'g</div></div>';
        h += '</div></div>';
      }

      // Pre-workout (if gym day)
      if (day.preWorkout && day.preWorkout.recipeId) {
        var pwr = recipe(day.preWorkout.recipeId);
        if (pwr) {
          h += '<div class="alert alert-info mb-4">🏋️ <strong>Pre-Workout:</strong> ' + esc(pwr.name);
          if (day.preWorkout.notes) h += ' — ' + esc(day.preWorkout.notes);
          h += '</div>';
        }
      }

      // Meal cards
      if (day.meals) {
        for (var i = 0; i < day.meals.length; i++) {
          h += renderMealCard(day.meals[i]);
        }
      }

      // Post-workout
      if (day.postWorkout && day.postWorkout.recipeId) {
        var powr = recipe(day.postWorkout.recipeId);
        if (powr) {
          h += '<div class="alert alert-success mb-4">💪 <strong>Post-Workout:</strong> ' + esc(powr.name);
          if (powr.nutrition) h += ' (' + powr.nutrition.protein + 'g protein)';
          if (day.postWorkout.notes) h += ' — ' + esc(day.postWorkout.notes);
          h += '</div>';
        }
      }

      // Meal planner link
      h += '<div class="card mb-4">';
      h += '<a href="#/meal-planner" class="btn btn-primary btn-block">📋 Monthly Meal Planner — Pick & Export Recipes</a>';
      h += '</div>';

      // Shopping list export button
      h += '<div class="card mb-4">';
      h += '<div class="card-header"><h3 class="card-title">🛒 Quick Export</h3></div>';
      h += '<button class="btn btn-secondary btn-block btn-sm" id="export-grocery">Export Weekly Grocery List</button>';
      h += '</div>';

      h += '<div class="disclaimer"><strong>⚕️</strong> Finish dinner 3hrs before bed to prevent acid reflux.</div>';
      h += '</div>';
      return h;
    },

    afterRender: function() {
      var prev = document.getElementById('meal-prev');
      var next = document.getElementById('meal-next');
      if (prev) prev.onclick = function() {
        currentDay = getDay() - 1;
        if (currentDay < 0) currentDay = (MealPlan.days.length - 1);
        App.navigate();
      };
      if (next) next.onclick = function() {
        currentDay = getDay() + 1;
        if (currentDay >= MealPlan.days.length) currentDay = 0;
        App.navigate();
      };

      // Grocery export
      var exportBtn = document.getElementById('export-grocery');
      if (exportBtn) exportBtn.onclick = function() {
        var items = {};
        // Consolidate all ingredients from all 7 days
        for (var d = 0; d < MealPlan.days.length; d++) {
          var day = MealPlan.days[d];
          if (!day.meals) continue;
          for (var m = 0; m < day.meals.length; m++) {
            var r = recipe(day.meals[m].recipeId);
            if (!r || !r.ingredients) continue;
            for (var i = 0; i < r.ingredients.length; i++) {
              var ing = r.ingredients[i];
              var key = ing.item.toLowerCase();
              if (!items[key]) items[key] = { name: ing.item, qty: ing.qty, count: 1 };
              else items[key].count++;
            }
          }
        }
        // Also add grocery list if available
        var text = '🛒 WEEKLY GROCERY LIST (Family of 4)\n';
        text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

        if (MealPlan.groceryList) {
          var gl = MealPlan.groceryList;
          var cats = Object.keys(gl);
          for (var c = 0; c < cats.length; c++) {
            text += cats[c].toUpperCase() + ':\n';
            var catItems = gl[cats[c]];
            for (var i = 0; i < catItems.length; i++) {
              text += '  ☐ ' + catItems[i] + '\n';
            }
            text += '\n';
          }
        } else {
          // Fallback: list consolidated ingredients
          var sorted = Object.values(items).sort(function(a,b) { return a.name.localeCompare(b.name); });
          for (var i = 0; i < sorted.length; i++) {
            text += '☐ ' + sorted[i].name + ' — ' + sorted[i].qty + (sorted[i].count > 1 ? ' (used ' + sorted[i].count + 'x)' : '') + '\n';
          }
        }

        // Download as text file
        var blob = new Blob([text], { type: 'text/plain' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'grocery-list-week-' + new Date().toISOString().split('T')[0] + '.txt';
        a.click();
        URL.revokeObjectURL(url);
        Utils.toast('Grocery list downloaded!', 'success');
      };
    }
  });
})();
