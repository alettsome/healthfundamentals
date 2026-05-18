const { spawnSync } = require('child_process');
const path = require('path');

const root = __dirname;

function runNodeScript(scriptName, args = []) {
  const scriptPath = path.join(root, scriptName);
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: root,
    stdio: 'inherit'
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    process.exit(result.status);
  }
}

function printHelp() {
  console.log(`Book workflow commands:

  node bookWorkflow.js check chapter1
  node bookWorkflow.js check all
  node bookWorkflow.js fix chapter1 --dry
  node bookWorkflow.js fix chapter1 --write
  node bookWorkflow.js fix all --dry
  node bookWorkflow.js fix all --write

What each command does:
  check chapter1   Review Chapter 1 structure and formatting
  check all        Review all chapter drafts
  fix ... --dry    Preview spacing-only fixes without changing files
  fix ... --write  Apply spacing-only fixes to files
`);
}

function main() {
  const [, , action, scope, mode] = process.argv;

  if (!action || action === '--help' || action === '-h') {
    printHelp();
    return;
  }

  if (action === 'check') {
    if (scope === 'chapter1') {
      runNodeScript('checkChapter1.js');
      return;
    }
    if (scope === 'all') {
      runNodeScript('checkChapters.js');
      return;
    }
  }

  if (action === 'fix') {
    const write = mode === '--write';
    const args = [];
    if (scope === 'chapter1') {
      args.push('--chapter=1');
    } else if (scope !== 'all') {
      printHelp();
      process.exit(1);
    }

    if (write) {
      args.push('--write');
    }

    runNodeScript('fixChapters.js', args);
    return;
  }

  printHelp();
  process.exit(1);
}

if (require.main === module) {
  main();
}
