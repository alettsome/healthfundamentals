# Git Workflow

This project now has its own local Git repository.

## Start here

Open PowerShell in:

```powershell
cd "C:\Users\alett\Documents\Projects\Healthfundamentals"
```

## Daily workflow

Check what changed:

```powershell
git status
```

See unstaged edits:

```powershell
git diff
```

See one file only:

```powershell
git diff -- "Chapters/Chapter 1/Chapter1Draft.md"
```

Stage one file:

```powershell
git add "Chapters/Chapter 1/Chapter1Draft.md"
```

Stage everything tracked and untracked in this repo:

```powershell
git add -A
```

Check what will be committed:

```powershell
git diff --staged
```

Create a commit:

```powershell
git commit -m "Refine chapter 1 section summaries"
```

## Useful safety commands

See recent commits:

```powershell
git log --oneline --decorate -10
```

Unstage a file without losing your edits:

```powershell
git restore --staged "Chapters/Chapter 1/Chapter1Draft.md"
```

Discard local edits to one file:

```powershell
git restore "Chapters/Chapter 1/Chapter1Draft.md"
```

Important:
Only use `git restore <file>` when you are sure you want to throw away the current uncommitted edits for that file.

## Good checkpoint habit

Before a large rewrite:

```powershell
git add -A
git diff --staged
git commit -m "Checkpoint before chapter rewrite"
```

## Current baseline

The first local baseline commit is:

```powershell
git log --oneline -1
```

At the time this note was added, that baseline commit was:

```text
f827382 Initial local baseline
```

## Ignored folders

These are intentionally not tracked in this repo:

- `Backups/`
- `.history/`
- `.lh/`
- `.vscode/`
- `node_modules/`

## Next step later

When you are ready, this local repo can be connected to an online remote without changing the basic workflow above.
