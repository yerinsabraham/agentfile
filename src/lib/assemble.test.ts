/**
 * Tests for the assembly. PROJECT.md §2 and §4.
 *
 * Uses node:test and node:assert, which ship with Node. §6 forbids a
 * dependency whose reason is not written down first, and a test runner would
 * be one more line in package.json for something the platform already has.
 *
 *   npm test
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { assemble, parseStackPrefills } from './assemble.ts';
import { EMPTY_ANSWERS, type Answers } from './questions.ts';

const BASE = [
  '# {{name}}',
  '',
  '{{what}}',
  '',
  '## Never',
  '',
  '{{never}}',
  '',
  '## Commands',
  '',
  '{{commands}}',
  '',
].join('\n');

function answers(overrides: Partial<Answers>): Answers {
  return { ...EMPTY_ANSWERS, ...overrides };
}

/* ------------------------------------------------------- the regression */

test('a token typed inside a section answer is left alone', () => {
  const typed = 'Never write {{name}} by hand.';
  const out = assemble(BASE, answers({ never: typed }), 'Orchard').agents;

  assert.ok(
    out.includes(typed),
    'user text was rewritten. Two sequential passes let the second pass ' +
      're-read what the first inserted. Keep assembly to one scan.',
  );
  assert.ok(!out.includes('Never write Orchard by hand.'));
});

test('a token typed inside a loose answer is left alone', () => {
  const typed = 'A tool that emits {{commands}} for you.';
  const out = assemble(BASE, answers({ what: typed }), 'Orchard').agents;
  assert.ok(out.includes(typed));
});

test('the project name still fills the heading it belongs to', () => {
  const out = assemble(BASE, answers({}), 'Orchard').agents;
  assert.ok(out.startsWith('# Orchard'));
});

test('an unnamed project falls back rather than emitting an empty heading', () => {
  const out = assemble(BASE, answers({}), '   ').agents;
  assert.ok(out.startsWith('# Your project'));
});

/* ------------------------------------------------------ section handling */

test('an unanswered section is dropped along with its heading', () => {
  const out = assemble(BASE, answers({ commands: 'npm run dev' }), 'X').agents;
  assert.ok(!out.includes('## Never'), 'empty section kept its heading');
  assert.ok(out.includes('## Commands'));
  assert.ok(out.includes('npm run dev'));
});

test('whitespace only counts as unanswered', () => {
  const out = assemble(BASE, answers({ never: '   \n  ' }), 'X').agents;
  assert.ok(!out.includes('## Never'));
});

test('no run of three or more blank lines survives', () => {
  const out = assemble(BASE, answers({}), 'X').agents;
  assert.ok(!/\n{3,}/.test(out));
});

test('output ends with exactly one newline', () => {
  const out = assemble(BASE, answers({ never: 'x' }), 'X').agents;
  assert.ok(out.endsWith('\n'));
  assert.ok(!out.endsWith('\n\n'));
});

/* -------------------------------------------------------------- CLAUDE.md */

test('CLAUDE.md is the import line and nothing else', () => {
  const { claude } = assemble(BASE, answers({}), 'X');
  assert.equal(claude, '@AGENTS.md\n');
});

/* --------------------------------------------------------- stack parsing */

test('stack prefills are read from known question ids only', () => {
  const source = [
    '# Some stack',
    '',
    'Notes for contributors, which must be ignored.',
    '',
    '## what',
    '',
    'A stack.',
    '',
    '## not-a-question',
    '',
    'Should not appear.',
    '',
    '## commands',
    '',
    'run it',
    '',
  ].join('\n');

  const prefill = parseStackPrefills(source);
  assert.deepEqual(Object.keys(prefill).sort(), ['commands', 'what']);
  assert.equal(prefill.what, 'A stack.');
});

test('an empty stack section is not treated as a prefill', () => {
  const prefill = parseStackPrefills('## what\n\n\n## commands\n\nrun it\n');
  assert.deepEqual(Object.keys(prefill), ['commands']);
});
