/**
 * Answers plus templates become the two output files. PROJECT.md §2 and §4.
 *
 * This is a browser function. §2 [r2]: the app is prerendered and pure client
 * after that, so everything here works on strings already in memory. It never
 * touches the filesystem and never imports the registry. Templates arrive as
 * arguments, loaded at build time and passed down as props.
 *
 * Phase 3 moved the template text to disk. The section order and the wording
 * of every heading now live in templates/base.md, so a contributor changes
 * the output by editing markdown rather than by editing this file.
 */

import { QUESTION_IDS, type Answers, type QuestionId } from './questions';

export interface Stack {
  id: string;
  name: string;
  /** §2: seeds questions 1, 4 and 7. The user can edit any of it. */
  prefill: Partial<Record<QuestionId, string>>;
}

export interface OutputFiles {
  agents: string;
  claude: string;
}

/** Trim, drop trailing blank lines, normalise line endings. */
function clean(value: string): string {
  return value.replace(/\r\n/g, '\n').trim();
}

/**
 * Pulls prefills out of a stack template. A stack file is plain markdown with
 * one `## <question id>` section per prefilled answer. Anything else in the
 * file, including the title and the notes to contributors, is ignored on
 * purpose, so a contributor can write as much explanation as they like.
 */
export function parseStackPrefills(
  source: string,
): Partial<Record<QuestionId, string>> {
  const prefill: Partial<Record<QuestionId, string>> = {};
  const known = QUESTION_IDS as readonly string[];

  for (const section of source.split(/^## /m).slice(1)) {
    const breakAt = section.indexOf('\n');
    if (breakAt === -1) continue;
    const key = section.slice(0, breakAt).trim();
    const body = clean(section.slice(breakAt + 1));
    if (known.includes(key) && body) prefill[key as QuestionId] = body;
  }

  return prefill;
}

/**
 * Marks a section for removal. A heading whose only content is an unanswered
 * token is dropped along with its heading: a heading an agent cannot find
 * content under reads as an instruction it failed to follow, which is worse
 * than the section being absent.
 *
 * A literal sentinel rather than a control character, so the file stays
 * readable and greppable.
 */
const DROP = '<<<agentfile:drop-this-line>>>';

export function assemble(
  base: string,
  answers: Answers,
  projectName: string,
): OutputFiles {
  const name = clean(projectName) || 'Your project';

  // Sections first, so an empty one takes its heading with it.
  let agents = base.replace(
    /## (.+)\n+\{\{(\w+)\}\}/g,
    (_match, heading: string, token: string) => {
      const value = clean(answers[token as QuestionId] ?? '');
      return value ? `## ${heading}\n\n${value}` : DROP;
    },
  );

  // Then the loose tokens that are not inside a section.
  agents = agents.replace(/\{\{(\w+)\}\}/g, (_match, token: string) => {
    if (token === 'name') return name;
    return clean(answers[token as QuestionId] ?? '');
  });

  agents = agents
    .split('\n')
    .filter((line) => line.trim() !== DROP)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  /**
   * §2 [r2]: two files, not one duplicated under two names. AGENTS.md holds
   * the content and CLAUDE.md points at it, so editing one cannot leave the
   * other stale. `@AGENTS.md` is the documented import syntax, not a
   * stylistic choice: it is what the agent actually reads and acts on.
   */
  return { agents: `${agents}\n`, claude: '@AGENTS.md\n' };
}
