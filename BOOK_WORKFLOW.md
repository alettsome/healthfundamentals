# Book Workflow

Use this project as if it has two kinds of tools:

1. `check`
   Reviews chapters and reports structure or formatting issues.

2. `fix`
   Applies spacing-only cleanup for manuscript formatting.

What "without rewriting prose content" means:

- The fixer changes spacing and layout only.
- It does not intentionally rewrite your sentences, tone, dialogue, ideas, or facts.
- It can trim trailing spaces, collapse repeated blank lines, and add a blank line after headings.
- It does not try to reword the book.

Recommended commands:

```powershell
npm run book:check:chapter1
npm run book:fix:chapter1:dry
npm run book:fix:chapter1
```

For the whole manuscript:

```powershell
npm run book:check:all
npm run book:fix:all:dry
npm run book:fix:all
```

What each one does:

- `book:check:chapter1`
  Reviews Chapter 1 only.
  Writes `Reports/book-check-chapter1-summary.json`.

- `book:fix:chapter1:dry`
  Shows whether Chapter 1 would be changed, but does not write to disk.

- `book:fix:chapter1`
  Applies spacing cleanup to Chapter 1.

- `book:check:all`
  Reviews all chapter drafts.
  Writes `Reports/book-check-summary.json`.

- `book:fix:all:dry`
  Shows which chapter drafts would be changed, but does not write to disk.

- `book:fix:all`
  Applies spacing cleanup to all chapter drafts.

Current manuscript-focused spacing rules:

- One blank line after headings like `## Water`
- One blank line between normal paragraphs and blocks
- No `2+` blank-line gaps in normal prose
- `***` allowed as an intentional scene break
- No trailing spaces

Template alignment notes:

- The canonical structure now lives in `WritingStyle/ChapterTemplate-v2.md`
- A chapter should include `Introduction`
- One or more chapter-specific core `##` sections should follow
- Then `Integration: The Missing Link`
- Then one or more practical `###` subsections
- Then `Your Personal Food Swap Plan`
- Then a recommended closing section such as `Conclusion`, `Ending Summary`, `Closing Reflection`, or `Key Takeaways`
- `References` or `Notes` are optional

Simple workflow:

1. Run `npm run book:check:chapter1`
2. If the problems are spacing-only, run `npm run book:fix:chapter1:dry`
3. If the preview looks right, run `npm run book:fix:chapter1`
4. Re-run `npm run book:check:chapter1`
5. After Chapter 1 looks good, repeat with `all`

Machine-readable outputs:

- `Reports/book-check-chapter1-summary.json`
  JSON summary for the Chapter 1 check.

- `Reports/book-check-summary.json`
  JSON summary for the all-chapters check.
