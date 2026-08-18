/**
 * The question set. PROJECT.md §2.
 *
 * Not invented here. Taken from a context file already in daily use, which is
 * why every question has a real mistake behind it rather than a guess about
 * what might be useful.
 *
 * Questions 1, 4 and 7 are prefilled from the chosen stack. 2, 3, 5 and 6 are
 * the user's, because nobody else can know them.
 */

export const QUESTION_IDS = [
  'what',
  'never',
  'deliberate',
  'commands',
  'docs',
  'ask',
  'style',
] as const;

export type QuestionId = (typeof QUESTION_IDS)[number];

export interface Question {
  id: QuestionId;
  /** The heading this answer becomes in the output file. */
  heading: string;
  label: string;
  hint: string;
  placeholder: string;
  /** §2: true means the stack supplies a starting value the user can edit. */
  prefilled: boolean;
  rows: number;
}

export const QUESTIONS: readonly Question[] = [
  {
    id: 'what',
    heading: '',
    label: 'What is this project, in two sentences?',
    hint: 'Without this the agent infers purpose from file names and gets it wrong.',
    placeholder:
      'A scheduling tool for smallholder farms. Works offline in the field and syncs when it reconnects.',
    prefilled: true,
    rows: 3,
  },
  {
    id: 'never',
    heading: 'Never',
    label: 'What must never be done here?',
    hint: 'Phrased as prohibitions. "Prefer X" gets negotiated away, "never X" does not.',
    placeholder:
      'Never call the model API from the browser.\nNever add a migration without a rollback.',
    prefilled: false,
    rows: 4,
  },
  {
    id: 'deliberate',
    heading: 'Looks wrong, is deliberate',
    label: 'What looks wrong but is deliberate?',
    hint: 'Every codebase has decisions that read as bugs. Without this the agent helpfully undoes them.',
    placeholder:
      'Dates are stored as strings, not timestamps. Timezone conversion was moving tasks across midnight.',
    prefilled: false,
    rows: 4,
  },
  {
    id: 'commands',
    heading: 'Commands',
    label: 'What commands run, test and build it?',
    hint: 'Stops the agent inventing a script that does not exist.',
    placeholder: 'npm run dev\nnpm run test\nnpm run build',
    prefilled: true,
    rows: 3,
  },
  {
    id: 'docs',
    heading: 'Where the reasoning lives',
    label: 'Where does the real reasoning live?',
    hint: 'Points at the docs, so the agent reads them instead of guessing.',
    placeholder: 'docs/ARCHITECTURE.md holds the decisions and what was rejected.',
    prefilled: false,
    rows: 2,
  },
  {
    id: 'ask',
    heading: 'Ask before assuming',
    label: 'What should it ask about rather than assume?',
    hint: 'Names the areas where a wrong guess that compiles is expensive.',
    placeholder: 'Anything touching payments, and anything that changes what a user sees.',
    prefilled: false,
    rows: 3,
  },
  {
    id: 'style',
    heading: 'Style',
    label: 'Any house style rules?',
    hint: 'Copy rules, comment style, naming. Small, and constantly violated without it.',
    placeholder: 'Sentence case for headings. No abbreviations in identifiers.',
    prefilled: true,
    rows: 3,
  },
];

export type Answers = Record<QuestionId, string>;

export const EMPTY_ANSWERS: Answers = Object.fromEntries(
  QUESTION_IDS.map((id) => [id, '']),
) as Answers;
