// After both tsc builds: mark each half's module format for Node and bundlers.
import { writeFileSync } from 'node:fs';

writeFileSync('dist/cjs/package.json', `${JSON.stringify({ type: 'commonjs' })}\n`);
writeFileSync('dist/esm/package.json', `${JSON.stringify({ type: 'module' })}\n`);
