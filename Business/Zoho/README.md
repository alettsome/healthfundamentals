# Zoho Project Files

This folder now has three useful files:

- `tasks.json`
- `zoho-project-tasks.csv`
- `TaskList.md`

## What Each File Is For

### `tasks.json`

This is the editable source file.
If we add, remove, or change tasks, we do it here first.

### `zoho-project-tasks.csv`

This is the generated import file for Zoho Projects.
Do not edit this by hand unless you have to.

### `TaskList.md`

This is the plain-English task list.
It is meant to be easier to read while you are tracking the project.

## How To Update The CSV

1. Edit `tasks.json`
2. Run `npm.cmd run zoho:export`
3. The CSV file is regenerated automatically

## Why This Setup Helps

- the JSON file keeps one clean source of truth
- the CSV stays ready for Zoho import
- the Markdown file stays readable for day-to-day tracking
