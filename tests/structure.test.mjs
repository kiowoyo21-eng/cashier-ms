import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const file=p=>readFileSync(resolve(root,p),'utf8');
test('frontend-only dependencies',()=>{const p=JSON.parse(file('package.json'));for(const banned of ['@supabase','prisma','firebase','mongodb','express'])assert.ok(!JSON.stringify(p).toLowerCase().includes(banned))});
test('four branches and eight demo role accounts are declared',()=>{const t=file('lib/types.ts'),s=file('lib/seed.ts');for(const name of ['Mastermind Mandaluyong','Underchargers Mandaluyong','Underchargers Las Piñas','Underchargers Quezon City'])assert.ok(t.includes(name));for(const u of ['cashier','admin','pbacc','bm','accounting','president','hr','superadmin'])assert.ok(s.includes(`'${u}'`))});
test('cross-cutting local persistence and business invariants',()=>{const store=file('lib/store.tsx'),screen=file('features/FundsScreen.tsx'),pos=file('features/POSScreen.tsx');assert.ok(store.includes('localStorage.setItem'));assert.ok(store.includes('schemaVersion'));assert.ok(screen.includes("category!=='Part'"));assert.ok(pos.includes("status='Closed'"))});
