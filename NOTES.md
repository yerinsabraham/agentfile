# Build notes

Raw material for the course script. Written while building, not after.

For each phase record: what was asked, what came back, what was wrong, what
had to be said to fix it. The mistakes are the valuable part. A build where
nothing went wrong teaches nobody anything.

---

## Phase 0 · The plan, before any code

Not a build phase, but the most useful thing on camera so far.

**What was asked.** Read the plan and say what is unclear or contradictory,
what decisions were being left to the agent, and what it would do differently.
Explicitly: do not write code yet.

**What came back.** Five contradictions in revision 1, and one undecided core:

1. Static export and "the server renders the page" are two different
   architectures. The file asserted both.
2. Assembly was described as live in the browser, while templates were files
   on disk. Nothing said which side actually did the work.
3. The registry read the registry. `lib/registry.ts` was defined as reading
   `templates/index.ts`, which was itself defined as the registry.
4. "A missing template fails the build" was promised with no mechanism.
5. The question set, which is the entire product, was three examples rather
   than a list.

**What fixed it.** Revision 2, with every change marked `[r2]` so the reasoning
survives. The question set was not invented: it was lifted from a context file
already in daily use, which is why each question has a real mistake behind it.

**Two the author ruled against the agent, and was right both times.**

- *Static export stays.* The agent argued it was cost without benefit on
  Vercel. The real reason is not the host: static export makes the "no backend"
  rule **structural**. An API route stops being a thing you promise not to add
  and becomes a thing that fails the build. Proved below.
- *Flutter stays as stack three.* The agent argued for Node as closer to the
  audience. That is exactly why it is wrong. Slot three exists to prove the
  template shape survives leaving the web, and Node is close enough to Next.js
  to prove nothing.

**Worth showing on camera.** Yes, this is the lesson. Two of the agent's
recommendations were confidently argued and wrong, and the plan was better for
overruling them. An agent that is never overruled is not being used properly.

---

## Phase 1 · Skeleton

**What was asked.** Next.js App Router, TypeScript, `output: 'export'`, one
page with hard coded output. Confirm `npm run build` succeeds. Stop there.

**What was produced.** Scaffold, `next.config.ts` with the export setting, one
screen with the form on the left and a hard coded `AGENTS.md` on the right.
Build passes, lint clean, both routes prerendered, `out/` written.

### What was wrong, or nearly went wrong

**Tailwind was not added, and that was a judgment call.** `create-next-app`
offers it and almost every tutorial takes it. PROJECT.md §6 says no new
dependency without writing the reason down first, and Tailwind appears nowhere
in the plan. So the flag was `--no-tailwind` and the styling is plain CSS. The
dependency list is now `next`, `react`, `react-dom` plus types, eslint and
typescript, which a beginner can read line by line as §1 intends. If Tailwind
is wanted it is a §3 entry first, then a change.

*Worth showing on camera:* yes. This is the rule doing work. The agent wanted
Tailwind, the plan said no, and the plan won without anyone having to argue.

**The plan calls page.tsx a client component. It is not one yet.** §4 describes
the finished shape, where the preview responds as you type. In phase 1 there is
no state, and a `use client` holding nothing is noise. Left as a server
component with a comment saying when it changes. Flagged rather than silently
deviating.

**The scaffold could not be created in place.** The target folder already held
the four plan files, so it was built in `/tmp` and copied in. Not a real
problem, but it is the kind of thing that stops a beginner cold.

### The constraint test, which is the actual point of this phase

§5 says phase 1 "proves the constraint before anything is built on it." So it
was proved rather than assumed. A throwaway API route was added:

```
src/app/api/probe/route.ts
```

`npm run build` failed:

```
Error: export const dynamic = "force-static"/export const revalidate not
configured on route "/api/probe" with "output: export"
Build error occurred
Error: Failed to collect page data for /api/probe
```

The route was then deleted and the build passes again.

**The nuance, which matters and is not in the plan.** The error names a way
out. A route that sets `export const dynamic = "force-static"` builds fine,
because it runs at build time and not per request. So the guarantee is not
"nothing can live under `app/api/`". It is stronger where it counts and weaker
than the words suggest:

> Static export blocks **request time server code**. It does not block a file
> in the api folder that runs during the build.

That is still the guarantee the project wants, since the non-goal in §1 is a
backend, not a directory name. But the sentence in §3 is looser than the
behaviour, and someone will eventually notice on camera. Worth a one line
correction in §3 next time it is touched.

*Worth showing on camera:* yes, strongly. The agent claimed the constraint
works, then tested it, then found the exception. Claiming, testing and being
partly wrong is a better teaching moment than being right.

### Commands that were run

```bash
npx create-next-app@latest agentfile-scaffold \
  --typescript --eslint --app --src-dir --no-tailwind \
  --import-alias "@/*" --use-npm --no-turbopack --yes

npm run lint
npm run build
```

### State at the end of phase 1

- `npm run dev` is the only command needed to see it.
- `npm run build` succeeds and writes `out/`.
- No database, no key, no env vars, no backend.
- Not deployed yet. §5 phase 1 says "deployed", and that step is outstanding.
