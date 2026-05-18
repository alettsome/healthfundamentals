// Script: checkChapters.js
// Purpose: Check all chapter markdown files for consistency with the canonical chapter template

const fs = require('fs');
const path = require('path');

const chaptersDir = path.join(__dirname, 'Chapters');
const templatePath = path.join(__dirname, 'WritingStyle', 'ChapterTemplate-v2.md');
const reportsDir = path.join(__dirname, 'Reports');
const allSummaryPath = path.join(reportsDir, 'book-check-summary.json');
const chapter1SummaryPath = path.join(reportsDir, 'book-check-chapter1-summary.json');

function getTemplateSpec() {
  return {
    templatePath,
    requiredAnchors: [
      'Introduction',
      'Integration: The Missing Link',
      'Your Personal Food Swap Plan'
    ],
    recommendedClosingHeadings: [
      'Conclusion',
      'Ending Summary',
      'Closing Reflection',
      'Key Takeaways'
    ],
    optionalReferenceHeadings: ['References', 'Notes', 'Sources']
  };
}

function getTemplateSections() {
  return getTemplateSpec().requiredAnchors;
}

function ensureReportsDir() {
  fs.mkdirSync(reportsDir, { recursive: true });
}

function splitLines(content) {
  return content.split(/\r?\n/);
}

function getMarkdownHeadings(content) {
  const matches = content.match(/^##+\s+.+/gm) || [];
  return matches.map((raw) => {
    const levelMatch = raw.match(/^(#+)\s+/);
    const level = levelMatch ? levelMatch[1].length : 0;
    return {
      raw,
      level,
      text: raw.replace(/^#+\s+/, '').trim()
    };
  });
}

function isMarkdownHeading(line) {
  return /^##+\s+.+/.test(line.trim());
}

function isSceneBreak(line) {
  return line.trim() === '***';
}

function checkSpacing(lines) {
  let multiBlankLineGaps = 0;
  let trailingSpaces = 0;
  let missingBlankLineAfterHeadings = 0;
  let sceneBreakSpacingIssues = 0;
  let blankRunLength = 0;

  function closeBlankRun() {
    if (blankRunLength >= 2) {
      multiBlankLineGaps++;
    }
    blankRunLength = 0;
  }

  lines.forEach((line, idx) => {
    if (/\s+$/.test(line)) trailingSpaces++;

    if (isMarkdownHeading(line)) {
      const nextLine = lines[idx + 1];
      if (nextLine !== undefined && nextLine.trim() !== '') {
        missingBlankLineAfterHeadings++;
      }
    }

    if (isSceneBreak(line)) {
      const prevLine = lines[idx - 1];
      const nextLine = lines[idx + 1];
      const missingBlankBefore = idx > 0 && prevLine.trim() !== '';
      const missingBlankAfter = idx < lines.length - 1 && nextLine.trim() !== '';
      if (missingBlankBefore || missingBlankAfter) {
        sceneBreakSpacingIssues++;
      }
    }

    if (line.trim() === '') {
      blankRunLength++;
    } else {
      closeBlankRun();
    }
  });
  closeBlankRun();

  return {
    multiBlankLineGaps,
    trailingSpaces,
    missingBlankLineAfterHeadings,
    sceneBreakSpacingIssues
  };
}

function getHeadingLineIndices(lines, headingObjects) {
  const headingLines = [];
  let searchStart = 0;

  headingObjects.forEach((heading) => {
    for (let i = searchStart; i < lines.length; i++) {
      if (lines[i].trim() === heading.raw.trim()) {
        headingLines.push(i);
        searchStart = i + 1;
        break;
      }
    }
  });

  return headingLines;
}

function getSectionWordCounts(content) {
  const headings = getMarkdownHeadings(content);
  const sections = [];
  let lastIdx = 0;

  headings.forEach((heading, i) => {
    const start = content.indexOf(heading.raw, lastIdx);
    const end = i + 1 < headings.length ? content.indexOf(headings[i + 1].raw, start + heading.raw.length) : content.length;
    const sectionText = content.slice(start + heading.raw.length, end);
    const wordCount = sectionText.split(/\s+/).filter(Boolean).length;
    sections.push({ heading: heading.text, wordCount });
    lastIdx = end;
  });

  return sections;
}

function isClosingHeading(text) {
  return /conclusion|ending summary|closing reflection|key takeaways/i.test(text);
}

function isReferencesHeading(text) {
  return /^(references|notes|sources)\b/i.test(text);
}

function isSpecialHeading(text) {
  return (
    text === 'Introduction' ||
    text === 'Integration: The Missing Link' ||
    text === 'Your Personal Food Swap Plan' ||
    isClosingHeading(text) ||
    isReferencesHeading(text)
  );
}

function checkNarrativeElements(sectionText) {
  const affirmation = /\*Affirmation:/i.test(sectionText);
  const hasJudy = /\bJudy\b/.test(sectionText);
  const hasAlex = /\bAlex\b/.test(sectionText);
  const hasNarrator = /\(Narrator(?:\s+Tip)?[:)]/i.test(sectionText);
  const innerVoiceMatches = sectionText.match(/\*(?!Affirmation:)[^*\r\n][^*\r\n]*\*/gi) || [];
  const hasInnerVoice = innerVoiceMatches.length > 0;

  return {
    affirmation,
    hasJudy,
    hasAlex,
    hasNarrator,
    hasInnerVoice,
    coverageCount: [affirmation, hasJudy, hasAlex, hasNarrator, hasInnerVoice].filter(Boolean).length
  };
}

function analyzeStructure(headings) {
  const h2Headings = headings.filter((heading) => heading.level === 2);
  const introIndex = h2Headings.findIndex((heading) => heading.text === 'Introduction');
  const integrationIndex = h2Headings.findIndex((heading) => heading.text === 'Integration: The Missing Link');
  const planIndex = h2Headings.findIndex((heading) => heading.text === 'Your Personal Food Swap Plan');
  const closingIndex = h2Headings.findIndex((heading) => isClosingHeading(heading.text));
  const referencesIndex = h2Headings.findIndex((heading) => isReferencesHeading(heading.text));

  const missingRequired = [];
  if (introIndex === -1) missingRequired.push('Introduction');
  if (integrationIndex === -1) missingRequired.push('Integration: The Missing Link');
  if (planIndex === -1) missingRequired.push('Your Personal Food Swap Plan');

  const orderIssues = [];
  if (introIndex !== -1 && integrationIndex !== -1 && introIndex > integrationIndex) {
    orderIssues.push('Introduction should appear before Integration: The Missing Link.');
  }
  if (integrationIndex !== -1 && planIndex !== -1 && integrationIndex > planIndex) {
    orderIssues.push('Integration: The Missing Link should appear before Your Personal Food Swap Plan.');
  }
  if (closingIndex !== -1 && planIndex !== -1 && closingIndex < planIndex) {
    orderIssues.push('The closing section should appear after Your Personal Food Swap Plan.');
  }
  if (referencesIndex !== -1 && integrationIndex !== -1 && referencesIndex < integrationIndex) {
    orderIssues.push('References or notes should appear near the end of the chapter.');
  }
  if (referencesIndex !== -1 && closingIndex !== -1 && referencesIndex < closingIndex) {
    orderIssues.push('References or notes should appear after the closing section.');
  }

  let mainTopicSections = [];
  if (introIndex !== -1 && integrationIndex !== -1 && integrationIndex > introIndex) {
    mainTopicSections = h2Headings.slice(introIndex + 1, integrationIndex);
  } else {
    mainTopicSections = h2Headings.filter((heading) => !isSpecialHeading(heading.text));
  }

  let practicalSubsections = [];
  const integrationHeading = headings.find((heading) => heading.level === 2 && heading.text === 'Integration: The Missing Link');
  const planHeading = headings.find((heading) => heading.level === 2 && heading.text === 'Your Personal Food Swap Plan');
  if (integrationHeading && planHeading && integrationHeading.position < planHeading.position) {
    practicalSubsections = headings.filter((heading) => {
      return (
        heading.level === 3 &&
        heading.position > integrationHeading.position &&
        heading.position < planHeading.position
      );
    });
  }

  const unexpectedH2AfterPlan = [];
  if (planIndex !== -1) {
    h2Headings.slice(planIndex + 1).forEach((heading) => {
      if (!isClosingHeading(heading.text) && !isReferencesHeading(heading.text)) {
        unexpectedH2AfterPlan.push(heading.text);
      }
    });
  }

  const recommendations = [];
  if (mainTopicSections.length === 0) {
    recommendations.push('Add one or more chapter-specific core sections between the Introduction and Integration.');
  }
  if (practicalSubsections.length === 0) {
    recommendations.push('Add at least one practical ### subsection between Integration and Your Personal Food Swap Plan.');
  }
  if (closingIndex === -1) {
    recommendations.push('Add a closing section such as Conclusion, Ending Summary, Closing Reflection, or Key Takeaways.');
  }

  return {
    introIndex,
    integrationIndex,
    planIndex,
    closingIndex,
    referencesIndex,
    missingRequired,
    orderIssues,
    mainTopicSections,
    practicalSubsections,
    unexpectedH2AfterPlan,
    closingHeading: closingIndex !== -1 ? h2Headings[closingIndex].text : null,
    referencesHeading: referencesIndex !== -1 ? h2Headings[referencesIndex].text : null,
    recommendations
  };
}

function classifySection(heading, structure, sectionIndex) {
  if (heading.level === 2) {
    if (heading.text === 'Introduction') return 'introduction';
    if (heading.text === 'Integration: The Missing Link') return 'integration';
    if (heading.text === 'Your Personal Food Swap Plan') return 'personal-plan';
    if (isClosingHeading(heading.text)) return 'closing';
    if (isReferencesHeading(heading.text)) return 'references';
    if (structure.mainTopicSections.some((item) => item.text === heading.text)) return 'main-topic';
    return 'other';
  }

  if (heading.level === 3) {
    if (structure.practicalSubsections.some((item) => item.text === heading.text && item.position === sectionIndex)) {
      return 'practical';
    }
  }

  return 'other';
}

function checkChapter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = splitLines(content);
  const headings = getMarkdownHeadings(content).map((heading, index) => ({
    ...heading,
    position: index
  }));
  const headingsRaw = headings.map((heading) => heading.raw);
  const headingLineIndices = getHeadingLineIndices(lines, headings);
  const spacing = checkSpacing(lines);
  const wordCounts = getSectionWordCounts(content);
  const structure = analyzeStructure(headings);

  const sectionDetails = headings.map((heading, i) => {
    const startLine = headingLineIndices[i];
    const endLine = i + 1 < headingLineIndices.length ? headingLineIndices[i + 1] : lines.length;
    const sectionLines = lines.slice(startLine, endLine);
    const sectionText = sectionLines.slice(1).join('\n');
    const narrative = checkNarrativeElements(sectionText);
    return {
      heading: heading.text,
      level: heading.level,
      kind: classifySection(heading, structure, heading.position),
      narrative,
      formatting: checkSpacing(sectionLines)
    };
  });

  const chapterNarrative = checkNarrativeElements(content);
  const chapterNarrativeMissing = [];
  if (!chapterNarrative.affirmation) chapterNarrativeMissing.push('affirmation');
  if (!chapterNarrative.hasJudy) chapterNarrativeMissing.push('Judy');
  if (!chapterNarrative.hasAlex) chapterNarrativeMissing.push('Alex');
  if (!chapterNarrative.hasNarrator) chapterNarrativeMissing.push('Narrator');
  if (!chapterNarrative.hasInnerVoice) chapterNarrativeMissing.push('inner voice');

  const weakMainTopicSections = sectionDetails
    .filter((section) => section.kind === 'main-topic')
    .filter((section) => section.narrative.coverageCount < 3)
    .map((section) => section.heading);

  const totalWordCount = content.split(/\s+/).filter(Boolean).length;
  const allH2Headings = headings.filter((heading) => heading.level === 2).map((heading) => heading.text);

  return {
    file: path.basename(filePath),
    headings: allH2Headings,
    missing: structure.missingRequired,
    extra: structure.unexpectedH2AfterPlan,
    orderOk: structure.orderIssues.length === 0,
    spacing,
    wordCounts,
    sectionDetails,
    hasConclusion: Boolean(structure.closingHeading),
    totalWordCount,
    structure,
    narrative: {
      chapterLevel: chapterNarrative,
      missingAcrossChapter: chapterNarrativeMissing,
      weakMainTopicSections
    }
  };
}

function printChapterReport(result) {
  let issues = false;

  console.log(`\n${result.file}:`);

  if (result.structure.missingRequired.length > 0) {
    console.log(`  Missing required sections: ${result.structure.missingRequired.join(', ')}`);
    issues = true;
  }
  if (result.structure.orderIssues.length > 0) {
    result.structure.orderIssues.forEach((issue) => {
      console.log(`  Order issue: ${issue}`);
    });
    issues = true;
  }
  if (result.structure.unexpectedH2AfterPlan.length > 0) {
    console.log(`  Unexpected top-level sections after the personal plan: ${result.structure.unexpectedH2AfterPlan.join(', ')}`);
    issues = true;
  }

  if (result.spacing.multiBlankLineGaps > 0) {
    console.log(`  2+ blank-line gaps: ${result.spacing.multiBlankLineGaps}`);
    issues = true;
  }
  if (result.spacing.missingBlankLineAfterHeadings > 0) {
    console.log(`  Missing blank lines after headings: ${result.spacing.missingBlankLineAfterHeadings}`);
    issues = true;
  }
  if (result.spacing.trailingSpaces > 0) {
    console.log(`  Trailing spaces: ${result.spacing.trailingSpaces}`);
    issues = true;
  }
  if (result.spacing.sceneBreakSpacingIssues > 0) {
    console.log(`  Scene break spacing issues: ${result.spacing.sceneBreakSpacingIssues}`);
    issues = true;
  }

  console.log(`  Main topic sections before integration: ${result.structure.mainTopicSections.length}`);
  if (result.structure.practicalSubsections.length > 0) {
    console.log(`  Practical subsections: ${result.structure.practicalSubsections.map((section) => section.text).join(', ')}`);
  } else {
    console.log('  Practical subsections: none found');
    issues = true;
  }

  if (result.narrative.missingAcrossChapter.length > 0) {
    console.log(`  Voice elements missing across the chapter: ${result.narrative.missingAcrossChapter.join(', ')}`);
    issues = true;
  }
  if (result.narrative.weakMainTopicSections.length > 0) {
    console.log(`  Main topic sections with light voice coverage: ${result.narrative.weakMainTopicSections.join(', ')}`);
  }

  if (result.structure.recommendations.length > 0) {
    result.structure.recommendations.forEach((recommendation) => {
      console.log(`  Recommendation: ${recommendation}`);
    });
  }

  console.log(`  Total word count: ${result.totalWordCount}`);
  if (!issues) {
    console.log('  No issues found.');
  }

  return issues;
}

function buildChapterSummary(result, hasIssues) {
  return {
    file: result.file,
    headings: result.headings,
    hasIssues,
    missingRequiredSections: result.structure.missingRequired,
    orderIssues: result.structure.orderIssues,
    unexpectedSectionsAfterPlan: result.structure.unexpectedH2AfterPlan,
    spacing: result.spacing,
    mainTopicSectionCount: result.structure.mainTopicSections.length,
    mainTopicSections: result.structure.mainTopicSections.map((section) => section.text),
    practicalSubsections: result.structure.practicalSubsections.map((section) => section.text),
    hasClosingSection: result.hasConclusion,
    closingHeading: result.structure.closingHeading,
    referencesHeading: result.structure.referencesHeading,
    missingVoiceElementsAcrossChapter: result.narrative.missingAcrossChapter,
    weakMainTopicSections: result.narrative.weakMainTopicSections,
    recommendations: result.structure.recommendations,
    totalWordCount: result.totalWordCount
  };
}

function buildSummary(scope, resultsWithIssues) {
  const templateSpec = getTemplateSpec();
  const chapters = resultsWithIssues.map(({ result, hasIssues }) => buildChapterSummary(result, hasIssues));
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    scope,
    template: {
      path: path.relative(__dirname, templateSpec.templatePath),
      requiredAnchors: templateSpec.requiredAnchors,
      recommendedClosingHeadings: templateSpec.recommendedClosingHeadings,
      optionalReferenceHeadings: templateSpec.optionalReferenceHeadings
    },
    summary: {
      chapterCount: chapters.length,
      chaptersWithIssues: chapters.filter((chapter) => chapter.hasIssues).length
    },
    chapters
  };
}

function writeSummaryFile(summaryPath, summary) {
  ensureReportsDir();
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n', 'utf8');
}

function main() {
  const files = fs.readdirSync(chaptersDir).flatMap((folder) => {
    const folderPath = path.join(chaptersDir, folder);
    if (fs.statSync(folderPath).isDirectory()) {
      return fs.readdirSync(folderPath)
        .filter((file) => file.endsWith('.md'))
        .map((file) => path.join(folderPath, file));
    }
    if (folder.endsWith('.md')) {
      return [folderPath];
    }
    return [];
  });

  const templateSpec = getTemplateSpec();
  console.log(`Checking chapters against ${path.basename(templateSpec.templatePath)}...`);

  const resultsWithIssues = files.map((file) => {
    const result = checkChapter(file);
    const hasIssues = printChapterReport(result);
    return { result, hasIssues };
  });

  const summary = buildSummary('all', resultsWithIssues);
  writeSummaryFile(allSummaryPath, summary);

  const total = summary.summary.chapterCount;
  const withIssues = summary.summary.chaptersWithIssues;
  console.log(`\nSummary: ${withIssues} of ${total} chapters have issues.`);
  console.log(`Machine-readable summary written to ${path.relative(__dirname, allSummaryPath)}.`);
  console.log('Check complete.');
}

if (require.main === module) {
  main();
}

module.exports = {
  checkChapter,
  getTemplateSections,
  getTemplateSpec,
  printChapterReport,
  buildSummary,
  writeSummaryFile,
  allSummaryPath,
  chapter1SummaryPath
};
