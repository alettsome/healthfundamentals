// checkChapter1.js
// Dedicated script to check only Chapter 1 against the canonical chapter template

const path = require('path');
const {
  checkChapter,
  printChapterReport,
  getTemplateSpec,
  buildSummary,
  writeSummaryFile,
  chapter1SummaryPath
} = require('./checkChapters');

const chapter1Path = path.join(__dirname, 'Chapters', 'Chapter 1', 'Chapter1Draft.md');

function main() {
  const templateSpec = getTemplateSpec();
  const result = checkChapter(chapter1Path);

  console.log(`Checking Chapter 1 against ${path.basename(templateSpec.templatePath)}...`);
  const hasIssues = printChapterReport(result);
  const summary = buildSummary('chapter1', [{ result, hasIssues }]);
  writeSummaryFile(chapter1SummaryPath, summary);
  console.log(`Machine-readable summary written to ${path.relative(__dirname, chapter1SummaryPath)}.`);
  console.log('\nCheck complete for Chapter 1.');
}

if (require.main === module) {
  main();
}

module.exports = { main };
