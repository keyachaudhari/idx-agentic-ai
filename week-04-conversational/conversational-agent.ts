// conversational-agent.ts
// Multi-turn conversation handler.
// Takes a user message + userId, updates their session, and either:
// 1. Asks a follow-up question if we need more info
// 2. Returns search results if we have enough info

import {
  getSession,
  updateSession,
  clearSession
} from "./session-manager.ts";

// Simple NLP to extract info from a message (reused from Week 2)
function extractFromMessage(message: string) {
    const cityMatch = message.match(/(?:in|around|near)\s+([A-Za-z\s]+?)(?=\s+under|\s+with|\s+for|$)/i);
    const priceMatch = message.match(/under\s+\$?([\d,.]+)(k|m)?/i);
    const bedsMatch = message.match(/(\d+)[\s-]*(bed|bedroom)/i);
    const bathsMatch = message.match(/(\d+(?:\.5)?)[\s-]*(bath|bathroom)/i);
    const poolMatch = /pool/i.test(message);

    const typeMap: Record<string, string> = {
        condo: "Condominium",
        townhome: "Townhouse",
        townhouse: "Townhouse",
        "single family": "SingleFamilyResidence",
        house: "SingleFamilyResidence",
    };

    const typeKey = Object.keys(typeMap).find(k =>
        message.toLowerCase().includes(k)
    );

    let maxPrice = null;
    if (priceMatch) {

        maxPrice = Number(priceMatch[1].replace(/,/g, ""));
        if (priceMatch[2]?.toLowerCase() === "k") maxPrice *= 1000;
        if (priceMatch[2]?.toLowerCase() === "m") maxPrice *= 1_000_000;
    }

    return {
        city: cityMatch?.[1]?.trim() || null,
        maxPrice,
        beds: bedsMatch ? Number(bedsMatch[1]) : null,
        baths: bathsMatch ? Number(bathsMatch[1]) : null,
        type: typeKey ? typeMap[typeKey] : null,
        pool: poolMatch ? "True" : null,
    };
}

// Main conversation handler
export async function handleConversation(
    userId: string,
    message: string
): Promise<string> {

    // Handle reset command
    if (message.toLowerCase().includes("start over") || message.toLowerCase().includes("reset")) {
        clearSession(userId);
        return "Starting fresh! What kind of property are you looking for?";
    }

    // Get current session
    const session = getSession(userId);

    // Extract whatever info is in this message
    const extracted = extractFromMessage(message);

    // Merge new info into the session
    if (extracted.city) updateSession(userId, { city: extracted.city });

    if (extracted.maxPrice) {
        updateSession(userId, { maxPrice: extracted.maxPrice });
    }

    if (extracted.beds) updateSession(userId, { beds: extracted.beds });
    if (extracted.baths) updateSession(userId, { baths: extracted.baths });
    if (extracted.type) updateSession(userId, { type: extracted.type });
    if (extracted.pool) updateSession(userId, { pool: extracted.pool });

    // Get updated session
    const updated = getSession(userId);
    
    // Ask follow-up questions for missing critical info
    if (!updated.city) {
        return "Which city are you looking in? (e.g. Irvine, Pasadena, San Diego)";
    }
    
    if (!updated.maxPrice) {
        return `Got it — searching in ${updated.city}. What is your maximum budget?`;
    }

    if (!updated.type) {
        return "Are you looking for a condo, townhome, or single family home?";
    }

    if (!updated.beds) {
        return "How many bedrooms minimum?";
    }
    // We have enough info — return a summary of what we will search
    const summary = `
    Great! Here is what I am searching for:
    City: ${updated.city}
    Max Price: $${updated.maxPrice?.toLocaleString()}
    Type: ${updated.type}
    Min Bedrooms: ${updated.beds}
    ${updated.pool ? " Pool: Yes" : ""}

    Searching rets_property now...
    (In Week 3 integration, real results would appear here)

    Type "start over" to search again.
    `.trim();

        return summary;
    }

    // Simulate a conversation
    async function main() {
        console.log("=== Conversational Agent Test ===\n");
        const userId = "test-user-123";

        const messages = [
            "I want to find a home",
            "in Irvine",
            "under $1.2M",
            "single family",
            "3 bedrooms",
        ];

        for (const msg of messages) {
            console.log(`User: "${msg}"`);
            const response = await handleConversation(userId, msg);
            console.log(`Agent: ${response}`);
            console.log("---");
        }
        process.exit(0);
    }
main();