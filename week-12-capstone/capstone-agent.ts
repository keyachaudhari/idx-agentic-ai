// capstone-agent.ts
// Week 12 - Final Multi-Agent Real Estate Assistant
//
// Connects the real weekly components:
// - Property search + session memory
// - Market analytics
// - Recommendation engine
// - RAG knowledge assistant
// - Email draft + approval safety workflow

import { pathToFileURL } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { searchActiveListings } from "../week-03-database/search-listing.ts";

import {
  getSession,
  updateSession,
  clearSession
} from "../week-04-conversational/session-manager.ts";

import {
  getCityMarketStats
} from "../week-05-market-stats/market-agent.ts";

import {
  draftMarketReport,
  approveAndSend,
  rejectDraft
} from "../week-11-email/email-agent.ts";


const execFileAsync = promisify(execFile);


// ----------------------------------------------------
// Intent Types
// ----------------------------------------------------

type Intent =
  | "search"
  | "market"
  | "recommend"
  | "knowledge"
  | "email"
  | "approve"
  | "reject"
  | "unknown";


// ----------------------------------------------------
// Intent Classifier
// ----------------------------------------------------

function classifyIntent(message: string): Intent {

  const q = message.toLowerCase();

  if (q.startsWith("approve ")) {
    return "approve";
  }

  if (q.startsWith("reject ")) {
    return "reject";
  }

  if (
    q.includes("email") ||
    q.includes("draft market report")
  ) {
    return "email";
  }

  if (
    q.includes("recommend") ||
    q.includes("similar") ||
    q.includes("comparable")
  ) {
    return "recommend";
  }

  if (
    q.includes("what does") ||
    q.includes("what is") ||
    q.includes("define") ||
    q.includes("explain") ||
    q.includes("mean")
  ) {
    // Market questions should stay market questions
    if (
      q.includes("market") ||
      q.includes("home prices") ||
      q.includes("prices doing")
    ) {
      return "market";
    }

    return "knowledge";
  }

  if (
    q.includes("market") ||
    q.includes("prices") ||
    q.includes("trend") ||
    q.includes("good time to buy")
  ) {
    return "market";
  }

    if (
    q.includes("find") ||
    q.includes("search") ||
    q.includes("home") ||
    q.includes("house") ||
    q.includes("condo") ||
    q.includes("townhome") ||
    q.includes("single family") ||
    q.includes("single-family") ||
    q.includes("bedroom") ||
    q.includes("bedrooms") ||
    q.includes("under $") ||
    q.includes("budget") ||
    q.includes("maximum") ||
    q.includes("max price")
  ) {
    return "search";
  }

  return "unknown";
}
// ----------------------------------------------------
// Property Search Helpers
// ----------------------------------------------------

function extractCity(message: string): string | undefined {

  const cities = [
    "Irvine",
    "Pasadena",
    "San Diego",
    "Los Angeles",
    "Beverly Hills",
    "Oakland",
    "Palo Alto",
    "San Jose",
    "Sacramento",
    "La Jolla",
    "Watsonville",
    "Pacific Grove"
  ];

  const lower = message.toLowerCase();

  return cities.find(
    city => lower.includes(city.toLowerCase())
  );
}


function extractMaxPrice(message: string): number | undefined {

  const q = message.toLowerCase();

  const million =
    q.match(
      /(?:under|max|budget|below)?\s*\$?([\d.]+)\s*m\b/
    );

  if (million) {
    return Number(million[1]) * 1_000_000;
  }

  const thousand =
    q.match(
      /(?:under|max|budget|below)?\s*\$?([\d,.]+)\s*k\b/
    );

  if (thousand) {
    return Number(
      thousand[1].replace(/,/g, "")
    ) * 1_000;
  }

  const dollar =
    q.match(
      /\$([\d,]{5,})/
    );

  if (dollar) {
    return Number(
      dollar[1].replace(/,/g, "")
    );
  }

  return undefined;
}


function extractBeds(message: string): number | undefined {

  const match =
    message.toLowerCase().match(
      /(\d+)\s*(?:bed|bedroom|bd)/
    );

  return match
    ? Number(match[1])
    : undefined;
}


function extractBaths(message: string): number | undefined {

  const match =
    message.toLowerCase().match(
      /(\d+(?:\.\d+)?)\s*(?:bath|bathroom|ba)/
    );

  return match
    ? Number(match[1])
    : undefined;
}


function extractType(message: string): string | undefined {

  const q = message.toLowerCase();

  if (
    q.includes("single family") ||
    q.includes("single-family")
  ) {
    return "SingleFamilyResidence";
  }

  if (q.includes("condo")) {
    return "Condominium";
  }

  if (q.includes("townhome")) {
    return "Townhouse";
  }

  return undefined;
}


// ----------------------------------------------------
// Real Property Search + Memory
// ----------------------------------------------------

async function propertySearchAgent(
  userId: string,
  message: string
): Promise<string> {

  if (
    message.toLowerCase().includes("start over") ||
    message.toLowerCase().includes("reset")
  ) {
    clearSession(userId);

    return "Starting fresh. What kind of property are you looking for?";
  }

  const city = extractCity(message);
  const maxPrice = extractMaxPrice(message);
  const beds = extractBeds(message);
  const baths = extractBaths(message);
  const type = extractType(message);

  if (city) {
    updateSession(userId, { city });
  }

  if (maxPrice) {
    updateSession(userId, { maxPrice });
  }

  if (beds) {
    updateSession(userId, { beds });
  }

  if (baths) {
    updateSession(userId, { baths });
  }

  if (type) {
    updateSession(userId, { type });
  }

  const session = getSession(userId);

  if (!session.city) {
    return "Which city are you looking in?";
  }

  if (!session.maxPrice) {
    return `Got it, ${session.city}. What is your maximum budget?`;
  }

  if (!session.type) {
    return "Are you looking for a condo, townhome, or single family home?";
  }

  if (!session.beds) {
    return "How many bedrooms minimum?";
  }

  const listings =
    await searchActiveListings(
      {
        city: session.city,
        maxPrice: session.maxPrice,
        beds: session.beds,
        baths: session.baths ?? null,
        type: session.type,
        pool: session.pool ?? null
      },
      1,
      5
    );

  updateSession(
    userId,
    {
      lastResults: listings.map(l => ({
        L_Address: l.L_Address,
        L_City: l.L_City,
        price: l.price,
        beds: l.beds,
        baths: l.baths,
        sqft: l.sqft
      }))
    }
  );

  if (!listings.length) {
    return "I couldn't find active listings matching those filters. Try changing the price, city, or property type.";
  }

  const formatted =
    listings.map(
      (listing, index) =>
        `${index + 1}. ${listing.L_Address}, ${listing.L_City}\n` +
        `   $${listing.price?.toLocaleString()} | ` +
        `${listing.beds} bd / ${listing.baths} ba | ` +
        `${listing.sqft} sqft\n` +
        `   Listing ID: ${listing.L_ListingID}`
    ).join("\n\n");

  return (
    `Found ${listings.length} active listings:\n\n` +
    formatted
  );
}


// ----------------------------------------------------
// Real Market Analytics
// ----------------------------------------------------

async function marketStatsAgent(
  message: string
): Promise<string> {

  const city =
    extractCity(message);

  if (!city) {
    return "Which California city would you like market statistics for?";
  }

  const stats =
    await getCityMarketStats(
      city,
      12
    );

  if (!stats) {
    return `I couldn't find recent sold-market statistics for ${city}.`;
  }

  const trend =
    stats.listToCloseRatio >= 100
      ? "Seller's market"
      : "Buyer's market";

  return (
    `Market Report: ${stats.city}\n\n` +
    `Homes sold: ${stats.soldCount}\n` +
    `Average close price: $${stats.avgClosePrice?.toLocaleString()}\n` +
    `Average price/sqft: $${stats.avgPricePerSqft}\n` +
    `Average DOM: ${stats.avgDaysOnMarket} days\n` +
    `List-to-close ratio: ${stats.listToCloseRatio}%\n` +
    `Market condition: ${trend}`
  );
}


// ----------------------------------------------------
// Python Bridge
// ----------------------------------------------------

async function runPythonBridge(
  command: "rag" | "recommend",
  value: string
): Promise<string> {

  const {
    stdout
  } = await execFileAsync(
    "python3",
    [
      "python-bridge.py",
      command,
      value
    ],
    {
      cwd: new URL(".", import.meta.url).pathname
    }
  );

  // The Python modules may print indexing/debug output
  // before the final JSON, so use the last JSON-looking line.
  const lines =
    stdout
      .trim()
      .split("\n")
      .filter(Boolean);

  const jsonLine =
    [...lines]
      .reverse()
      .find(line =>
        line.trim().startsWith("{")
      );

  if (!jsonLine) {
    throw new Error(
      "Python bridge did not return JSON."
    );
  }

  const parsed =
    JSON.parse(jsonLine);

  if (!parsed.ok) {
    throw new Error(
      parsed.error ||
      "Python bridge failed."
    );
  }

  return parsed.result;
}


// ----------------------------------------------------
// Recommendation Agent
// ----------------------------------------------------

async function recommendationAgent(
  message: string
): Promise<string> {

  const idMatch =
    message.match(/\b\d{6,}\b/);

  if (!idMatch) {
    return (
      "Please provide a listing ID so I can find similar properties.\n" +
      'Example: "Recommend homes similar to listing 1118422731"'
    );
  }

  return await runPythonBridge(
    "recommend",
    idMatch[0]
  );
}


// ----------------------------------------------------
// RAG Knowledge Agent
// ----------------------------------------------------

async function ragAgent(
  message: string
): Promise<string> {

  return await runPythonBridge(
    "rag",
    message
  );
}


// ----------------------------------------------------
// Email Agent
// ----------------------------------------------------

async function emailAgent(
  message: string
): Promise<string> {

  const emailMatch =
    message.match(
      /[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/
    );

  if (!emailMatch) {
    return "Please include the recipient email address.";
  }

  const city =
    extractCity(message);

  if (!city) {
    return "Which city should the market report cover?";
  }

  const stats =
    await getCityMarketStats(
      city,
      12
    );

  if (!stats) {
    return `I couldn't create the report because no market statistics were found for ${city}.`;
  }

  const draft =
    draftMarketReport(
      emailMatch[0],
      stats
    );

  return (
    `Email draft created.\n` +
    `Draft ID: ${draft.id}\n` +
    `To: ${draft.to}\n` +
    `Subject: ${draft.subject}\n` +
    `Status: ${draft.status}\n\n` +
    `The email has NOT been sent.\n` +
    `Type "approve ${draft.id}" to approve it, or ` +
    `"reject ${draft.id}" to reject it.`
  );
}


// ----------------------------------------------------
// Final Capstone Orchestrator
// ----------------------------------------------------

export async function capstoneAgent(
  userId: string,
  message: string
): Promise<string> {

  const intent =
    classifyIntent(message);

    let routedIntent = intent;

// If the user already has an unfinished property-search session,
// treat otherwise-unknown follow-up messages as search information.
const existingSession = getSession(userId);

if (
  routedIntent === "unknown" &&
  (
    existingSession.city ||
    existingSession.maxPrice ||
    existingSession.type ||
    existingSession.beds
  )
) {
  routedIntent = "search";
}

  console.log(
    `[Capstone] Intent: ${routedIntent}`
  );

  try {

    switch (routedIntent) {

      case "search":
        return await propertySearchAgent(
          userId,
          message
        );

      case "market":
        return await marketStatsAgent(
          message
        );

      case "recommend":
        return await recommendationAgent(
          message
        );

      case "knowledge":
        return await ragAgent(
          message
        );

      case "email":
        return await emailAgent(
          message
        );

      case "approve": {

        const draftId =
            message
            .replace(/^approve\s+/i, "")
            .trim();

        const approved =
            await approveAndSend(draftId);

        if (!approved) {
            return (
            `Approval blocked for ${draftId}.`
            );
        }

        return (
            `Draft ${draftId} was approved.`
        );
        }

      case "reject": {

        const draftId =
            message
            .replace(/^reject\s+/i, "")
            .trim();

        const rejected =
            rejectDraft(draftId);

        if (!rejected) {
            return (
            `Could not reject ${draftId}.`
            );
        }

        return (
            `Draft ${draftId} was rejected and cannot be sent.`
        );
        }

      default:
        return (
          "I can help with property searches, market statistics, " +
          "similar-property recommendations, real estate questions, " +
          "and approval-gated email drafts."
        );
    }

  } catch (error) {

    console.error(
      "[Capstone] Error:",
      error
    );

    return (
      "I hit an error while processing that request. " +
      "Please try again."
    );
  }
}


// ----------------------------------------------------
// Interactive Demo
// ----------------------------------------------------

async function main() {

  const userId =
    "capstone-demo-user";

  console.log(
    "=== IDX Multi-Agent Real Estate Assistant ==="
  );

  console.log(
    "Type a request, or type 'exit' to quit.\n"
  );

  const readline =
    await import(
      "node:readline/promises"
    );

  const {
    stdin: input,
    stdout: output
  } =
    await import(
      "node:process"
    );

  const rl =
    readline.createInterface({
      input,
      output
    });


  while (true) {

    const message =
      await rl.question(
        "You: "
      );

    if (
      message
        .trim()
        .toLowerCase()
        === "exit"
    ) {
      break;
    }

    const response =
      await capstoneAgent(
        userId,
        message
      );

    console.log(
      `\nAssistant:\n${response}\n`
    );
  }

  rl.close();
}


const isDirectRun =
  process.argv[1] &&
  import.meta.url ===
    pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main();
}