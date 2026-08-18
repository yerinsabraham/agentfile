import styles from './page.module.css';

/**
 * Phase 1 skeleton. PROJECT.md §5.
 *
 * The output below is hard coded on purpose. Phase 2 adds questions.ts and
 * assemble.ts and makes this update as you type; phase 3 moves the template
 * text to disk. Nothing here is wired yet, so the fields are disabled rather
 * than pretending to work.
 *
 * §4 describes this file as a client component. It is not one yet, because
 * there is no state in phase 1 and a 'use client' that holds nothing would be
 * noise. It becomes one in phase 2, when the preview starts responding.
 */

/** The question set, PROJECT.md §2. Rendered here, answered in phase 2. */
const QUESTIONS = [
  {
    id: 'what',
    label: 'What is this project, in two sentences?',
    hint: 'Without this the agent infers purpose from file names and gets it wrong.',
  },
  {
    id: 'never',
    label: 'What must never be done here?',
    hint: 'Phrased as prohibitions. "Prefer X" gets negotiated away, "never X" does not.',
  },
  {
    id: 'deliberate',
    label: 'What looks wrong but is deliberate?',
    hint: 'Every codebase has decisions that read as bugs. Without this the agent helpfully undoes them.',
  },
  {
    id: 'commands',
    label: 'What commands run, test and build it?',
    hint: 'Stops the agent inventing a script that does not exist.',
  },
  {
    id: 'docs',
    label: 'Where does the real reasoning live?',
    hint: 'Points at the docs, so the agent reads them instead of guessing.',
  },
  {
    id: 'ask',
    label: 'What should it ask about rather than assume?',
    hint: 'Names the areas where a wrong guess that compiles is expensive.',
  },
  {
    id: 'style',
    label: 'Any house style rules?',
    hint: 'Copy rules, comment style, naming. Small, and constantly violated without it.',
  },
] as const;

/** Hard coded for phase 1. Replaced by assemble.ts in phase 2. */
const SAMPLE_OUTPUT = `# Orchard

A scheduling tool for smallholder farms. Next.js App Router, TypeScript,
Postgres. Works offline in the field and syncs when it reconnects.

## Never

- Never call the model API from the browser. The key lives on the server.
- Never write to the schedule table without going through lib/schedule.ts.
- Never add a migration without a matching rollback.

## Looks wrong, is deliberate

- Dates are stored as plain strings, not timestamps. Field work is planned by
  day, and timezone conversion was moving tasks across midnight.
- The sync queue retries forever and never drops a write. Losing a day of
  field notes is worse than a queue that grows.

## Commands

npm run dev
npm run test
npm run build

## Where the reasoning lives

docs/ARCHITECTURE.md holds the decisions and what was rejected.

## Ask before assuming

Anything touching payouts, and anything that changes what a labourer sees.

## Style

Sentence case for headings. No abbreviations in identifiers.
`;

export default function Page() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.wordmark}>Agentfile</p>
        <p className={styles.tagline}>
          Answer a few questions about your project and get the context file
          your AI coding agent reads before it touches your code.
        </p>
      </header>

      <div className={styles.columns}>
        <section className={styles.form}>
          <p className={styles.paneLabel}>Your project</p>

          <div className={styles.field}>
            <label htmlFor="stack">Stack</label>
            <span className={styles.hint}>
              Prefills the commands and style answers. More stacks arrive in
              phase 4.
            </span>
            <select id="stack" disabled defaultValue="nextjs">
              <option value="nextjs">Next.js</option>
            </select>
          </div>

          {QUESTIONS.map((q) => (
            <div key={q.id} className={styles.field}>
              <label htmlFor={q.id}>{q.label}</label>
              <span className={styles.hint}>{q.hint}</span>
              <textarea id={q.id} disabled placeholder="Phase 2" />
            </div>
          ))}
        </section>

        <section className={styles.preview}>
          <p className={styles.paneLabel}>AGENTS.md</p>
          <pre className={styles.output}>{SAMPLE_OUTPUT}</pre>
          <p className={styles.note}>
            Sample output, hard coded for now. Phase 2 builds this from your
            answers as you type.
          </p>
        </section>
      </div>
    </div>
  );
}
