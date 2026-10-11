// Fails when anything that looks like a credential is in a tracked file or in
// what `npm pack` would publish. CI runs it on every push, release.yml before
// publishing. `--self-test` first proves every pattern still catches a fake.
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';

const PATTERNS = {
  'npm token': /npm_[A-Za-z0-9]{36}/,
  'GitHub token': /gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{20,}/,
  'AWS access key': /(?:AKIA|ASIA)[0-9A-Z]{16}/,
  'npm auth in .npmrc': /_authToken\s*=\s*[^\s$]/,
  'private key': /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  JWT: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}/,
  'Slack token': /xox[abprs]-[A-Za-z0-9-]{10,}/,
  'Anthropic or OpenAI key': /sk-(?:ant-)?[A-Za-z0-9_-]{32,}/,
  'Google API key': /AIza[0-9A-Za-z_-]{35}/,
  'GitLab token': /glpat-[A-Za-z0-9_-]{20}/,
  'password in a URL': /[a-z][a-z0-9+.-]*:\/\/[^/\s:@]+:[^/\s@]+@/i,
};
const FORBIDDEN_FILES = /(^|\/)(\.npmrc|\.env(\..*)?|id_[a-z0-9]+|.*\.(pem|key|p12|pfx))$/;

function scan(files) {
  const found = [];
  for (const file of files) {
    if (FORBIDDEN_FILES.test(file)) found.push(`${file}: a credentials file`);
    let text;
    try {
      if (statSync(file).size > 2_000_000) continue;
      text = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    for (const [name, pattern] of Object.entries(PATTERNS)) {
      if (pattern.test(text)) found.push(`${file}: ${name}`);
    }
  }
  return found;
}

if (process.argv.includes('--self-test')) {
  // the fakes are built here, so this file never holds one
  const fakes = {
    'npm token': `npm_${'a'.repeat(36)}`,
    'GitHub token': `ghp_${'B'.repeat(36)}`,
    'AWS access key': `AKIA${'C'.repeat(16)}`,
    'npm auth in .npmrc': `//registry.npmjs.org/:_authToken=${'d'.repeat(8)}`,
    'private key': `-----BEGIN OPENSSH ${'PRIVATE'} KEY-----`,
    JWT: `eyJ${'e'.repeat(12)}.eyJ${'f'.repeat(12)}`,
    'Slack token': `xoxb-${'1'.repeat(12)}`,
    'Anthropic or OpenAI key': `sk-ant-${'g'.repeat(40)}`,
    'Google API key': `AIza${'h'.repeat(35)}`,
    'GitLab token': `glpat-${'i'.repeat(20)}`,
    'password in a URL': `https://user:${'p'.repeat(6)}@example.com`,
  };
  const missed = Object.keys(PATTERNS).filter((name) => !PATTERNS[name].test(fakes[name] ?? ''));
  const forbidden = ['.npmrc', 'a/.env', '.env.local', 'id_rsa', 'x.pem'].filter((f) => !FORBIDDEN_FILES.test(f));
  if (missed.length > 0 || forbidden.length > 0) {
    console.error(`self-test: missed ${[...missed, ...forbidden].join(', ')}`);
    process.exit(1);
  }
  console.log(`self-test: all ${Object.keys(PATTERNS).length} patterns and the file names catch their fakes`);
}

const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const packed = JSON.parse(
  execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { encoding: 'utf8' }),
)[0].files.map((f) => f.path);
const found = scan([...new Set([...tracked, ...packed])]);
if (found.length > 0) {
  console.error(`Possible credentials:\n  ${found.join('\n  ')}`);
  process.exit(1);
}
console.log(`no credentials in ${tracked.length} tracked files or ${packed.length} packed files`);
