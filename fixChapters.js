const fs = require('fs');
const path = require('path');

const chaptersDir = path.join(__dirname, 'Chapters');

function splitLines(content) {
  return content.split(/\r?\n/);
}

function isSectionHeading(line) {
  return /^##+\s+.+/.test(line.trim());
}

function isSceneBreak(line) {
  return line.trim() === '***';
}

function getChapterFiles() {
  return fs.readdirSync(chaptersDir).flatMap((entry) => {
    const entryPath = path.join(chaptersDir, entry);
    if (fs.statSync(entryPath).isDirectory()) {
      return fs.readdirSync(entryPath)
        .filter((file) => file.endsWith('.md'))
        .map((file) => path.join(entryPath, file));
    }
    if (entry.endsWith('.md')) {
      return [entryPath];
    }
    return [];
  });
}

function parseArgs(argv) {
  let write = false;
  let chapter = null;
  let file = null;

  argv.forEach((arg) => {
    if (arg === '--write') {
      write = true;
    } else if (arg.startsWith('--chapter=')) {
      chapter = arg.slice('--chapter='.length);
    } else if (arg.startsWith('--file=')) {
      file = path.resolve(__dirname, arg.slice('--file='.length));
    }
  });

  return { write, chapter, file };
}

function matchesChapter(filePath, chapter) {
  if (!chapter) {
    return true;
  }
  const normalized = chapter.toLowerCase();
  return filePath.toLowerCase().includes(`chapter ${normalized}`) ||
    path.basename(filePath).toLowerCase().includes(`chapter${normalized}`);
}

function selectFiles(options) {
  if (options.file) {
    return [options.file];
  }
  return getChapterFiles().filter((filePath) => matchesChapter(filePath, options.chapter));
}

function normalizeManuscriptSpacing(content) {
  const lines = splitLines(content).map((line) => line.replace(/[ \t]+$/g, ''));
  const output = [];
  let pendingBlankLine = false;
  let forceBlankBeforeNextContent = false;

  function pushBlankLine() {
    if (output.length > 0 && output[output.length - 1] !== '') {
      output.push('');
    }
  }

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (trimmed === '') {
      if (output.length > 0) {
        pendingBlankLine = true;
      }
      return;
    }

    if (isSceneBreak(line)) {
      pushBlankLine();
      output.push('***');
      pendingBlankLine = false;
      forceBlankBeforeNextContent = true;
      return;
    }

    if (pendingBlankLine || forceBlankBeforeNextContent) {
      pushBlankLine();
    }

    output.push(line);
    pendingBlankLine = false;
    forceBlankBeforeNextContent = isSectionHeading(line);
  });

  while (output.length > 0 && output[output.length - 1] === '') {
    output.pop();
  }

  return `${output.join('\n')}\n`;
}

function describeChange(before, after) {
  const beforeLines = splitLines(before);
  const afterLines = splitLines(after);
  const beforeTrailingSpaces = beforeLines.filter((line) => /[ \t]+$/.test(line)).length;
  const afterTrailingSpaces = afterLines.filter((line) => /[ \t]+$/.test(line)).length;
  const changed = before !== after;

  return {
    changed,
    trailingSpacesRemoved: Math.max(0, beforeTrailingSpaces - afterTrailingSpaces)
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const files = selectFiles(options);

  if (files.length === 0) {
    console.log('No chapter files matched the requested target.');
    return;
  }

  console.log(options.write
    ? 'Applying manuscript spacing fixes...'
    : 'Previewing manuscript spacing fixes (dry run)...');

  let changedFiles = 0;
  files.forEach((filePath) => {
    const original = fs.readFileSync(filePath, 'utf8');
    const normalized = normalizeManuscriptSpacing(original);
    const summary = describeChange(original, normalized);

    if (!summary.changed) {
      console.log(`\n${path.basename(filePath)}: no spacing changes needed.`);
      return;
    }

    changedFiles++;
    if (options.write) {
      fs.writeFileSync(filePath, normalized, 'utf8');
    }

    console.log(`\n${path.basename(filePath)}: spacing normalized${options.write ? '' : ' (not written)'}.`);
    if (summary.trailingSpacesRemoved > 0) {
      console.log(`  Trailing spaces removed: ${summary.trailingSpacesRemoved}`);
    }
  });

  console.log(`\n${options.write ? 'Updated' : 'Would update'} ${changedFiles} file(s).`);
}

if (require.main === module) {
  main();
}

module.exports = {
  normalizeManuscriptSpacing
};
