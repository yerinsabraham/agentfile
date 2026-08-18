'use client';

import { useMemo, useState } from 'react';

import { assemble, type Stack } from '@/lib/assemble';
import { EMPTY_ANSWERS, QUESTIONS, type Answers } from '@/lib/questions';

import styles from './page.module.css';

/**
 * The form and the live preview. PROJECT.md §4.
 *
 * Everything here runs in the browser. The templates were read from disk at
 * build time by templates/index.ts and arrive as props, already strings, so
 * nothing on this page needs a server.
 */

/**
 * Applies a stack's prefills over a set of answers.
 *
 * Switching stack replaces the stack-owned answers and leaves the user's
 * alone. Questions 2, 3, 5 and 6 are things only the author can know, so
 * losing them because someone clicked a dropdown would be the worst bug in
 * the app. Questions 1, 4 and 7 belong to the stack and are expected to
 * change with it, including when the user has edited them: a "commands"
 * answer left over from Next.js is wrong on Flutter, not worth preserving.
 */
function applyStack(stack: Stack, answers: Answers): Answers {
  const next = { ...answers };
  for (const q of QUESTIONS) {
    if (!q.prefilled) continue;
    next[q.id] = stack.prefill[q.id] ?? '';
  }
  return next;
}

export default function Builder({
  base,
  stacks,
}: {
  base: string;
  stacks: Stack[];
}) {
  const [stack, setStack] = useState<Stack>(stacks[0]);
  const [name, setName] = useState('');
  const [answers, setAnswers] = useState<Answers>(() =>
    applyStack(stacks[0], EMPTY_ANSWERS),
  );

  function chooseStack(id: string) {
    const next = stacks.find((s) => s.id === id);
    if (!next) return;
    setStack(next);
    setAnswers((prev) => applyStack(next, prev));
  }

  // Recomputed on every keystroke. There is no server to ask.
  const files = useMemo(
    () => assemble(base, answers, name),
    [base, answers, name],
  );

  return (
    <div className={styles.columns}>
      <section className={styles.form}>
        <p className={styles.paneLabel}>Your project</p>

        <div className={styles.field}>
          <label htmlFor="name">Project name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Orchard"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="stack">Stack</label>
          <span className={styles.hint}>
            Fills in the project, commands and style answers. Switching stack
            replaces those three and leaves your own answers alone.
          </span>
          <select
            id="stack"
            value={stack.id}
            onChange={(e) => chooseStack(e.target.value)}
          >
            {stacks.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {QUESTIONS.map((q) => (
          <div key={q.id} className={styles.field}>
            <label htmlFor={q.id}>
              {q.label}
              {q.prefilled && (
                <span className={styles.badge}>filled from stack</span>
              )}
            </label>
            <span className={styles.hint}>{q.hint}</span>
            <textarea
              id={q.id}
              rows={q.rows}
              value={answers[q.id]}
              placeholder={q.placeholder}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
              }
            />
          </div>
        ))}
      </section>

      <section className={styles.preview}>
        <div className={styles.previewInner}>
          <p className={styles.paneLabel}>AGENTS.md</p>
          <pre className={styles.output}>{files.agents}</pre>

          <p className={styles.paneLabel}>CLAUDE.md</p>
          <pre className={styles.output}>{files.claude}</pre>
          <p className={styles.note}>
            Two files, not one copied twice. AGENTS.md holds everything and
            CLAUDE.md points at it, so editing one cannot leave the other
            stale.
          </p>
        </div>
      </section>
    </div>
  );
}
