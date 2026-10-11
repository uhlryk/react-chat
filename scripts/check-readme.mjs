// Fails when an export of the built package has no row in the README's
// "API reference". The values come from the ES module itself, the types from
// its declaration file, since types do not exist at runtime. Run after a build.
import { readFileSync } from 'node:fs';

const values = Object.keys(await import('../dist/esm/index.js'));
const declarations = readFileSync(new URL('../dist/esm/index.d.ts', import.meta.url), 'utf8');
const types = [...declarations.matchAll(/export (?:type )?\{([^}]*)\}/g)]
  .flatMap((match) => match[1].split(','))
  .map((name) => name.trim().replace(/^type\s+/, ''))
  .filter(Boolean);
const exported = [...new Set([...values, ...types])];

const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const section = readme.split(/^## /m).find((part) => part.startsWith('API reference'));
if (section == null) {
  console.error('README.md has no "## API reference" section');
  process.exit(1);
}
// the first cell of each row names the export
const documented = new Set(
  section
    .split('\n')
    .map((line) => line.match(/^\| `([^`]+)` \|/)?.[1])
    .filter(Boolean),
);

const missing = exported.filter((name) => !documented.has(name));
const stale = [...documented].filter((name) => !exported.includes(name));
if (missing.length > 0 || stale.length > 0) {
  if (missing.length > 0) console.error(`not in the README's API reference: ${missing.join(', ')}`);
  if (stale.length > 0) console.error(`in the API reference but not exported: ${stale.join(', ')}`);
  process.exit(1);
}
console.log(`all ${exported.length} exports have a row in the API reference`);
