import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport: { width: 375, height: 812 } })).newPage();

const errs = [];
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
p.on('pageerror', e => errs.push(e.message));

await p.goto('http://localhost:8765/?key=hc-r22-7x9m4q');
await p.waitForTimeout(3000);

// WORKOUT
await p.evaluate(() => { window.location.hash = '#/workout'; });
await p.waitForTimeout(2000);
const wo = await p.textContent('#app');
console.log('=== WORKOUT ===');
for (const t of ['Main Workout','Core','Warm-Up','Cool-Down','Cardio','Chest Press','Dead Bug','Sets','Reps','RPE','Form Cues','Pre-Workout','Post-Workout']) {
  console.log(`  ${wo.includes(t) ? '✅' : '❌'} ${t}`);
}
const yt = await p.$$('img[src*="youtube"]');
console.log('  YouTube thumbnails:', yt.length);
const sc = await p.$$('.set-check');
console.log('  Set checkboxes:', sc.length);

// MEALS
await p.evaluate(() => { window.location.hash = '#/meals'; });
await p.waitForTimeout(2000);
const ml = await p.textContent('#app');
console.log('\n=== MEALS ===');
for (const t of ['kcal','protein','Tap to see recipe','Breakfast','Lunch','Snack','Dinner']) {
  console.log(`  ${ml.includes(t) ? '✅' : '❌'} ${t}`);
}
const det = await p.$('details.meal-detail');
if (det) {
  await det.click();
  await p.waitForTimeout(500);
  const ex = await p.textContent('#app');
  console.log('  Expanded - Ingredients:', ex.includes('Ingredients'));
  console.log('  Expanded - Method:', ex.includes('Method'));
  const lis = await p.$$('details[open] li');
  console.log('  List items:', lis.length);
  if (lis.length > 0) {
    const txt = await lis[0].textContent();
    console.log('  First item:', txt.substring(0, 80));
  }
}

if (errs.length) { console.log('\n⚠️ Console errors:'); for (const e of errs) console.log('  -', e.substring(0, 150)); }
else { console.log('\n✅ Zero console errors'); }

await b.close();
