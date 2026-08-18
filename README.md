# Agentfile

**[agentfile.vercel.app](https://agentfile.vercel.app)**

Writes the context file an AI coding agent reads before it touches your code.

Answer eight questions about your project and get a finished `AGENTS.md` and
`CLAUDE.md` to paste into your repo. Nothing is stored, nothing is sent
anywhere, and there is no model call. The whole thing is assembled in your
browser.

## Why the questions are the way they are

An agent that has not been told what your project is will infer it from file
names and get it wrong. One that has not been told what looks deliberate will
helpfully undo it. The eight questions are not a survey, they are the eight
things that have actually caused a mistake often enough to be worth writing
down.

The most valuable one is the third: **what looks wrong but is deliberate.**
Almost nobody includes it, and every codebase has decisions that read as bugs.

The eighth exists because commands and obligations are different things.
`build_runner` and `prisma generate` are not things you run when you feel like
it, they are things that must happen after a particular change or nothing
compiles. An agent reads a bare command as optional. It reads a trigger as a
rule.

## Adding a stack

One markdown file, about twenty minutes, no cloning required. See
[CONTRIBUTING.md](CONTRIBUTING.md).

Currently supported: Next.js, Python FastAPI, Flutter.

## Running it

```bash
npm install
npm run dev
```

That is the only command. No database, no API key, no accounts, nothing to
configure.

```bash
npm test        # assembly tests, on node:test
npm run build   # static export to out/
npm run lint
```

## How it is built

- **No backend.** `output: 'export'` is set so that a server cannot be added
  quietly later. An API route with request-time code fails the build.
- **No dependencies beyond the framework.** `next`, `react`, `react-dom`, and
  that is the list. Tests run on Node's built-in test runner.
- **Templates are markdown on disk.** `templates/index.ts` lists them. Delete
  one and the build fails naming the file, so a broken registry cannot ship.

The plan this was built against is in [PROJECT.md](PROJECT.md), and the build
notes, including everything that went wrong, are in [NOTES.md](NOTES.md).
