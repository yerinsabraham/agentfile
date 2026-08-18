# Adding a stack

Agentfile writes the context file an AI coding agent reads before it touches
your code. Each stack it supports is **one markdown file**.

Adding a new one takes about twenty minutes, and you do not need to clone
anything, install anything, or run anything. Everything below happens in the
GitHub web editor.

If you have never opened a pull request before, this is a good first one.

---

## What a stack file does

The tool asks the user eight questions. Four of them only the author of a
project can answer, so a stack never touches those:

| Question | Who answers it |
| --- | --- |
| What is this project? | **Stack** starts it, user finishes it |
| What must never be done here? | User |
| What looks wrong but is deliberate? | User |
| What commands run, test and build it? | **Stack** |
| Where does the real reasoning live? | User |
| What should it ask about rather than assume? | User |
| Any house style rules? | **Stack** |
| What has to be re-run after certain changes? | **Stack**, if the stack has one |

So a stack file supplies up to four answers. Everything the user types stays
theirs.

---

## Step 1: copy an existing stack

Open [`templates/stacks/`](templates/stacks/) and read one of the files there.
`nextjs.md` is the shortest. `flutter.md` is the most complete.

Then click **Add file, Create new file**, and name it
`templates/stacks/your-stack.md`. Use lowercase with hyphens: `ruby-rails.md`,
`go-chi.md`, `laravel.md`.

---

## Step 2: write the sections

The file is plain markdown. Only the `##` headings matter, and only the four
listed below are read. Everything else in the file is ignored, so write as much
explanation for other contributors as you like.

````markdown
# Ruby on Rails

Prefills for the questions a stack can answer on the user's behalf. Everything
here is a starting point the user can edit or delete.

## what

Ruby on Rails, Postgres, Hotwire for the front end.

## commands

bin/rails server
bin/rails test
bin/rubocop

## rerun

After changing a model, run bin/rails db:migrate before anything will work.

After changing the Gemfile, run bundle install.

## style

Rubocop decides formatting, so do not argue with it.
Fat models, thin controllers.
Prefer a query object to a scope longer than one line.
````

### What makes each section good

**`what`** is one or two lines naming the technologies, not a sales pitch. The
user adds what their project actually does.

**`commands`** is the real commands, exactly as typed. The point is to stop an
agent inventing a script that does not exist, so copy them from a real project
rather than from memory.

**`rerun`** is the one people skip, and it is often the most valuable.

It is not a list of commands. It is **an obligation with a trigger**: something
that must happen after a particular kind of change, or nothing will work. Code
generators, database migrations, lockfiles. Write the trigger, then the
command:

> After editing anything annotated with freezed, run the generator before the
> project will compile.

not

> dart run build_runner build

An agent reads a bare command as optional tooling. It reads a trigger as a
rule. If your stack has no such step, leave the section out entirely and it
will not appear in the output.

**`style`** is the small rules that get violated constantly without being
written down. Naming, file size, what the formatter already decides for you.
Three to five lines. If you are writing a style guide, it is too long.

### House style

No em dashes and no en dashes anywhere a user will read. Commas and full stops
do the job.

---

## Step 3: list it in the registry

Open [`templates/index.ts`](templates/index.ts) and add two lines to
`STACK_TEMPLATES`:

```ts
{ id: 'ruby-rails', name: 'Ruby on Rails', source: load('stacks', 'ruby-rails.md') },
```

`id` matches your filename without `.md`. `name` is what appears in the
dropdown.

That is the whole change. If you list a file that is not there, or misspell the
name, the build fails and tells you which file it could not find, so you cannot
get this half right without noticing.

---

## Step 4: open the pull request

Click **Propose changes**, then **Create pull request**. Fill in the template
that appears.

You do not need to run anything. The checks run automatically and will tell you
if the file could not be read.

---

## Checklist

- [ ] File is at `templates/stacks/<name>.md`, lowercase with hyphens
- [ ] It has `## what`, `## commands` and `## style`
- [ ] It has `## rerun` if the stack has a step with a trigger, and no empty
      `## rerun` if it does not
- [ ] `rerun` says what triggers it, not just the command
- [ ] Commands are copied from a real project, not remembered
- [ ] Two lines added to `templates/index.ts`
- [ ] No em dashes or en dashes

---

## Running it locally, if you want to

You do not need this to contribute. It is here for people who want to see the
change before opening the pull request.

```bash
npm install
npm run dev
```

That is the only command. No database, no API key, no accounts, nothing to
configure. Open http://localhost:3000 and pick your stack from the dropdown.

```bash
npm test        # the assembly tests
npm run build   # what the checks run
```

---

## Questions worth asking

**Can I add a stack that is very close to an existing one?** Yes, if the
answers genuinely differ. Express and Fastify deserve separate files. Two
flavours of the same framework probably do not.

**My stack has ten commands. Is that fine?** Check whether some of them belong
in `rerun` instead. That distinction is the reason the section exists.

**Can I change the questions?** Not in a stack pull request. The question set is
the product and it changes deliberately. Open an issue and say which real
mistake the missing question would have caught.
