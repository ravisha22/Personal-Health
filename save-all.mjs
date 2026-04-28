// SAVE FLOW TEST: Fill every form and click save. Catch every crash.
import { chromium } from 'playwright';

let passed = 0, failed = 0;
const failures = [];
const ce = []; // console errors

async function ok(name, fn) {
  try { await fn(); passed++; console.log('  ✅ ' + name); }
  catch (e) { failed++; failures.push(name + ': ' + e.message); console.log('  ❌ ' + name + ': ' + e.message.substring(0, 200)); }
}

const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport: { width: 375, height: 812 } })).newPage();
p.on('console', m => { if (m.type() === 'error') ce.push(m.text()); });
p.on('pageerror', e => ce.push(e.message));

async function go(h) { await p.evaluate(x => { window.location.hash = x; }, h); await p.waitForTimeout(1500); }

// Helper: find button by text
async function findBtn(text) {
  const btns = await p.$$('button, input[type="submit"], a.btn');
  for (const btn of btns) {
    const t = (await btn.textContent()).toLowerCase();
    if (t.includes(text.toLowerCase())) return btn;
  }
  return null;
}

// Helper: check for new console errors after an action
function checkErrors(label) {
  const recent = ce.filter(e => !e.includes('orderBy') && !e.includes('ResizeObserver'));
  return recent;
}

await p.goto('http://localhost:8765/?key=hc-r22-7x9m4q');
await p.waitForTimeout(3000);

console.log('\n══════════════════════════════════════');
console.log('  EVERY SAVE FLOW — FILL AND SUBMIT');
console.log('══════════════════════════════════════\n');

const errorsBefore = ce.length;

// ===== 1. LOG FLARE =====
console.log('1. LOG FLARE (#/log/flare)');
await go('#/log/flare');
ce.length = 0; // reset
await ok('Fill flare severity', async () => {
  const slider = await p.$('input[type="range"]');
  if (!slider) throw new Error('No severity slider');
  await slider.fill('6');
});
// Check joint checkboxes if available
const flareChecks = await p.$$('input[type="checkbox"]');
if (flareChecks.length > 0) {
  await ok('Check a joint/trigger checkbox', async () => {
    await flareChecks[0].check();
  });
}
// Select from dropdowns if available
const flareSelects = await p.$$('select');
for (const sel of flareSelects) {
  const opts = await sel.$$eval('option', os => os.filter(o => o.value).map(o => o.value));
  if (opts.length > 0) await sel.selectOption(opts[0]);
}
// Save
const flareSave = await findBtn('save') || await findBtn('log');
await ok('Save flare entry', async () => {
  if (!flareSave) throw new Error('No save button found');
  await flareSave.click();
  await p.waitForTimeout(2000);
  if (ce.length > 0) throw new Error('Console error: ' + ce[ce.length-1].substring(0, 150));
});

// ===== 2. LOG CHECK-IN =====
console.log('\n2. LOG CHECK-IN (#/log/checkin)');
await go('#/log/checkin');
ce.length = 0;
// Fill all sliders
const ciSliders = await p.$$('input[type="range"]');
await ok('Fill check-in sliders (' + ciSliders.length + ')', async () => {
  for (const s of ciSliders) await s.fill('7');
});
// Fill number inputs (sleep hours etc)
const ciNums = await p.$$('input[type="number"]');
for (const n of ciNums) {
  try { await n.fill('7'); } catch(e) {}
}
// Save
const ciSave = await findBtn('save') || await findBtn('log') || await findBtn('submit') || await findBtn('check');
await ok('Save check-in', async () => {
  if (!ciSave) throw new Error('No save button. Buttons: ' + (await Promise.all((await p.$$('button')).map(b => b.textContent()))).join(' | '));
  await ciSave.click();
  await p.waitForTimeout(2000);
  if (ce.length > 0) throw new Error('Console error: ' + ce[ce.length-1].substring(0, 150));
});

// ===== 3. LOG WORKOUT (old form) =====
console.log('\n3. LOG WORKOUT (#/log/workout)');
await go('#/log/workout');
ce.length = 0;
// Fill duration
const woDur = await p.$('#wo-duration');
if (woDur) await woDur.fill('45');
// Fill RPE slider
const woRpe = await p.$('#wo-rpe');
if (woRpe) await woRpe.fill('6');
// Save
const woSave = await findBtn('save');
await ok('Save workout log', async () => {
  if (!woSave) throw new Error('No save button');
  await woSave.click();
  await p.waitForTimeout(2000);
  if (ce.length > 0) throw new Error('Console error: ' + ce[ce.length-1].substring(0, 150));
});

// ===== 4. LOG MEAL (old form) =====
console.log('\n4. LOG MEAL (#/log/meal)');
await go('#/log/meal');
ce.length = 0;
// Fill text inputs
const mlTextarea = await p.$('textarea');
if (mlTextarea) await mlTextarea.fill('Rice, sambar, poriyal');
// Fill number inputs
const mlNums = await p.$$('input[type="number"]');
for (const n of mlNums) { try { await n.fill('500'); } catch(e) {} }
// Select meal type
const mlSelect = await p.$('select');
if (mlSelect) {
  const opts = await mlSelect.$$eval('option', os => os.filter(o => o.value).map(o => o.value));
  if (opts.length > 0) await mlSelect.selectOption(opts[0]);
}
// Save
const mlSave = await findBtn('save') || await findBtn('log');
await ok('Save meal log', async () => {
  if (!mlSave) throw new Error('No save button');
  await mlSave.click();
  await p.waitForTimeout(2000);
  if (ce.length > 0) throw new Error('Console error: ' + ce[ce.length-1].substring(0, 150));
});

// ===== 5. GOALS — add and save =====
console.log('\n5. GOALS — add new goal (#/goals)');
await go('#/goals');
ce.length = 0;
// Find add goal button
const addGoalBtn = await findBtn('add') || await findBtn('new') || await findBtn('create');
await ok('Click add goal', async () => {
  if (!addGoalBtn) throw new Error('No add goal button. Buttons: ' + (await Promise.all((await p.$$('button')).map(b => b.textContent()))).join(' | '));
  await addGoalBtn.click();
  await p.waitForTimeout(1000);
});
// Fill goal form (if it appeared)
const goalInputs = await p.$$('input[type="text"], input[type="number"], textarea');
for (const inp of goalInputs) {
  const type = await inp.getAttribute('type');
  try {
    if (type === 'number') await inp.fill('123');
    else await inp.fill('Lose 10kg');
  } catch(e) {}
}
const goalSelects = await p.$$('select');
for (const sel of goalSelects) {
  const opts = await sel.$$eval('option', os => os.filter(o => o.value).map(o => o.value));
  if (opts.length > 0) await sel.selectOption(opts[0]);
}
// Save goal
const goalSave = await findBtn('save') || await findBtn('create') || await findBtn('add goal');
if (goalSave) {
  await ok('Save goal', async () => {
    await goalSave.click();
    await p.waitForTimeout(2000);
    if (ce.length > 0) throw new Error('Console error: ' + ce[ce.length-1].substring(0, 150));
  });
}

// ===== 6. LABS — add and save =====
console.log('\n6. LABS — add result (#/labs)');
await go('#/labs');
ce.length = 0;
const addLabBtn = await findBtn('add') || await findBtn('new') || await findBtn('log');
await ok('Click add lab result', async () => {
  if (!addLabBtn) throw new Error('No add lab button. Buttons: ' + (await Promise.all((await p.$$('button')).map(b => b.textContent()))).join(' | '));
  await addLabBtn.click();
  await p.waitForTimeout(1000);
});
// Fill lab form
const labNums = await p.$$('input[type="number"]');
for (const n of labNums) { try { await n.fill('100'); } catch(e) {} }
const labSelects = await p.$$('select');
for (const sel of labSelects) {
  const opts = await sel.$$eval('option', os => os.filter(o => o.value).map(o => o.value));
  if (opts.length > 0) await sel.selectOption(opts[0]);
}
const labSave = await findBtn('save') || await findBtn('add') || await findBtn('log');
if (labSave) {
  await ok('Save lab result', async () => {
    await labSave.click();
    await p.waitForTimeout(2000);
    if (ce.length > 0) throw new Error('Console error: ' + ce[ce.length-1].substring(0, 150));
  });
}

// ===== 7. MEDICATION ADHERENCE =====
console.log('\n7. MEDICATION ADHERENCE (#/medications)');
await go('#/medications');
ce.length = 0;
const medChecks = await p.$$('input[type="checkbox"]');
if (medChecks.length > 0) {
  await ok('Toggle medication adherence checkbox', async () => {
    await medChecks[0].check();
    await p.waitForTimeout(1000);
    if (ce.length > 0) throw new Error('Console error: ' + ce[ce.length-1].substring(0, 150));
  });
}

// ===== 8. EXPORT DATA =====
console.log('\n8. EXPORT DATA (#/export-import)');
await go('#/export-import');
ce.length = 0;
const exportBtn = await findBtn('export') || await findBtn('download') || await findBtn('backup');
await ok('Export button exists', async () => {
  if (!exportBtn) throw new Error('No export button');
});

// ===== RESULTS =====
console.log('\n══════════════════════════════════════');
console.log('  SAVE FLOW RESULTS');
console.log('══════════════════════════════════════');
console.log('  Passed: ' + passed);
console.log('  Failed: ' + failed);
if (failures.length > 0) {
  console.log('\n  Failures:');
  for (const f of failures) console.log('    ❌ ' + f);
}
if (failed === 0) console.log('\n  🎉 ALL SAVE FLOWS VERIFIED');
console.log('\n══════════════════════════════════════\n');
await b.close();
process.exit(failed > 0 ? 1 : 0);
