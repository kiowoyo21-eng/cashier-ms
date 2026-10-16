import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const read = name => readFileSync(resolve(root, name), 'utf8');

test('GitHub Pages export is configured and independent of Vercel', () => {
  const config = read('next.config.ts');
  assert.match(config, /output:\s*'export'/);
  assert.match(config, /trailingSlash:\s*true/);
  assert.match(config, /basePath/);
  assert.match(config, /NEXT_PUBLIC_BASE_PATH/);
  assert.ok(existsSync(resolve(root, 'GITHUB_SETUP.md')));
});

test('push to GitHub compiles and deploys generated out directory', () => {
  const workflow = read('.github/workflows/deploy-pages.yml');
  assert.match(workflow, /branches:\s*\[main, master\]/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /path:\s*\.\/out/);
  assert.match(workflow, /GITHUB_REPOSITORY/);
});
