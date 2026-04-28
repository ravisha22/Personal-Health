import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const pg = await (await b.newContext({ viewport: { width: 375, height: 812 } })).newPage();
const errs = [];
pg.on('pageerror', e => errs.push(e.message));
pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await pg.goto('http://localhost:8765/?key=hc-r22-7x9m4q');
await pg.waitForTimeout(3000);
await pg.evaluate(() => { window.location.hash = '#/meal-planner'; });
await pg.waitForTimeout(2000);
const text = await pg.textContent('#app');
console.log('Renders:', text.length > 100 ? 'YES (' + text.length + ' chars)' : 'NO');
console.log('Has recipe names:', text.includes('Adai') || text.includes('Pesarattu'));
console.log('Has cuisine filter:', text.includes('All Cuisines'));
console.log('Has export btn:', text.includes('Export'));
const plusBtns = await pg.$$('.mp-plus');
console.log('Plus buttons:', plusBtns.length);
if (plusBtns.length > 0) {
  await plusBtns[0].click();
  await pg.waitForTimeout(500);
  const after = await pg.textContent('#app');
  console.log('After plus click, has count:', after.includes('1 recipe'));
}
if (errs.length) { console.log('ERRORS:'); for (const e of errs) console.log(' -', e.substring(0,150)); }
else console.log('Console errors: NONE');
await b.close();
