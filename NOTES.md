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

---

## Phase 1 · Closed

Pushed to `github.com/yerinsabraham/agentfile`, deployed at
**https://agentfile.vercel.app**. §5 phase 1 says "deployed", so it was not
closed until that was true.

**What was wrong.** The first push to Simbai earlier had failed with a 403,
and the cause was the same class of problem here: two GitHub accounts
authenticated on the machine, and the active one was not the account that owns
the repo. `gh auth switch --user yerinsabraham` fixed it. Worth showing,
because the error message says "permission denied" and sends people looking
for a permissions problem that does not exist.

**Verified rather than assumed.** After deploying, `/api/anything` returns a
static 404. There is no server behind the site, which is the whole claim §3
makes.

---

## Phase 2 · Questions and assembly

**What was asked.** `questions.ts` and `assemble.ts`, live preview as you
type, one hard-coded stack. Stop there.

**What was produced.** The seven questions as typed data, an assembly function
that turns answers into `AGENTS.md` plus a one line `CLAUDE.md`, and the page
turned into a client component with the preview recomputing on every
keystroke. Build passes, lint clean.

### What was wrong

**The agent wrote a parameter for a phase that had not happened.** `assemble()`
was given a `stack` argument it never read. ESLint caught it:

```
62:3  warning  'stack' is defined but never used  @typescript-eslint/no-unused-vars
```

The reasoning behind the mistake was "phase 3 will need the stack when
templates move to disk". That is designing for a hypothetical, and it was
wrong for a concrete reason: the stack seeds the *answers* through
`prefillAnswers`, so by the time assembly runs there is nothing stack-specific
left to know. The parameter was removed and a comment now says why it is
absent, so nobody adds it back.

*Worth showing on camera:* yes. A linter warning that looks like tidying is
actually the plan's "do not design for hypothetical future requirements"
enforcing itself, and it took four seconds rather than a code review.

**A decision the plan does not cover, flagged rather than assumed.** §2 [r2]
says CLAUDE.md is "a one line `CLAUDE.md` pointing at it" without saying what
that line is. This repo's own CLAUDE.md reads `CLAUDE.md -> AGENTS.md`, which
is descriptive. The generated one uses `@AGENTS.md`, which is the import
syntax Claude Code actually reads and acts on. Functional was chosen over
descriptive. If that is wrong it is a one line change, but it is a product
decision and it is recorded here rather than buried.

**Empty sections are omitted, not emitted.** A heading with nothing under it
reads to an agent as an instruction it failed to find, which is worse than the
section being absent. Verified in the build output: with no answer to "what
must never be done", `## Never` does not appear at all.

---

## Course moments

The three worth building lessons around, with what was actually said rather
than a summary of it.

### 1 · A fresh chat found sixteen problems in the plan

The architecture document was finished and looked good. It was pasted into a
brand new chat with no history and no context, and asked what was wrong with
it. Sixteen findings came back. The opening of the review was generous and the
substance was not:

> "Short version: this is a genuinely good architecture doc."

Then, second finding:

> "Prompt caching is not 'the biggest single cost lever in the system.' Your
> own table says so. Uncached: 104k input times $5 per million equals $0.52,
> 50k output times $25 per million equals $1.25. Output is 71% of the cost."

The document contradicted its own numbers table, and the chat that wrote it
had read that table a dozen times without noticing. A chat that has spent an
hour defending a set of choices cannot review them.

The findings were not accepted blindly either. They went back to the original
agent with:

> "Please let me know if all my reviews are valid, and update accordingly. If
> any review is not aligned or doesn't have enough context of what we're
> building, ignore it."

That last clause matters. Permission to reject is what makes the validation
real rather than performative. All sixteen held that time. They will not
always.

**The lesson:** review in a fresh chat, then make the original judge the
review. Costs nothing. Catches things no amount of re-reading will.

### 2 · The agent was overruled twice, and was wrong both times

On this project. The agent argued that static export was cost without benefit,
and that Flutter should be swapped for Node as closer to the audience. Both
were rejected, in these words:

> "Two I ruled against you, both now with reasons in the file. Static export
> stays, but not for Vercel: it makes the no-backend rule structural, so an API
> route fails the build. Flutter stays as stack three because Node is too close
> to Next.js to prove the shape generalises."

Both reasons are better than the agent's objections, and for the same underlying
reason: the agent was optimising the thing in front of it while the author was
optimising what the thing is for. Static export is not about hosting, it is
about making a rule enforceable by a machine instead of by discipline. Flutter
is not about audience size, it is about whether the template shape survives
leaving the web, and Node is too similar to test that.

**The lesson:** an agent that is never overruled is not being used properly.
It optimises locally and well. It does not know what the project is for unless
the plan tells it, and even then it will argue.

### 3 · "Done" was reported, and the main button did nothing

On the paid course project. The agent finished a build, reported success, and
the report back was five words:

> "done, generate project does nothing so far"

Two causes. One was configuration: a required flag was missing, so the
background job service registered zero functions and nothing ever executed.
The other was the agent's own bug, and it was the worse of the two: when the
button failed, the app displayed nothing at all. No error, no message, the
button simply sat there.

A broken app that says what is broken is a five minute fix. A broken app that
stays silent is an evening.

The fix was not just to make it work. It was to make failure explain itself: a
health check that verifies every external requirement and reports the exact
command that fixes each one, running on page load so problems appear before
anything is clicked.

**The lesson, in two parts.** "It does nothing" is a complete bug report and
you should hand it over without apologising for not knowing more. And never
trust "done" until you have clicked the thing yourself.

---

## Phase 3 · Registry

**What was asked.** Templates to disk. `templates/index.ts` as the only
registry with static typed imports. Then delete a template and show
`npm run build` failing. The failure is the phase, not a side effect of it.

**What was produced.** `templates/base.md` holds the skeleton and now owns the
section order and every heading, so changing the shape of the output means
editing markdown rather than TypeScript. `templates/stacks/nextjs.md` holds the
prefills. `templates/index.ts` lists both. The page split in two: a Server
Component that reads the registry at build time, and `Builder.tsx` holding the
state and the live preview.

### What was wrong

**The plan's mechanism does not exist in this stack.** §3 [r2] says a missing
template fails the build "via the import itself", using static imports of the
markdown. That was tested rather than assumed, and it does not work:

```
import probe from '../../templates/_probe.md?raw';
```

```
Error: Turbopack build failed with 1 error:
Error: Unknown module type
```

Next.js cannot import a `.md` file as a string without a loader, and the loader
is a new dependency. §6 forbids adding one without the reason going into
PROJECT.md first, so the agent stopped and said so instead of installing
`raw-loader` and carrying on.

**What was done instead.** `templates/index.ts` reads the files with
`readFileSync` at module scope, using static string literal paths. The module
is imported by a Server Component, which under `output: 'export'` runs once
during the build and never again, so no request-time code is introduced and the
no-backend rule holds.

**What changed and what did not.** The guarantee is the same: delete a listed
template and the build fails, loudly, naming the file. There is still no check
script to remember to run, which was the actual point of §3. What changed is
*when* it fails: during prerender rather than at compile. That is a real
difference in the plan's words and worth a decision, so it is flagged rather
than buried.

*Worth showing on camera:* yes, and it is the best moment in this phase. The
plan specified a mechanism, the mechanism turned out not to exist, and the
agent tested it, reported it, refused to install its way around a rule, and
proposed an alternative that keeps the guarantee. That is the behaviour the
rules in §6 exist to produce.

### The failure, exactly as it appears

`templates/stacks/nextjs.md` was deleted while still listed in the registry.
`npm run build`:

```
✓ Compiled successfully in 165ms
  Running TypeScript ...
  Finished TypeScript in 1645ms ...
  Collecting page data using 5 workers ...
Error: Failed to collect configuration for /
    at ignore-listed frames {
  [cause]: Error: Template missing: templates/stacks/nextjs.md
  It is listed in templates/index.ts but is not on disk. Either restore the file or remove its entry from the registry.
      at f (templates/index.ts:35:11)
      at module evaluation (templates/index.ts:60:44)
      at module evaluation (src/app/page.tsx:40:1)
    33 |     return readFileSync(path, 'utf8');
    34 |   } catch {
  > 35 |     throw new Error(
       |           ^
    36 |       `Template missing: templates/${segments.join('/')}\n` +

> Build error occurred
Error: Failed to collect page data for /
```

Three things worth pointing at in that output. It names the missing file. It
says where the file is listed. It gives both valid fixes, restore it or remove
the entry, so a contributor who deletes a stack by accident is not left
guessing. The file was restored and the build passes again.

### One thing verified rather than trusted

The prerendered HTML contains the string `## Never`, which looked at first like
an empty section being emitted with its heading, the exact bug the assembly is
supposed to prevent. It is not. The raw `base.md` travels to the browser as a
prop, so the unprocessed template with its `{{never}}` tokens appears in the
payload alongside the finished output.

Confirmed by running the assembly directly against the real files on disk:

```
--- prefills parsed: what, commands, style
--- assembled output ---
# Orchard

Next.js App Router, TypeScript.

## Commands

npm run dev
npm run lint
npm run build

## Style

Sentence case for headings.
No abbreviations in identifiers.
Comments say why, not what.
```

Four unanswered sections gone, each taking its heading with it. Prefills are
exactly questions 1, 4 and 7, as §2 says.

*Worth showing on camera:* yes, briefly. A grep on built output is a weak test,
and it produced a false alarm that took a real check to clear. Test the function,
not the HTML.

---

## Phase 4 · Three stacks

**What was asked.** Next.js, Python FastAPI and Flutter. Flutter last, and a
straight answer on whether it strains the template shape, because §3 says
finding that out early is worth a lesson.

**What was produced.** Two new stack templates, both registered, and the stack
selector enabled. Switching stack replaces the three stack-owned answers and
leaves the user's four alone, because losing an answer only the author could
have written, because somebody clicked a dropdown, would be the worst bug in
the app.

### Does Flutter strain the shape? Mechanically no, structurally yes

Mechanically it fits perfectly. All three stacks parse to exactly the same
three prefills, nothing missing, no unexpected sections:

```
nextjs          prefills: what, commands, style   command lines: 3
python-fastapi  prefills: what, commands, style   command lines: 4
flutter         prefills: what, commands, style   command lines: 7
```

The strain is in question 4, and it is real.

**Question 4 asks "what commands run, test and build it". That is three verbs,
and it is web-service shaped.** Flutter's answer has to carry seven lines, and
only three of them are a run, a test or a build:

```
flutter pub get                                            dependencies
flutter run                                                run
flutter test                                               test
flutter analyze                                            lint
dart run build_runner build --delete-conflicting-outputs   codegen
flutter build apk --release                                build, Android
flutter build ipa --release                                build, iOS
```

Two separate problems in that list.

**One, "build" is not a single command.** Next.js and FastAPI have one build or
none. Flutter has one per platform. The question's singular framing does not
fit, though this is mild: a list is still a list.

**Two, and this is the serious one, codegen has nowhere to live.**
`build_runner` is not a run, a test, or a build. It is a step that must happen
*after editing certain files and before anything will compile at all*. Edit a
freezed model, skip it, and nothing works. That is exactly the class of thing
an AGENTS.md exists to prevent, and question 4 gives it no home, so it gets
smuggled into a flat list of commands where an agent reads it as optional
tooling rather than as a mandatory step with a trigger condition.

### The finding generalises, which is why it matters

This is not a Flutter problem. Flutter only surfaced it because codegen is
unavoidable there. The same hole is open for `go generate`, for GraphQL
codegen, and for `prisma generate`, which means it is open on the **Next.js**
stack too. Nobody noticed, because a Next.js project can exist without Prisma
and a Flutter project cannot exist without build_runner.

So §3's bet paid off exactly as written. Slot three was chosen to prove the
shape survives leaving the web, and it did survive, while exposing a gap that
was always there and that the two web stacks were quietly hiding.

### What was not done about it

Nothing. §2 is the question set and it is structural, so §6 applies: say so and
stop. The gap is reported, not patched.

**The suggestion, for the author to accept or reject.** An eighth question:
*"What has to be re-run after certain edits, and what triggers it?"* It is the
smallest change that closes the hole, it is not Flutter-specific, and it covers
codegen, database migrations and lockfile regeneration in one. The alternatives
are to widen question 4's wording, to let stacks contribute an extra freeform
section, or to leave it and accept that contributors will cram it into
commands.

*Worth showing on camera:* yes, this is the payoff for a decision made three
revisions ago. The author chose the awkward third stack on purpose, against the
agent's recommendation, precisely so that a gap like this would show up while
the project was four files big instead of forty.
