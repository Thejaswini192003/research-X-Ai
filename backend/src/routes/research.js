const express = require('express');
const router = express.Router();

const contextService = require('../services/context');
const db = require('../services/db');

router.get('/stream', async (req, res) => {
  const { query, mode = 'deep' } = req.query;

  if (!query) {
    return res.status(400).json({
      error: 'Query parameter is required'
    });
  }

  let isDisconnected = false;

  req.on('close', () => {
    isDisconnected = true;
    console.log('Client disconnected');
  });

  const sendEvent = (type, data = {}) => {
    if (isDisconnected) return;
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  };

  const sendHeartbeat = () => {
    if (!isDisconnected) {
      res.write(':\n\n');
    }
  };

  try {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    const heartbeat = setInterval(sendHeartbeat, 15000);

    // STEP 1
    sendEvent('progress', {
      step: 1,
      message: 'Building search strategy...'
    });

    const searchQueries =
      mode === 'fast'
        ? [query]
        : [
            query,
            `${query} statistics`,
            `${query} report`
          ];

    // STEP 2
    sendEvent('progress', {
      step: 2,
      message: 'Searching web sources...'
    });

    let allResults = [];

    for (const q of searchQueries) {
      if (isDisconnected) break;

      try {
        const result = await contextService.searchAndScrape(q);

        if (result?.results) {
          allResults.push(...result.results);
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (isDisconnected) {
      clearInterval(heartbeat);
      return;
    }

    // Deduplicate URLs
    const uniqueResults = [];
    const seen = new Set();

    for (const item of allResults) {
      if (!seen.has(item.url)) {
        seen.add(item.url);
        uniqueResults.push(item);
      }
    }

    const finalResults = uniqueResults.slice(
      0,
      mode === 'fast' ? 5 : 10
    );

    if (!finalResults.length) {
      throw new Error('No search results found');
    }

    // STEP 3
    sendEvent('progress', {
      step: 3,
      message: `Analyzing ${finalResults.length} sources...`
    });

    // Generate report without AI
    const report = generateReport(query, finalResults);

    // STEP 4
    sendEvent('progress', {
      step: 4,
      message: 'Generating report...'
    });

    // Stream line-by-line
    const chunks = report.split('\n');

    for (const chunk of chunks) {
      if (isDisconnected) break;

      sendEvent('chunk', {
        content: chunk + '\n'
      });

      await new Promise(resolve =>
        setTimeout(resolve, 15)
      );
    }

    clearInterval(heartbeat);

    const historyItem = await db.saveHistoryItem({
      query,
      mode,
      confidence: 60,
      summary: `Generated from ${finalResults.length} web sources`,
      report,
      sources: finalResults.map(r => ({
        title: r.title,
        url: r.url,
        description: r.description
      })),
      timeline: [],
      charts: [],
      followUpQuestions: [
        `What are the latest developments in ${query}?`,
        `What statistics exist for ${query}?`,
        `What are expert opinions on ${query}?`
      ]
    });

    sendEvent('done', {
      id: historyItem.id,
      historyItem
    });

    res.end();
  } catch (err) {
    console.error(err);

    sendEvent('error', {
      message: err.message
    });

    res.end();
  }
});

function generateReport(query, results) {
  let report = `# Research Report: ${query}\n\n`;

  report += `## Executive Summary\n\n`;
  report += `This report was generated from ${results.length} web sources.\n\n`;

  report += `## Key Findings\n\n`;

  results.forEach((r, i) => {
    report += `### ${i + 1}. ${r.title}\n`;
    report += `${r.description || 'No description available'}\n\n`;
  });

  report += `## Statistics\n\n`;
  report += `| Metric | Value |\n`;
  report += `|----------|----------|\n`;
  report += `| Sources | ${results.length} |\n\n`;

  report += `## Timeline\n\n`;

  results.forEach((r, i) => {
    report += `- Source ${i + 1}: ${r.title}\n`;
  });

  report += `\n## Sources\n\n`;

  results.forEach((r, i) => {
    report += `[${i + 1}] ${r.title}\n`;
    report += `${r.url}\n\n`;
  });

  return report;
}

module.exports = router;