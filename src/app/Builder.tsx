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

/**
 * Splits the finished file into its sections so a change can be shown in
 * place. A section starts at a heading and runs to the next one; the block
 * above the first heading is the title and the project description.
 *
 * The key is the heading line, not the index, so a section appearing or
 * disappearing does not make every section below it look changed.
 */
function toSections(file: string): { key: string; text: string }[] {
  return file
    .trimEnd()
    .split(/\n(?=## )/)
    .map((text, i) => ({
      key: text.startsWith('## ') ? text.split('\n')[0] : `title-${i}`,
      text,
    }));
}

function FileBlock({
  filename,
  content,
  copied,
  onCopy,
  children,
}: {
  filename: string;
  content: string;
  copied: boolean;
  onCopy: () => void;
  children: React.ReactNode;
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
      <pre className={styles.output}>{children}</pre>
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

  const sections = useMemo(() => toSections(files.agents), [files.agents]);

  /**
   * The change highlight.
   *
   * Derived during render rather than in an effect. Setting state inside an
   * effect here would schedule a second render after paint, which React 19
   * flags as a cascading render, and it would also mean the tint arrived one
   * frame late. Comparing against the previous value during render is the
   * documented way to do this: React discards the first pass and re-renders
   * immediately, before anything reaches the screen.
   *
   * A counter per section rather than a boolean, because bumping it changes
   * the React key, which remounts that span and replays the animation. With a
   * boolean, a section edited twice in a row would tint once and then sit
   * still, since the class never changed.
   */
  const current = useMemo(
    () => new Map(sections.map((s) => [s.key, s.text])),
    [sections],
  );
  const [seen, setSeen] = useState<Map<string, string> | null>(null);
  const [pulse, setPulse] = useState<Map<string, number>>(new Map());

  if (seen === null) {
    // First render. Seed it so the initial paint does not light up.
    setSeen(current);
  } else if (seen !== current) {
    const next = new Map(pulse);
    let changed = false;
    for (const [key, text] of current) {
      const before = seen.get(key);
      if (before === undefined || before !== text) {
        next.set(key, (next.get(key) ?? 0) + 1);
        changed = true;
      }
    }
    setSeen(current);
    if (changed) setPulse(next);
  }

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
          >
            {sections.map((s, i) => (
              <span
                key={`${s.key}:${pulse.get(s.key) ?? 0}`}
                className={`${styles.section} ${
                  pulse.has(s.key) ? styles.changed : ''
                }`}
              >
                {s.text}
                {i < sections.length - 1 ? '\n' : '\n'}
              </span>
            ))}
          </FileBlock>

          <FileBlock
            filename="CLAUDE.md"
            content={files.claude}
            copied={copied === 'CLAUDE.md'}
            onCopy={() => copy('CLAUDE.md', files.claude)}
          >
            {files.claude}
          </FileBlock>

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
