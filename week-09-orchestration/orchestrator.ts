// Week 9 - Multi-Agent Orchestration
//
// Reads a user message, classifies the user's intent,
// and routes the request to the correct agent.
//
// Intent types:
// "search"     -> propertySearchAgent
// "market"     -> marketStatsAgent
// "recommend"  -> recommendationAgent
// "knowledge"  -> ragAgent
// "mixed"      -> propertySearchAgent + marketStatsAgent
// "unknown"    -> fallback response


type Intent =
  | "search"
  | "market"
  | "recommend"
  | "knowledge"
  | "mixed"
  | "unknown";


// ----------------------------------------------------
// Intent Classifier
// ----------------------------------------------------

function classifyIntent(query: string): Intent {
  const q = query.toLowerCase();

  const searchKeywords = [
    "find",
    "search",
    "show me",
    "looking for",
    "homes in",
    "house in",
    "properties in",
    "under $",
    "bedroom"
  ];

  const marketKeywords = [
    "market",
    "prices",
    "trends",
    "rising",
    "falling",
    "average price",
    "good time to buy",
    "days on market",
    "dom"
  ];

  const recommendKeywords = [
    "similar",
    "like this",
    "recommend",
    "recommendation",
    "comparable"
  ];

  const knowledgeKeywords = [
    "what is",
    "what does",
    "explain",
    "define",
    "meaning",
    "mean"
  ];

  const isSearch = searchKeywords.some((k) => q.includes(k));
  const isMarket = marketKeywords.some((k) => q.includes(k));
  const isRecommend = recommendKeywords.some((k) => q.includes(k));
  const isKnowledge = knowledgeKeywords.some((k) => q.includes(k));

  // Mixed means both property search and market analysis
  if (isSearch && isMarket) return "mixed";

  // More specific intents should be checked before general search
  if (isRecommend) return "recommend";
  if (isKnowledge) return "knowledge";
  if (isMarket) return "market";
  if (isSearch) return "search";

  return "unknown";
}


// ----------------------------------------------------
// Mock Agents
//
// These are temporary Week 9 stubs.
// Later these connect to your real Week 3, 5, 7, and 8 agents.
// ----------------------------------------------------

async function propertySearchAgent(query: string): Promise<string> {
  return `[Property Search]
Found active listings matching:

"${query}"

Example:
123 Oak St, Irvine
$950,000
3 bd / 2 ba
1,800 sqft`;
}


async function marketStatsAgent(query: string): Promise<string> {
  return `[Market Stats]
Market report for the requested area:

Average price: $1,250,000
Average DOM: 18 days
List-to-close ratio: 101.2%
Market condition: Seller's market`;
}


async function recommendationAgent(query: string): Promise<string> {
  return `[Recommendations]
Top similar listings found based on structured and semantic similarity.

Request:
"${query}"`;
}


async function ragAgent(query: string): Promise<string> {
  return `[Knowledge]
Based on the indexed knowledge base:

DOM means Days on Market, which is the number of days a property was listed before going under contract or selling.

Question:
"${query}"`;
}


// ----------------------------------------------------
// Orchestrator
// ----------------------------------------------------

async function orchestrate(
  query: string,
  userId: string
): Promise<string> {
  const intent = classifyIntent(query);

  console.log(
    `\n[Orchestrator] Intent detected: "${intent}" for user "${userId}"`
  );

  switch (intent) {
    case "search":
      return await propertySearchAgent(query);

    case "market":
      return await marketStatsAgent(query);

    case "recommend":
      return await recommendationAgent(query);

    case "knowledge":
      return await ragAgent(query);

    case "mixed": {
      console.log(
        "[Orchestrator] Mixed intent detected. Running search + market in parallel."
      );

      const [listings, stats] = await Promise.all([
        propertySearchAgent(query),
        marketStatsAgent(query)
      ]);

      return `${listings}\n\n${stats}`;
    }

    default:
      return `I am not sure how to help with that.

Try asking about:
- finding properties
- market trends
- similar homes
- real estate definitions`;
  }
}


// ----------------------------------------------------
// Test Suite
// ----------------------------------------------------

async function main() {
  const testQueries = [
    {
      query: "Find me 3 bedroom homes in Irvine under $1.2M",
      expected: "search"
    },
    {
      query: "What are home prices doing in Pasadena?",
      expected: "market"
    },
    {
      query: "Show me similar homes to this listing",
      expected: "recommend"
    },
    {
      query: "What does escrow mean?",
      expected: "knowledge"
    },
    {
      query: "Find affordable homes in Pasadena and tell me if prices are rising",
      expected: "mixed"
    },
    {
      query: "Is now a good time to buy?",
      expected: "market"
    }
  ];

  console.log("=== Week 9 Orchestrator Test Suite ===\n");

  for (const test of testQueries) {
    const result = await orchestrate(
      test.query,
      "test-user"
    );

    const intent = classifyIntent(test.query);

    const passed =
      intent === test.expected
        ? "PASS"
        : "FAIL";

    console.log(
      `${passed} | Expected: ${test.expected} | Got: ${intent}`
    );

    console.log(
      `Response: ${result.split("\n")[0]}`
    );

    console.log();
  }
}


main();