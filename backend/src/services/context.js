const cache = require('./cache');

const CONTEXT_DEV_API_KEY = process.env.CONTEXT_DEV_API_KEY || 'ctxt_secret_822b74496b3748f2a4751a54fa4d37c0';

/**
 * Searches the web and scrapes results using Context.dev
 * @param {string} query - The search query
 * @param {object} options - Options like freshness, queryFanout
 */
async function searchAndScrape(query, options = {}) {
  const cacheKey = `search:${query.toLowerCase().trim()}:${JSON.stringify(options)}`;
  
  // Try cache first
  const cached = await cache.get(cacheKey);
  if (cached) {
    console.log(`Cache hit for query: "${query}"`);
    return cached;
  }

  const payload = {
    query: query,
    queryFanout: options.queryFanout !== false, // default to true for deeper coverage
    freshness: options.freshness || undefined,
    markdownOptions: {
      enabled: true,
      includeLinks: true,
      includeImages: true,
      useMainContentOnly: true,
      shortenBase64Images: true
    }
  };

  console.log(`Calling Context.dev Search API for: "${query}"...`);

  // Use global fetch
  const response = await fetch('https://api.context.dev/v1/web/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONTEXT_DEV_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Context.dev API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  
  // Cache the result for 6 hours (21600 seconds)
  await cache.set(cacheKey, result, 21600);

  return result;
}

module.exports = {
  searchAndScrape
};
