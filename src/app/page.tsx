import { BASE, STACK_TEMPLATES } from '@templates';

import Builder from './Builder';
import { parseStackPrefills, type Stack } from '@/lib/assemble';

import styles from './page.module.css';

/**
 * Phase 3. PROJECT.md §5.
 *
 * A Server Component, which here means "runs once at build time". It reads the
 * registry, parses each stack template, and hands the results to the browser
 * as props. There is no request-time code: with output: 'export' this function
 * runs during `next build` and never again.
 *
 * Deleting a template listed in templates/index.ts fails the build right here,
 * which is the whole point of this phase.
 */
export default function Page() {
  const stacks: Stack[] = STACK_TEMPLATES.map((template) => ({
    id: template.id,
    name: template.name,
    prefill: parseStackPrefills(template.source),
  }));

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

      <Builder base={BASE} stacks={stacks} />
    </div>
  );
}
