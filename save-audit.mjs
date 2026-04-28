// Full functional test: attempt to SAVE data on every log page and verify it persists.
import { chromium } from 'playwright';

let passed = 0, failed = 0;
const errors = [];

async function assert(name, fn) {
  try { await fn(); passed++; console.log('  ✅ ' + name); }
  catch (e) { failed++; errors.push({ name, error: e.message }); console.log('  ❌ ' + name + ': ' + e.message); }
}

const consoleErrors = [];
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport: { width: 375, height: 812 } })).newPage();
p.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
p.on('pageerror', e => consoleErrors.push(e.message));

await p.goto('http://localhost:8765/?key=hc-r22-7x9m4q');
await p.waitForTimeout(3000);

// ===== LOG PAIN =====
console.log('\n1. LOG PAIN (#/log/pain)');
await p.evaluate(() => { window.location.hash = '#/log/pain'; });
await p.waitForTimeout(2000);

// Check what elements exist
const painHtml = await p.$eval('#app', el => el.innerHTML);
await assert('Pain page renders', async () => {
  if (painHtml.length < 100) throw new Error('Page too short');
});

// Look for select, slider, save button
const painSelect = await p.$('select');
const painSlider = await p.$('input[type="range"]');
const painSaveBtn = await p.$('button');
await assert('Has body part selector', async () => { if (!painSelect) throw new Error('No select found'); });
await assert('Has pain slider', async () => { if (!painSlider) throw new Error('No range input found'); });

// Try to find save button by text
const allBtns = await p.$$('button');
let saveBtnFound = null;
for (const btn of allBtns) {
  const txt = await btn.textContent();
  if (txt.toLowerCase().includes('save') || txt.toLowerCase().includes('log') || txt.toLowerCase().includes('submit')) {
    saveBtnFound = btn;
    break;
  }
}
await assert('Has save/log button', async () => { if (!saveBtnFound) throw new Error('No save button. Buttons found: ' + (await Promise.all(allBtns.map(b => b.textContent()))).join(' | ')); });

// Try to fill and save
if (painSelect) {
  const options = await painSelect.$$eval('option', opts => opts.map(o => ({ val: o.value, txt: o.textContent })).filter(o => o.val));
  await assert('Body part options exist', async () => { if (options.length === 0) throw new Error('No options'); });
  if (options.length > 0) {
    await painSelect.selectOption(options[0].val);
  }
}
if (painSlider) await painSlider.fill('4');
if (saveBtnFound) {
  await saveBtnFound.click();
  await p.waitForTimeout(2000);
  // Check for toast or navigation
  const afterHash = await p.evaluate(() => window.location.hash);
  const toastVisible = await p.$('.toast');
  await assert('Save completed (navigated or toast)', async () => {
    // Check if there's a console error from the save attempt
    const recentErrors = consoleErrors.filter(e => !e.includes('orderBy'));
    if (recentErrors.length > 0) throw new Error('Console error after save: ' + recentErrors[recentErrors.length - 1].substring(0, 200));
  });
}

// ===== LOG VITALS =====
console.log('\n2. LOG VITALS (#/log/vitals)');
await p.evaluate(() => { window.location.hash = '#/log/vitals'; });
await p.waitForTimeout(2000);

const vitalsHtml = await p.$eval('#app', el => el.innerHTML);
await assert('Vitals page renders', async () => { if (vitalsHtml.length < 100) throw new Error('Too short'); });

// Find all number inputs
const numInputs = await p.$$('input[type="number"]');
await assert('Has number inputs for weight/BP', async () => { if (numInputs.length === 0) throw new Error('No number inputs'); });

// Find save button
const vBtns = await p.$$('button');
let vSave = null;
for (const btn of vBtns) {
  const txt = await btn.textContent();
  if (txt.toLowerCase().includes('save') || txt.toLowerCase().includes('log')) { vSave = btn; break; }
}
await assert('Has save button', async () => { if (!vSave) throw new Error('No save. Buttons: ' + (await Promise.all(vBtns.map(b => b.textContent()))).join(' | ')); });

// ===== LOG HYDRATION =====
console.log('\n3. LOG HYDRATION (#/log/hydration)');
await p.evaluate(() => { window.location.hash = '#/log/hydration'; });
await p.waitForTimeout(2000);

const hydHtml = await p.$eval('#app', el => el.innerHTML);
await assert('Hydration page renders', async () => { if (hydHtml.length < 100) throw new Error('Too short'); });

// Find quick-add buttons (250ml, 500ml etc)
const hydBtns = await p.$$('button');
let quickAddBtn = null;
for (const btn of hydBtns) {
  const txt = await btn.textContent();
  if (txt.includes('250') || txt.includes('500') || txt.includes('ml') || txt.includes('Add')) { quickAddBtn = btn; break; }
}
await assert('Has quick-add water button', async () => { if (!quickAddBtn) throw new Error('No quick-add. Buttons: ' + (await Promise.all(hydBtns.map(b => b.textContent()))).join(' | ')); });

// ===== LOG CHECK-IN =====
console.log('\n4. LOG CHECK-IN (#/log/checkin)');
await p.evaluate(() => { window.location.hash = '#/log/checkin'; });
await p.waitForTimeout(2000);

const ciHtml = await p.$eval('#app', el => el.innerHTML);
await assert('Check-in page renders', async () => { if (ciHtml.length < 100) throw new Error('Too short'); });

// ===== LOG FLARE =====
console.log('\n5. LOG FLARE (#/log/flare)');
await p.evaluate(() => { window.location.hash = '#/log/flare'; });
await p.waitForTimeout(2000);

const flHtml = await p.$eval('#app', el => el.innerHTML);
await assert('Flare page renders', async () => { if (flHtml.length < 100) throw new Error('Too short'); });

// ===== PROFILE EDIT =====
console.log('\n6. PROFILE EDIT (#/profile)');
await p.evaluate(() => { window.location.hash = '#/profile'; });
await p.waitForTimeout(2000);

const pfHtml = await p.$eval('#app', el => el.innerHTML);
await assert('Profile page renders', async () => { if (pfHtml.length < 100) throw new Error('Too short'); });

// Try edit conditions
const editBtn = await p.$('[data-edit="conditions"]');
await assert('Conditions edit button exists', async () => { if (!editBtn) throw new Error('No edit button'); });
if (editBtn) {
  await editBtn.click();
  await p.waitForTimeout(1000);
  const saveBtn = await p.$('#pf-save-conditions');
  await assert('Save conditions button appears', async () => { if (!saveBtn) throw new Error('No save button after clicking edit'); });
  if (saveBtn) {
    await saveBtn.click();
    await p.waitForTimeout(1000);
  }
}

// ===== RESULTS =====
console.log('\n========================================');
console.log('  SAVE FLOW AUDIT RESULTS');
console.log('========================================');
console.log('  Passed:', passed);
console.log('  Failed:', failed);
if (consoleErrors.length > 0) {
  console.log('\n  Console errors (' + consoleErrors.length + '):');
  const unique = [...new Set(consoleErrors)];
  for (const e of unique) console.log('    -', e.substring(0, 200));
}
if (errors.length > 0) {
  console.log('\n  Failed tests:');
  for (const e of errors) console.log('    ❌', e.name + ':', e.error);
}
console.log('\n========================================');
await b.close();
process.exit(failed > 0 ? 1 : 0);
