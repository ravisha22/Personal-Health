// meal-planner.js — Pick recipes for the month, export recipes + consolidated grocery list
(function() {
  'use strict';

  var selected = {}; // recipeId → count (how many times this month)
  var filterCuisine = 'all';
  var filterType = 'all';

  function esc(s) { return Utils.escapeHtml(s || ''); }

  function allRecipes() {
    if (typeof RecipeLibrary === 'undefined') return [];
    var list = [];
    var ids = Object.keys(RecipeLibrary);
    for (var i = 0; i < ids.length; i++) {
      var r = RecipeLibrary[ids[i]];
      if (r.cuisine === 'Workout Snack') continue; // skip pre/post workout
      list.push({ id: ids[i], recipe: r });
    }
    return list;
  }

  function getCuisines() {
    var set = {};
    var all = allRecipes();
    for (var i = 0; i < all.length; i++) set[all[i].recipe.cuisine] = true;
    return Object.keys(set).sort();
  }

  // Guess meal type from recipe tags or name
  function guessType(r) {
    var tags = (r.tags || []).join(' ').toLowerCase();
    var name = (r.name || '').toLowerCase();
    if (tags.includes('breakfast') || name.includes('dosa') || name.includes('idli') || name.includes('chilla') || name.includes('adai') || name.includes('porridge') || name.includes('pesarattu') || name.includes('pongal') || name.includes('upma') || name.includes('bhurji')) return 'breakfast';
    if (tags.includes('snack') || name.includes('sundal') || name.includes('chaat') || name.includes('makhana') || name.includes('tikka') || name.includes('curd') || name.includes('mix') || name.includes('aval')) return 'snack';
    if (tags.includes('dinner') || name.includes('soup') || name.includes('rasam') || name.includes('khichdi') || name.includes('light')) return 'dinner';
    return 'lunch';
  }

  function filtered() {
    var all = allRecipes();
    var result = [];
    for (var i = 0; i < all.length; i++) {
      var r = all[i].recipe;
      if (filterCuisine !== 'all' && r.cuisine !== filterCuisine) continue;
      if (filterType !== 'all' && guessType(r) !== filterType) continue;
      result.push(all[i]);
    }
    return result;
  }

  function selectedCount() {
    var total = 0;
    var ids = Object.keys(selected);
    for (var i = 0; i < ids.length; i++) total += selected[ids[i]];
    return total;
  }

  function paint() {
    var app = document.getElementById('app');
    var recipes = filtered();
    var cuisines = getCuisines();
    var count = selectedCount();

    var h = '<div class="page">';
    h += '<div class="page-header"><h1 class="page-title">📋 Meal Planner</h1>';
    h += '<p class="page-subtitle">Pick recipes for the month, then export recipes + grocery list</p></div>';

    // Selected count + export button
    h += '<div class="card mb-4" style="background:var(--color-surface-raised)">';
    h += '<div class="flex items-center justify-between">';
    h += '<div><strong>' + count + ' recipes</strong> selected</div>';
    h += '<button class="btn btn-primary btn-sm" id="mp-export"' + (count === 0 ? ' disabled style="opacity:0.5"' : '') + '>📥 Export</button>';
    h += '</div></div>';

    // Filters
    h += '<div class="flex gap-2 mb-4" style="flex-wrap:wrap">';
    // Cuisine filter
    h += '<select class="form-select" id="mp-cuisine" style="flex:1;min-width:120px">';
    h += '<option value="all"' + (filterCuisine === 'all' ? ' selected' : '') + '>All Cuisines</option>';
    for (var c = 0; c < cuisines.length; c++) {
      h += '<option value="' + esc(cuisines[c]) + '"' + (filterCuisine === cuisines[c] ? ' selected' : '') + '>' + esc(cuisines[c]) + '</option>';
    }
    h += '</select>';
    // Type filter
    h += '<select class="form-select" id="mp-type" style="flex:1;min-width:120px">';
    var types = [['all','All Types'],['breakfast','Breakfast'],['lunch','Lunch'],['snack','Snack'],['dinner','Dinner']];
    for (var t = 0; t < types.length; t++) {
      h += '<option value="' + types[t][0] + '"' + (filterType === types[t][0] ? ' selected' : '') + '>' + types[t][1] + '</option>';
    }
    h += '</select>';
    // Quick actions
    h += '<button class="btn btn-ghost btn-sm" id="mp-select-all">Select All</button>';
    h += '<button class="btn btn-ghost btn-sm" id="mp-clear">Clear</button>';
    h += '</div>';

    // Recipe grid
    h += '<div class="grid gap-3" style="grid-template-columns:1fr">';
    for (var i = 0; i < recipes.length; i++) {
      var r = recipes[i].recipe;
      var id = recipes[i].id;
      var isSelected = selected[id] && selected[id] > 0;
      var qty = selected[id] || 0;
      var type = guessType(r);
      var typeEmoji = type === 'breakfast' ? '🌅' : type === 'lunch' ? '☀️' : type === 'snack' ? '🍎' : '🌙';

      h += '<div class="card" style="border-left:4px solid ' + (isSelected ? 'var(--color-primary)' : 'transparent') + ';padding:var(--space-3)">';
      h += '<div class="flex items-center justify-between">';
      h += '<div style="flex:1">';
      h += '<div class="font-semibold">' + esc(r.name) + '</div>';
      h += '<div class="text-xs text-muted">' + typeEmoji + ' ' + esc(type) + ' · ' + esc(r.cuisine) + ' · ' + r.nutrition.calories + ' kcal · ' + r.nutrition.protein + 'g protein</div>';
      h += '</div>';
      h += '<div class="flex items-center gap-2">';
      h += '<button class="btn btn-ghost btn-sm mp-minus" data-id="' + esc(id) + '" style="' + (qty === 0 ? 'opacity:0.3' : '') + '">−</button>';
      h += '<span class="font-bold" style="min-width:24px;text-align:center">' + qty + '</span>';
      h += '<button class="btn btn-ghost btn-sm mp-plus" data-id="' + esc(id) + '">+</button>';
      h += '</div></div>';
      if (r.southIndianAlt) {
        h += '<div class="text-xs text-muted mt-1">🍛 SI alt: ' + esc(r.southIndianAlt.name) + '</div>';
      }
      h += '</div>';
    }
    h += '</div>';

    h += '</div>';
    app.innerHTML = h;
    bindEvents();
  }

  function bindEvents() {
    // Filters
    var cuisineEl = document.getElementById('mp-cuisine');
    if (cuisineEl) cuisineEl.onchange = function() { filterCuisine = this.value; paint(); };
    var typeEl = document.getElementById('mp-type');
    if (typeEl) typeEl.onchange = function() { filterType = this.value; paint(); };

    // Plus/minus buttons
    var plusBtns = document.querySelectorAll('.mp-plus');
    for (var i = 0; i < plusBtns.length; i++) {
      (function(btn) {
        btn.onclick = function() {
          var id = btn.getAttribute('data-id');
          selected[id] = (selected[id] || 0) + 1;
          paint();
        };
      })(plusBtns[i]);
    }
    var minusBtns = document.querySelectorAll('.mp-minus');
    for (var i = 0; i < minusBtns.length; i++) {
      (function(btn) {
        btn.onclick = function() {
          var id = btn.getAttribute('data-id');
          if (selected[id] && selected[id] > 0) selected[id]--;
          if (selected[id] === 0) delete selected[id];
          paint();
        };
      })(minusBtns[i]);
    }

    // Select all
    var selectAll = document.getElementById('mp-select-all');
    if (selectAll) selectAll.onclick = function() {
      var vis = filtered();
      for (var i = 0; i < vis.length; i++) {
        if (!selected[vis[i].id]) selected[vis[i].id] = 4; // 4 times a month default
      }
      paint();
    };

    // Clear
    var clearBtn = document.getElementById('mp-clear');
    if (clearBtn) clearBtn.onclick = function() { selected = {}; paint(); };

    // Export
    var exportBtn = document.getElementById('mp-export');
    if (exportBtn) exportBtn.onclick = doExport;
  }

  function doExport() {
    var ids = Object.keys(selected);
    if (ids.length === 0) { Utils.toast('Select recipes first', 'warning'); return; }

    var text = '';
    text += '═══════════════════════════════════════════\n';
    text += '  MONTHLY MEAL PLAN — RECIPES & GROCERIES\n';
    text += '  Generated: ' + new Date().toLocaleDateString() + '\n';
    text += '  Family of 4\n';
    text += '═══════════════════════════════════════════\n\n';

    // Part 1: Recipes
    text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    text += '  RECIPES (' + ids.length + ' selected)\n';
    text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    var allIngredients = {};

    for (var i = 0; i < ids.length; i++) {
      var r = RecipeLibrary[ids[i]];
      if (!r) continue;
      var times = selected[ids[i]];

      text += '┌─────────────────────────────────────────\n';
      text += '│ ' + r.name + '\n';
      text += '│ ' + r.cuisine + ' · ' + r.nutrition.calories + ' kcal · ' + r.nutrition.protein + 'g protein\n';
      text += '│ Prep: ' + (r.prepTime || '?') + ' · Cook: ' + (r.cookTime || '?') + ' · ' + times + 'x this month\n';
      text += '└─────────────────────────────────────────\n\n';

      // Ingredients
      text += '  Ingredients (family of 4):\n';
      if (r.ingredients) {
        for (var j = 0; j < r.ingredients.length; j++) {
          var ing = r.ingredients[j];
          text += '    • ' + ing.item + ' — ' + ing.qty + '\n';

          // Consolidate for grocery list
          var key = ing.item.toLowerCase().replace(/\s*\(.*\)\s*/g, '').trim();
          if (!allIngredients[key]) allIngredients[key] = { name: ing.item, uses: 0, qty: ing.qty };
          allIngredients[key].uses += times;
        }
      }
      text += '\n';

      // Method
      text += '  Method:\n';
      if (r.method) {
        for (var j = 0; j < r.method.length; j++) {
          text += '    ' + (j + 1) + '. ' + r.method[j] + '\n';
        }
      }

      if (r.sourceUrl) text += '\n  📖 Source: ' + r.sourceUrl + '\n';
      text += '\n\n';
    }

    // Part 2: Consolidated grocery list
    text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    text += '  CONSOLIDATED GROCERY LIST (Family of 4)\n';
    text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    var sorted = Object.values(allIngredients).sort(function(a, b) { return a.name.localeCompare(b.name); });
    for (var i = 0; i < sorted.length; i++) {
      var item = sorted[i];
      text += '  ☐ ' + item.name + ' — ' + item.qty + ' × ' + item.uses + ' times\n';
    }

    // Also append the static grocery list if available
    if (typeof MealPlan !== 'undefined' && MealPlan.groceryList) {
      text += '\n\n  REFERENCE WEEKLY GROCERY LIST:\n';
      var gl = MealPlan.groceryList;
      var cats = Object.keys(gl);
      for (var c = 0; c < cats.length; c++) {
        text += '\n  ' + cats[c].toUpperCase() + ':\n';
        var items = gl[cats[c]];
        for (var j = 0; j < items.length; j++) {
          text += '    ☐ ' + items[j] + '\n';
        }
      }
    }

    // Download
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'meal-plan-' + new Date().toISOString().split('T')[0] + '.txt';
    a.click();
    URL.revokeObjectURL(url);
    Utils.toast('Exported ' + ids.length + ' recipes + grocery list!', 'success');
  }

  App.register('meal-planner', {
    render: function() { paint(); return undefined; },
    afterRender: function() {}
  });
})();
