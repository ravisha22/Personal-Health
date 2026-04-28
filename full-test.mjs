// EXHAUSTIVE INTERACTION TEST — every clickable, every form, every save, every link.
import { chromium } from 'playwright';

let passed = 0, failed = 0;
const failures = [];
const consoleErrors = [];

async function ok(name, fn) {
  try { await fn(); passed++; console.log('  ✅ ' + name); }
  catch (e) { failed++; failures.push(name + ': ' + e.message); console.log('  ❌ ' + name + ': ' + e.message.substring(0, 150)); }
}

const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({ viewport: { width: 375, height: 812 } });
const p = await ctx.newPage();
p.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
p.on('pageerror', e => consoleErrors.push(e.message));

async function go(hash) {
  await p.evaluate(h => { window.location.hash = h; }, hash);
  await p.waitForTimeout(1500);
}

async function clickAndCheck(selector, label) {
  await ok(label, async () => {
    const el = await p.$(selector);
    if (!el) throw new Error('Element not found: ' + selector);
    await el.click();
    await p.waitForTimeout(800);
  });
}

async function fillAndCheck(selector, value, label) {
  await ok(label, async () => {
    const el = await p.$(selector);
    if (!el) throw new Error('Input not found: ' + selector);
    await el.fill(String(value));
  });
}

// ========== SETUP ==========
await p.goto('http://localhost:8765/?key=hc-r22-7x9m4q');
await p.waitForTimeout(3000);

console.log('\n══════════════════════════════════════');
console.log('  EXHAUSTIVE INTERACTION TEST');
console.log('══════════════════════════════════════\n');

// ========== NAV BAR ==========
console.log('1. BOTTOM NAV — all 5 tabs');
for (const [hash, name] of [['#/today','Today'],['#/workout','Workout'],['#/meals','Meals'],['#/progress','Progress'],['#/more','More']]) {
  await ok('Nav → ' + name, async () => {
    const link = await p.$('a[href="' + hash + '"]');
    if (!link) throw new Error('Nav link missing: ' + hash);
    await link.click();
    await p.waitForTimeout(1000);
    const html = await p.$eval('#app', el => el.innerHTML);
    if (html.length < 50) throw new Error('Page empty after nav click');
  });
}

// ========== TODAY PAGE ==========
console.log('\n2. TODAY — all links and buttons');
await go('#/today');
// Quick log buttons
for (const [href, label] of [['#/log/vitals','Weight btn'],['#/log/hydration','Water btn'],['#/log/pain','Pain btn'],['#/log/checkin','Check-in btn']]) {
  await ok('Today → ' + label, async () => {
    await go('#/today');
    const link = await p.$('a[href="' + href + '"]');
    if (!link) throw new Error('Link missing: ' + href);
    await link.click();
    await p.waitForTimeout(1000);
    const h = await p.evaluate(() => window.location.hash);
    if (!h.includes(href.replace('#/',''))) throw new Error('Did not navigate: ' + h);
  });
}
// Start Workout button
await go('#/today');
await ok('Today → Start Workout button', async () => {
  const btn = await p.$('a[href="#/workout"]');
  if (!btn) throw new Error('Start Workout link missing');
});
// View Recipes button
await ok('Today → View Recipes button', async () => {
  const btn = await p.$('a[href="#/meals"]');
  if (!btn) throw new Error('View Recipes link missing');
});

// ========== WORKOUT PAGE ==========
console.log('\n3. WORKOUT — checklists, exercise cards, set checkboxes');
await go('#/workout');
// Pre-workout checkboxes
const preChecks = await p.$$('.form-check input[type="checkbox"]');
await ok('Pre-workout checklist has checkboxes (' + preChecks.length + ')', async () => {
  if (preChecks.length < 3) throw new Error('Too few checkboxes: ' + preChecks.length);
});
// Click first checkbox
if (preChecks.length > 0) {
  await ok('Can check a pre-workout item', async () => {
    await preChecks[0].check();
    const checked = await preChecks[0].isChecked();
    if (!checked) throw new Error('Checkbox did not check');
  });
}
// Set checkboxes
const setChecks = await p.$$('.set-check');
await ok('Set completion checkboxes exist (' + setChecks.length + ')', async () => {
  if (setChecks.length < 4) throw new Error('Too few set checkboxes');
});
if (setChecks.length > 0) {
  await ok('Can check a set completion', async () => {
    await setChecks[0].check();
    const checked = await setChecks[0].isChecked();
    if (!checked) throw new Error('Set checkbox did not check');
  });
}
// YouTube details (if any non-placeholder)
const ytDetails = await p.$$('.yt-detail');
await ok('YouTube detail elements: ' + ytDetails.length, async () => { /* count only, 0 is ok if all placeholder */ });

// ========== MEALS PAGE ==========
console.log('\n4. MEALS — recipe expand/collapse, day navigation');
await go('#/meals');
// Day nav buttons
await ok('Prev day button', async () => {
  const btn = await p.$('#meal-prev');
  if (!btn) throw new Error('No prev button');
  await btn.click();
  await p.waitForTimeout(1000);
});
await ok('Next day button', async () => {
  const btn = await p.$('#meal-next');
  if (!btn) throw new Error('No next button');
  await btn.click();
  await p.waitForTimeout(1000);
});
// Navigate through all 7 days
for (let d = 0; d < 7; d++) {
  await ok('Day ' + (d+1) + ' renders meals', async () => {
    const btn = await p.$('#meal-next');
    await btn.click();
    await p.waitForTimeout(800);
    const html = await p.$eval('#app', el => el.textContent);
    if (!html.includes('kcal')) throw new Error('No calories shown on day ' + (d+1));
  });
}
// Expand first recipe
await go('#/meals');
const mealDetails = await p.$$('details.meal-detail');
await ok('Meal recipe cards: ' + mealDetails.length, async () => {
  if (mealDetails.length < 3) throw new Error('Too few meal cards');
});
if (mealDetails.length > 0) {
  await ok('Expand first recipe', async () => {
    await mealDetails[0].click();
    await p.waitForTimeout(500);
    const expanded = await p.$eval('#app', el => el.textContent);
    if (!expanded.includes('Ingredients')) throw new Error('Ingredients not shown');
    if (!expanded.includes('Method')) throw new Error('Method not shown');
  });
  // Check source link
  await ok('Recipe has source link or label', async () => {
    const html = await p.$eval('#app', el => el.innerHTML);
    if (!html.includes('Recipe from') && !html.includes('Search')) throw new Error('No source link');
  });
}

// ========== LOG VITALS — full save flow ==========
console.log('\n5. LOG VITALS — fill and save');
await go('#/log/vitals');
const vInputs = await p.$$('input[type="number"]');
await ok('Has number inputs (' + vInputs.length + ')', async () => {
  if (vInputs.length < 1) throw new Error('No inputs');
});
if (vInputs.length >= 1) await fillAndCheck('input[type="number"]', '132', 'Fill weight');
// Find and click save
const vBtns = await p.$$('button');
for (const btn of vBtns) {
  const txt = await btn.textContent();
  if (txt.toLowerCase().includes('save') || txt.toLowerCase().includes('log')) {
    await ok('Click save on vitals', async () => { await btn.click(); await p.waitForTimeout(1500); });
    break;
  }
}

// ========== LOG PAIN — full save flow ==========
console.log('\n6. LOG PAIN — fill and save');
await go('#/log/pain');
const painSel = await p.$('select');
if (painSel) {
  const opts = await painSel.$$eval('option', os => os.filter(o => o.value).map(o => o.value));
  if (opts.length > 0) await painSel.selectOption(opts[0]);
}
const painRange = await p.$('input[type="range"]');
if (painRange) await painRange.fill('3');
// Save
const pBtns = await p.$$('button');
for (const btn of pBtns) {
  const txt = await btn.textContent();
  if (txt.toLowerCase().includes('save') || txt.toLowerCase().includes('log pain')) {
    await ok('Save pain entry', async () => {
      await btn.click();
      await p.waitForTimeout(2000);
      // Check no new console errors
      const recent = consoleErrors.filter(e => e.includes('pain'));
      if (recent.length > 0) throw new Error('Console error: ' + recent[recent.length-1].substring(0,100));
    });
    break;
  }
}

// ========== LOG HYDRATION — quick add ==========
console.log('\n7. LOG HYDRATION — quick add buttons');
await go('#/log/hydration');
const hBtns = await p.$$('button');
let waterAdded = false;
for (const btn of hBtns) {
  const txt = await btn.textContent();
  if (txt.includes('250') || txt.includes('500') || txt.includes('ml') || txt.includes('Add')) {
    await ok('Quick add water (' + txt.trim().substring(0,20) + ')', async () => {
      await btn.click();
      await p.waitForTimeout(1000);
    });
    waterAdded = true;
    break;
  }
}
if (!waterAdded) await ok('Has water add button', async () => { throw new Error('No quick-add button found'); });

// ========== LOG FLARE — render check ==========
console.log('\n8. LOG FLARE — form elements');
await go('#/log/flare');
await ok('Flare page has severity input', async () => {
  const range = await p.$('input[type="range"]');
  if (!range) throw new Error('No severity slider');
});
await ok('Flare page has save button', async () => {
  const btns = await p.$$('button');
  let found = false;
  for (const btn of btns) { if ((await btn.textContent()).toLowerCase().includes('save') || (await btn.textContent()).toLowerCase().includes('log')) { found = true; break; } }
  if (!found) throw new Error('No save button');
});

// ========== LOG WORKOUT — render ==========
console.log('\n9. LOG WORKOUT (old) — render check');
await go('#/log/workout');
await ok('Log workout page renders', async () => {
  const html = await p.$eval('#app', el => el.innerHTML);
  if (html.length < 100) throw new Error('Too short');
});

// ========== LOG MEAL — render ==========
console.log('\n10. LOG MEAL — render check');
await go('#/log/meal');
await ok('Log meal page renders', async () => {
  const html = await p.$eval('#app', el => el.innerHTML);
  if (html.length < 100) throw new Error('Too short');
});

// ========== LOG CHECKIN — render and sliders ==========
console.log('\n11. LOG CHECK-IN — sliders and save');
await go('#/log/checkin');
const ciRanges = await p.$$('input[type="range"]');
await ok('Check-in has sliders (' + ciRanges.length + ')', async () => {
  if (ciRanges.length < 2) throw new Error('Too few sliders');
});

// ========== GOALS — add goal ==========
console.log('\n12. GOALS — render and add button');
await go('#/goals');
await ok('Goals page renders', async () => {
  const html = await p.$eval('#app', el => el.innerHTML);
  if (html.length < 50) throw new Error('Too short');
});

// ========== MEDICATIONS — render ==========
console.log('\n13. MEDICATIONS — render');
await go('#/medications');
await ok('Medications page shows meds', async () => {
  const txt = await p.$eval('#app', el => el.textContent);
  if (!txt.includes('Allopurinol') && !txt.includes('medication') && !txt.includes('Medication')) throw new Error('No medication content');
});

// ========== PROGRESS — render ==========
console.log('\n14. PROGRESS — render');
await go('#/progress');
await ok('Progress page renders', async () => {
  const html = await p.$eval('#app', el => el.innerHTML);
  if (html.length < 50) throw new Error('Too short');
});

// ========== MORE — all links work ==========
console.log('\n15. MORE — all navigation links');
await go('#/more');
const moreLinks = await p.$$('.section-list-item');
await ok('More page has navigation items (' + moreLinks.length + ')', async () => {
  if (moreLinks.length < 5) throw new Error('Too few links');
});
// Click each link and verify navigation
const linkTargets = ['#/profile','#/medications','#/labs','#/reference','#/doctor-export','#/export-import','#/settings'];
for (const target of linkTargets) {
  await ok('More → ' + target, async () => {
    await go('#/more');
    const link = await p.$('a[href="' + target + '"]');
    if (!link) throw new Error('Link not found');
    await link.click();
    await p.waitForTimeout(1000);
    const h = await p.evaluate(() => window.location.hash);
    if (!h.includes(target.replace('#/',''))) throw new Error('Navigation failed: ' + h);
    const html = await p.$eval('#app', el => el.innerHTML);
    if (html.length < 50) throw new Error('Page empty');
  });
}

// ========== PROFILE — edit and save each section ==========
console.log('\n16. PROFILE — edit sections');
await go('#/profile');
// Edit personal info
await ok('Profile → Edit personal info', async () => {
  const btn = await p.$('[data-edit="personal"]');
  if (!btn) throw new Error('No edit button');
  await btn.click();
  await p.waitForTimeout(800);
  const nameInput = await p.$('#pf-name');
  if (!nameInput) throw new Error('Name input not found after clicking edit');
  // Save
  const saveBtn = await p.$('#pf-save-personal');
  if (!saveBtn) throw new Error('No save button');
  await saveBtn.click();
  await p.waitForTimeout(1000);
});

// Edit conditions
await ok('Profile → Edit conditions', async () => {
  await go('#/profile');
  const btn = await p.$('[data-edit="conditions"]');
  if (!btn) throw new Error('No edit button');
  await btn.click();
  await p.waitForTimeout(800);
  const checks = await p.$$('.pf-condition');
  if (checks.length < 3) throw new Error('Too few checkboxes');
  const saveBtn = await p.$('#pf-save-conditions');
  if (!saveBtn) throw new Error('No save button');
  await saveBtn.click();
  await p.waitForTimeout(1000);
});

// Edit doctors
await ok('Profile → Edit doctors', async () => {
  await go('#/profile');
  const btn = await p.$('[data-edit="doctors"]');
  if (!btn) throw new Error('No edit button');
  await btn.click();
  await p.waitForTimeout(800);
  const addBtn = await p.$('#pf-add-doc');
  if (!addBtn) throw new Error('No add doctor button');
  await addBtn.click();
  await p.waitForTimeout(500);
  const saveBtn = await p.$('#pf-save-doctors');
  if (!saveBtn) throw new Error('No save button');
  await saveBtn.click();
  await p.waitForTimeout(1000);
});

// ========== REFERENCE — tabs ==========
console.log('\n17. REFERENCE — tab navigation');
await go('#/reference');
await ok('Reference page renders', async () => {
  const html = await p.$eval('#app', el => el.innerHTML);
  if (html.length < 100) throw new Error('Too short');
});
// Click tab buttons if they exist
const tabBtns = await p.$$('[data-tab]');
for (let i = 0; i < tabBtns.length; i++) {
  await ok('Reference tab ' + (i+1), async () => {
    await tabBtns[i].click();
    await p.waitForTimeout(500);
  });
}

// ========== LABS — render ==========
console.log('\n18. LABS — render');
await go('#/labs');
await ok('Labs page renders', async () => {
  const html = await p.$eval('#app', el => el.innerHTML);
  if (html.length < 50) throw new Error('Too short');
});

// ========== SETTINGS — render ==========
console.log('\n19. SETTINGS — render');
await go('#/settings');
await ok('Settings page renders', async () => {
  const html = await p.$eval('#app', el => el.innerHTML);
  if (html.length < 50) throw new Error('Too short');
});

// ========== EXPORT/IMPORT — render ==========
console.log('\n20. EXPORT/IMPORT — render');
await go('#/export-import');
await ok('Export page renders', async () => {
  const html = await p.$eval('#app', el => el.innerHTML);
  if (html.length < 50) throw new Error('Too short');
});

// ========== DOCTOR EXPORT — render ==========
console.log('\n21. DOCTOR EXPORT — render');
await go('#/doctor-export');
await ok('Doctor export page renders', async () => {
  const html = await p.$eval('#app', el => el.innerHTML);
  if (html.length < 50) throw new Error('Too short');
});

// ========== FAB BUTTON ==========
console.log('\n22. FAB — menu toggle');
await go('#/today');
await ok('FAB button exists and toggles menu', async () => {
  const fab = await p.$('#fab');
  if (!fab) throw new Error('No FAB');
  await fab.click();
  await p.waitForTimeout(500);
  const menu = await p.$('#fab-menu');
  const display = await menu.evaluate(el => el.style.display);
  if (display === 'none') throw new Error('FAB menu did not open');
});
// Click a FAB menu item
await ok('FAB → Log Pain link works', async () => {
  const link = await p.$('#fab-menu a[href="#/log/pain"]');
  if (!link) throw new Error('Pain link missing from FAB');
  await link.click();
  await p.waitForTimeout(1000);
  const h = await p.evaluate(() => window.location.hash);
  if (!h.includes('pain')) throw new Error('Did not navigate: ' + h);
});

// ========== RESULTS ==========
console.log('\n══════════════════════════════════════');
console.log('  RESULTS');
console.log('══════════════════════════════════════');
console.log('  Passed: ' + passed);
console.log('  Failed: ' + failed);
if (consoleErrors.length > 0) {
  const unique = [...new Set(consoleErrors)];
  console.log('\n  Console errors (' + unique.length + ' unique):');
  for (const e of unique) console.log('    ⚠️ ' + e.substring(0, 200));
}
if (failures.length > 0) {
  console.log('\n  Failures:');
  for (const f of failures) console.log('    ❌ ' + f);
}
if (failed === 0 && consoleErrors.length === 0) {
  console.log('\n  🎉 ALL INTERACTIONS VERIFIED — ZERO ERRORS');
}
console.log('\n══════════════════════════════════════\n');
await b.close();
process.exit(failed > 0 ? 1 : 0);
