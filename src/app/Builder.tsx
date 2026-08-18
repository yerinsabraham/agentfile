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

function seed(stack: Stack): Answers {
  const answers = { ...EMPTY_ANSWERS };
  for (const [id, value] of Object.entries(stack.prefill)) {
    answers[id as keyof Answers] = value;
  }
  return answers;
}

export default function Builder({
  base,
  stacks,
}: {
  base: string;
  stacks: Stack[];
}) {
  const [stack] = useState<Stack>(stacks[0]);
  const [name, setName] = useState('');
  const [answers, setAnswers] = useState<Answers>(() => seed(stacks[0]));

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
            Fills in the commands and style answers. More stacks arrive in
            phase 4.
          </span>
          <select id="stack" value={stack.id} disabled>
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
