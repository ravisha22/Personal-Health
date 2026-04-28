import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport: { width: 375, height: 812 } })).newPage();
await p.goto('http://localhost:8765/?key=hc-r22-7x9m4q');
await p.waitForTimeout(3000);
// Check profile page
await p.evaluate(() => { window.location.hash = '#/profile'; });
await p.waitForTimeout(2000);
const profileText = await p.textContent('#app');
const undefinedCount = (profileText.match(/undefined/gi) || []).length;
console.log('Profile page "undefined" occurrences:', undefinedCount);
// Find the exact text around "kg"
const kgMatches = profileText.match(/.{0,30}kg.{0,30}/gi) || [];
console.log('Text around "kg":');
for (const m of kgMatches) console.log('  "' + m.trim() + '"');
// Check today page
await p.evaluate(() => { window.location.hash = '#/today'; });
await p.waitForTimeout(2000);
const todayText = await p.textContent('#app');
const todayUndef = (todayText.match(/undefined/gi) || []).length;
console.log('Today page "undefined" occurrences:', todayUndef);
// Check dashboard
await p.evaluate(() => { window.location.hash = '#/dashboard'; });
await p.waitForTimeout(2000);
const dashText = await p.textContent('#app');
const dashUndef = (dashText.match(/undefined/gi) || []).length;
console.log('Dashboard page "undefined" occurrences:', dashUndef);
const dashKg = dashText.match(/.{0,30}kg.{0,30}/gi) || [];
for (const m of dashKg) console.log('  Dash kg: "' + m.trim() + '"');
await b.close();
