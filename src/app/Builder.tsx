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
 * the app. Questions 1, 4, 7 and 8 belong to the stack and are expected to
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

/**
 * §5 phase 5. Both files, copy and download.
 *
 * A Blob and an anchor, no dependency. §1 says a beginner should recognise
 * every line of package.json, and a file-saver library would be one more line
 * to explain for something the platform already does.
 */
function downloadFile(filename: string, content: string) {
  const url = URL.createObjectURL(
    new Blob([content], { type: 'text/markdown;charset=utf-8' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function FileBlock({
  filename,
  content,
  copied,
  onCopy,
}: {
  filename: string;
  content: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className={styles.fileBlock}>
      <div className={styles.fileHead}>
        <p className={styles.paneLabel}>{filename}</p>
        <div className={styles.actions}>
          <button type="button" onClick={onCopy} className={styles.action}>
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={() => downloadFile(filename, content)}
            className={styles.action}
          >
            Download
          </button>
        </div>
      </div>
      <pre className={styles.output}>{content}</pre>
    </div>
  );
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
  const [copied, setCopied] = useState<string | null>(null);

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

  async function copy(filename: string, content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(filename);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard access can be refused. Say so rather than showing "Copied"
      // for something that did not copy.
      setCopied(`${filename}:failed`);
      setTimeout(() => setCopied(null), 3000);
    }
  }

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
            Fills in the answers a stack can know. Switching stack replaces
            those and leaves your own answers alone.
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
              {/* Only badge it when this stack actually supplied something.
                  Question 8 is prefilled for Flutter and empty for the other
                  two, and claiming otherwise would be a small lie. */}
              {stack.prefill[q.id] && (
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
          <FileBlock
            filename="AGENTS.md"
            content={files.agents}
            copied={copied === 'AGENTS.md'}
            onCopy={() => copy('AGENTS.md', files.agents)}
          />
          <FileBlock
            filename="CLAUDE.md"
            content={files.claude}
            copied={copied === 'CLAUDE.md'}
            onCopy={() => copy('CLAUDE.md', files.claude)}
          />
          {copied?.endsWith(':failed') && (
            <p className={styles.note}>
              Your browser refused clipboard access. Select the text and copy
              it, or use Download.
            </p>
          )}
          <p className={styles.note}>
            Two files, not one copied twice. AGENTS.md holds everything and
            CLAUDE.md points at it, so editing one cannot leave the other
            stale. Put both in the root of your repo.
          </p>
        </div>
      </section>
    </div>
  );
}
