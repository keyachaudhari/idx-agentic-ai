// Simulates the WhatsApp message handler.
//
// In production, OpenClaw calls this when a WhatsApp
// message arrives. For Week 10 we test the flow locally.

import {
  formatListingsForWhatsApp,
  formatMarketForWhatsApp,
  formatTextForWhatsApp
} from "./message-formatter.ts";


// Simulate the orchestrator response.
// Later this can be replaced with the real Week 9 orchestrator.
async function mockOrchestrate(
  message: string,
  userId: string
): Promise<any> {

  const q = message.toLowerCase();

  if (
    q.includes("find") ||
    q.includes("search") ||
    q.includes("homes")
  ) {
    return {
      type: "listings",

      listings: [
        {
          L_Address: "123 Oak St",
          L_City: "Irvine",
          price: 950000,
          beds: 3,
          baths: 2,
          sqft: 1800,
          DaysOnMarket: 12,
          PoolPrivateYN: "True",
          PhotoCount: 24
        },

        {
          L_Address: "789 Pine Rd",
          L_City: "Irvine",
          price: 1050000,
          beds: 3,
          baths: 2.5,
          sqft: 1950,
          DaysOnMarket: 9,
          PoolPrivateYN: "False",
          PhotoCount: 28
        }
      ]
    };
  }


  if (
    q.includes("market") ||
    q.includes("prices") ||
    q.includes("trends")
  ) {
    return {
      type: "market",

      stats: {
        city: "Irvine",
        avgClosePrice: 1250000,
        avgPricePerSqft: 650,
        avgDaysOnMarket: 18,
        listToCloseRatio: 101.2,
        soldCount: 342
      }
    };
  }


  return {
    type: "text",
    response:
      "I can help you search for properties or check market stats. What would you like to know?"
  };
}


// Simulate WhatsApp typing indicator
async function sendTypingIndicator(
  userId: string
): Promise<void> {

  console.log(
    `[WhatsApp] Sending typing indicator to ${userId}...`
  );
}


// Main WhatsApp message handler
async function onWhatsAppMessage(
  message: string,
  userId: string
): Promise<string> {

  await sendTypingIndicator(userId);

  try {

    const result = await mockOrchestrate(
      message,
      userId
    );

    if (result.type === "listings") {

      return formatListingsForWhatsApp(
        result.listings
      );

    } else if (result.type === "market") {

      return formatMarketForWhatsApp(
        result.stats
      );

    } else {

      return formatTextForWhatsApp(
        result.response
      );
    }

  } catch (err) {

    console.error(
      "WhatsApp handler error:",
      err
    );

    return "Sorry, I hit an issue. Please try again!";
  }
}


// Simulate a WhatsApp conversation
async function main() {

  console.log(
    "=== WhatsApp Handler Simulation ===\n"
  );

  // Fake test number only
  const userId = "+1-555-0100";

  const messages = [
    "Find me 3 bedroom homes in Irvine under $1.2M",
    "What is the market like in Irvine?",
    "Hello!"
  ];


  for (const msg of messages) {

    console.log(
      `📱 User: "${msg}"`
    );

    const response =
      await onWhatsAppMessage(
        msg,
        userId
      );

    console.log(
      `🤖 Agent:\n${response}`
    );

    console.log(
      "\n" + "─".repeat(50) + "\n"
    );
  }
}


main();