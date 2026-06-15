async function generateResearchReportStream(query, searchResults, mode) {
  let report = `# Research Report: ${query}\n\n`;

  report += `## Executive Summary\n\n`;
  report += `Report generated from ${searchResults.length} collected web sources.\n\n`;

  report += `## Key Findings\n\n`;

  searchResults.forEach((res, idx) => {
    report += `- **${res.title}**\n`;
    report += `  - ${res.description || "No description available"}\n`;
  });

  report += `\n## Statistics\n\n`;
  report += `| Metric | Value |\n`;
  report += `|----------|----------|\n`;
  report += `| Sources Analyzed | ${searchResults.length} |\n\n`;

  report += `## Timeline\n\n`;

  searchResults.forEach((res, idx) => {
    report += `- Source ${idx + 1}: ${res.title}\n`;
  });

  report += `\n## Sources\n\n`;

  searchResults.forEach((res, idx) => {
    report += `[${idx + 1}] ${res.title} - ${res.url}\n`;
  });

  report += `

[REPORT_METADATA]
{
  "confidenceScore": 50,
  "confidenceReason": "Generated without AI analysis; based solely on collected web data.",
  "charts": [],
  "followUpQuestions": []
}
`;

  return report;
}