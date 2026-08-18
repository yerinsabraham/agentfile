/**
 * The registry. PROJECT.md §3 and §4.
 *
 * This is the ONLY registry. Revision 1 had lib/registry.ts reading this file,
 * so the registry read the registry. There is one file now.
 *
 * ── On the mechanism ──────────────────────────────────────────────────────
 * §3 [r2] says a missing template fails the build "via the import itself",
 * using static imports. Next.js cannot import a .md file as a string without
 * a loader dependency, and §6 forbids adding one without the reason going
 * into PROJECT.md first. So the paths below are static string literals read
 * at build time instead.
 *
 * The guarantee is unchanged: delete a listed template and `next build`
 * fails, loudly, naming the missing file. What changes is when it fails,
 * during prerender rather than at compile. There is still no check script to
 * remember to run, which was the point.
 *
 * This module runs at build time only. It is imported by a Server Component,
 * which passes the loaded strings to the browser as props. Nothing here runs
 * at request time, so the no-backend rule holds.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const TEMPLATE_DIR = join(process.cwd(), 'templates');

/** Reads one template. A missing file throws, and that throw is the phase. */
function load(...segments: string[]): string {
  const path = join(TEMPLATE_DIR, ...segments);
  try {
    return readFileSync(path, 'utf8');
  } catch {
    throw new Error(
      `Template missing: templates/${segments.join('/')}\n` +
        `It is listed in templates/index.ts but is not on disk. Either restore ` +
        `the file or remove its entry from the registry.`,
    );
  }
}

export interface StackTemplate {
  id: string;
  name: string;
  /** Raw markdown. Parsed into prefills by lib/assemble.ts. */
  source: string;
}

/** The skeleton every output starts from. */
export const BASE: string = load('base.md');

/**
 * Every stack, listed once. Adding a stack is two lines here plus one
 * markdown file, which is the whole contribution story in §1.
 *
 * Phase 4 adds python-fastapi and flutter.
 */
export const STACK_TEMPLATES: readonly StackTemplate[] = [
  { id: 'nextjs', name: 'Next.js', source: load('stacks', 'nextjs.md') },
];
