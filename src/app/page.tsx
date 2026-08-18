'use client';

import { useMemo, useState } from 'react';

import {
  NEXTJS,
  STACKS,
  assemble,
  prefillAnswers,
  type Stack,
} from '@/lib/assemble';
import { EMPTY_ANSWERS, QUESTIONS, type Answers } from '@/lib/questions';

import styles from './page.module.css';

/**
 * Phase 2. PROJECT.md §5.
 *
 * This is now a client component, which §4 always said it would be. Phase 1
 * left it as a server component on purpose, because a 'use client' holding no
 * state is noise. It holds state now, so it earns the directive.
 *
 * One hard coded stack, per §5. Phase 3 moves the templates to disk and phase
 * 5 adds copy and download.
 */
export default function Page() {
  const [stack] = useState<Stack>(NEXTJS);
  const [name, setName] = useState('');
  const [answers, setAnswers] = useState<Answers>(() =>
    prefillAnswers(NEXTJS, EMPTY_ANSWERS),
  );

  // Recomputed on every keystroke. There is no server to ask, so this is just
  // string work on data already in memory. §2 [r2].
  const files = useMemo(
    () => assemble(answers, name),
    [answers, name],
  );

  function setAnswer(id: keyof Answers, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.wordmark}>Agentfile</p>
        <p className={styles.tagline}>
          Answer a few questions about your project and get the context file
          your AI coding agent reads before it touches your code. Nothing is
          sent anywhere. It is all assembled in your browser.
        </p>
      </header>

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
              {STACKS.map((s) => (
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
                onChange={(e) => setAnswer(q.id, e.target.value)}
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
    </div>
  );
}
