# Agentfile

**Working name.** Must be decided before the repo goes public.

A browser tool that writes the context file an AI coding agent reads before it
touches your code. You answer a short set of questions, it gives you a finished
`AGENTS.md` and a `CLAUDE.md` you paste into your repo.

This file is the plan. Code is written against it and comments point back at
the section they came from. Nothing structural changes without this changing
first.

> **Revision 2.** A review of revision 1 found five contradictions and one
> undecided core. All are resolved below, and the resolutions are marked
> **[r2]** so the reasoning survives. Revision 1 said the server renders the
> page *and* that the app is statically exported, which are two different
> architectures.

---

## 1 · Why this project and not another

It is the project built on camera in the free course, so it is chosen for what
it teaches. Four constraints decided it:

**It must run with `npm run dev` and nothing else.** No database, no API key,
no Docker, no queue, no auth. Every service a beginner installs before seeing
a result is where the free course loses them. Simbai is a better product and
needs Postgres, Inngest, next-auth and Blob storage before printing a word,
which is why it is the paid course's project.

**It must cost nothing to run, forever.** Anything calling a model API at
runtime bills the learner for using the thing they built. That kills
contribution: nobody funds someone else's demo.

**Contributing must mean adding one file.** People who finish the course make
their first pull request here. A contribution is one markdown file in
`templates/stacks/`, which a beginner can do in the GitHub web editor without
cloning.

**It must be the thing the course already promised.** Lesson 3 hands out
`AGENTS.md` and `CLAUDE.md` templates. This generates them. The tool built on
camera is the resource the course gives away.

### Non-goals

- No accounts, no saved projects, no history. Nothing is stored anywhere.
- No model calls. Not in demo mode, not with a key, not ever.
- No backend. No API routes, no server actions, no request-time code.

---

## 2 · What it does

1. Visitor picks a stack from the registry.
2. Visitor answers the question set below.
3. The page assembles the file in the browser, live, as they type.
4. They copy it, or download both files.

**[r2] Where the work happens.** The app is prerendered at build time and is
pure client after that. There is no server at request time. Template markdown
is inlined into the bundle during the build, so `assemble.ts` is a browser
function taking strings already in memory. Revision 1 left this undecided while
asserting both architectures.

### [r2] The question set

The review was right that this is the product and that revision 1 gave three
examples instead of a list. It is not invented here: it is taken from a context
file already in daily use, `creovine-academy/CLAUDE.md`, which has survived
months of real work. Each question earns its place by having caught a real
mistake.

| # | Question | Why it is asked |
| --- | --- | --- |
| 1 | What is this project, in two sentences? | Without it the agent infers purpose from file names and gets it wrong. |
| 2 | What must never be done here? | The override rules. Phrased as prohibitions because "prefer X" gets negotiated away and "never X" does not. |
| 3 | What looks wrong but is deliberate? | **The highest value question and the one nobody includes.** Every codebase has decisions that read as bugs. Without this the agent helpfully undoes them. |
| 4 | What commands run, test and build it? | Stops the agent inventing a script that does not exist. |
| 5 | Where does the real reasoning live? | Points at the docs, so the agent reads them instead of guessing. |
| 6 | What should it ask about rather than assume? | Names the areas where a wrong guess that compiles is expensive. |
| 7 | Any house style rules? | Copy rules, comment style, naming. Small, constantly violated without it. |

Questions 1, 4 and 7 are prefilled per stack. 2, 3, 5 and 6 are the user's.

### [r2] One file or two

It emits **both**: `AGENTS.md` carrying the content, and a one line `CLAUDE.md`
pointing at it. That is the current convention, it is what this repo does, and
a single file duplicated under two names drifts the first time somebody edits
one. The tool teaches the pattern by producing it.

---

## 3 · Decisions

| Decision | Why |
| --- | --- |
| Next.js App Router, TypeScript | Same stack as the academy. The course reuses knowledge across lessons. |
| No database | There is nothing to store. State lives in the form. |
| **[r2] Static export, `output: 'export'`** | Not for Vercel, which needs no such thing. It is there to make the "no backend" non-goal **structural instead of aspirational**, and it lets a fork deploy to GitHub Pages, Netlify or any dumb host. Capability is being removed on purpose. **[r3] What it actually guarantees:** no request-time server code. It was tested by adding a throwaway API route, and the build failed as designed, but the error names an escape hatch: a route marked `export const dynamic = "force-static"` still builds. That is fine, because such a route runs at build time and not per request, which is exactly the rule §1 wants. The guarantee is narrower than "nothing under `app/api/`" and it is the correct one. |
| Templates are `.md` files on disk | A contributor edits markdown in the GitHub web editor and opens a pull request without cloning. Lowest possible barrier to a first contribution. |
| **[r2] `templates/index.ts` is the only registry** | Revision 1 had `lib/registry.ts` reading `templates/index.ts`, so the registry read the registry. There is now one file. It statically imports every template and exports them as typed data. |
| **[r3] A missing template fails the build, during prerender** | Revision 1 promised this with no mechanism. Revision 2 named static imports as the mechanism, which does not exist in this stack: Next.js cannot import a `.md` file as a string without a loader, and a loader is a dependency §1 does not want. So `templates/index.ts` reads the files with `readFileSync` at module scope, imported by a Server Component. Under `output: 'export'` that runs once at build and never at request time, so the no-backend rule still holds. Delete a template and `next build` fails, naming the file and both valid fixes. The guarantee §3 actually wanted was "no check script to remember"; that is met. Only the timing moved, from compile to prerender. |
| Copy button and download, no share link | A share link needs storage, which needs a backend, which breaks a non-goal. |

### [r2] Stack three stays Flutter, deliberately

The review argued for Node or Django as closer to the audience. Rejected, with
a reason. Slot three exists to prove the template shape survives leaving the
web entirely, and Node or Express is close enough to Next.js that it proves
nothing. Flutter is also the stack the author has shipped most, so the template
is written from experience rather than research. If it turns out to strain the
shape, that is a finding worth having early, and it is one lesson of the course.

---

## 4 · Shape

```
templates/
  index.ts                 the registry: static imports, typed, build-checked
  base.md                  skeleton every output starts from
  stacks/nextjs.md
  stacks/python-fastapi.md
  stacks/flutter.md
src/
  app/page.tsx             the single screen, client component
  lib/assemble.ts          answers + templates -> the two output files
  lib/questions.ts         the question set from §2
```

One screen. Form left, live preview right. No `lib/registry.ts`: §3 explains
why it is gone.

---

## 5 · Build order

Each phase ends with something running in a browser. Nothing starts while the
previous phase is broken.

1. **Skeleton.** Next.js app with `output: 'export'`, one page, hard-coded
   output, deployed. Proves the constraint before anything is built on it.
2. **Questions and assembly.** `questions.ts` and `assemble.ts`. Preview
   updates as you type. Still one hard-coded stack.
3. **Registry.** Templates move to disk, `index.ts` imports them. Delete a file
   and confirm the build fails. That check is the phase.
4. **Three stacks.** Next.js, Python FastAPI, Flutter.
5. **Copy and download.** Both files. The two buttons that make it useful.
6. **Contribution path.** `CONTRIBUTING.md` and a pull request template.

Phases 1 to 5 are the free course. Phase 6 is the call to action in lesson 5.

---

## 6 · Rules the agent must follow

- **Read this file first.** If a request contradicts it, say so and stop.
- **No new dependency without adding the reason here first.** A beginner should
  read `package.json` and recognise every line.
- **Comments name their section**, so the next person finds the reason instead
  of deleting the rule.
- **One phase at a time.**
- **No em dashes or en dashes** in templates, interface copy, or generated
  output.
- **Write `NOTES.md` while things are broken**, not afterwards. The review was
  right: notes written after the fact lose the mistakes, and the mistakes are
  what the course is made of.

---

## 7 · Done, for the free course

- Public URL, free tier, no environment variables.
- Public repo, `CONTRIBUTING.md`, three stack templates.
- Somebody who finished lesson 5 adds a fourth stack in under thirty minutes
  without cloning.

## 8 · Still open, for the author only

**The name.** `agentfile` is free on both GitHub and npm and is recommended:
every developer already reads `Dockerfile` and knows what a file named for its
tool contains. Everything else here is decided.
