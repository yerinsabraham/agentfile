/**
 * Answers plus a template become the two output files. PROJECT.md §2 and §4.
 *
 * This is a browser function. §2 [r2]: the app is prerendered and pure client
 * after that, so everything here works on strings already in memory. There is
 * no request-time code anywhere in this project.
 *
 * Phase 2 keeps the stack hard coded, per §5. Phase 3 moves the template text
 * to markdown files on disk and imports it through templates/index.ts.
 */

import { QUESTIONS, type Answers, type QuestionId } from './questions';

export interface Stack {
  id: string;
  name: string;
  /** §2: seeds questions 1, 4 and 7. The user can edit any of it. */
  prefill: Partial<Record<QuestionId, string>>;
}

/**
 * The one hard coded stack for phase 2. §5 phase 4 adds Python FastAPI and
 * Flutter, at which point this moves to templates/stacks/nextjs.md.
 */
export const NEXTJS: Stack = {
  id: 'nextjs',
  name: 'Next.js',
  prefill: {
    what: 'Next.js App Router, TypeScript.',
    commands: 'npm run dev\nnpm run lint\nnpm run build',
    style:
      'Sentence case for headings.\nNo abbreviations in identifiers.\nComments say why, not what.',
  },
};

export const STACKS: readonly Stack[] = [NEXTJS];

export interface OutputFiles {
  agents: string;
  claude: string;
}

/** Trim, drop trailing blank lines, and normalise line endings. */
function clean(value: string): string {
  return value.replace(/\r\n/g, '\n').trim();
}

/**
 * A section with no answer is left out entirely rather than emitted as an
 * empty heading. A heading with nothing under it reads as an instruction the
 * agent could not find, which is worse than the section being absent.
 */
function section(heading: string, body: string): string | null {
  const text = clean(body);
  if (!text) return null;
  return heading ? `## ${heading}\n\n${text}` : text;
}

/**
 * Takes no stack argument. The stack seeds the ANSWERS via prefillAnswers,
 * so by the time assembly runs there is nothing stack-specific left to know.
 * A parameter added for phase 3 would be speculative, and the linter was
 * right to say so.
 */
export function assemble(answers: Answers, projectName: string): OutputFiles {
  const name = clean(projectName) || 'Your project';

  const blocks = QUESTIONS.map((q) =>
    section(q.heading, answers[q.id] ?? ''),
  ).filter((block): block is string => block !== null);

  const agents =
    blocks.length > 0
      ? `# ${name}\n\n${blocks.join('\n\n')}\n`
      : `# ${name}\n\nAnswer the questions on the left and this file writes itself.\n`;

  /**
   * §2 [r2]: two files, not one duplicated under two names. AGENTS.md holds
   * the content and CLAUDE.md points at it, so editing one cannot leave the
   * other stale. The import syntax is what Claude Code actually reads.
   */
  const claude = `@AGENTS.md\n`;

  return { agents, claude };
}

/** Used to seed the form when a stack is chosen. */
export function prefillAnswers(stack: Stack, current: Answers): Answers {
  const next = { ...current };
  for (const [id, value] of Object.entries(stack.prefill)) {
    if (!clean(next[id as QuestionId])) next[id as QuestionId] = value;
  }
  return next;
}
