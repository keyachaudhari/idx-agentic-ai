// Week 1 — Basic Tool Definition Demo
// Shows how OpenClaw tools are structured

export async function getCurrentTime() {
  return { currentTime: new Date().toISOString() };
}

export async function handleMessage(message: string) {
  if (message.toLowerCase().includes("time")) {
    return await getCurrentTime();
  }

  if (message.toLowerCase().includes("listings")) {
    return {
      response: "I can search for listings! Try asking about a city and price range.",
      skill: "propertySearchSkill"
    };
  }

  if (message.toLowerCase().includes("market")) {
    return {
      response: "I can pull market stats! Ask me about any California city.",
      skill: "marketStatsSkill"
    };
  }

  return { response: "I could not understand the request." };
}

// Test the handler
async function main() {
  console.log(await handleMessage("What time is it?"));
  console.log(await handleMessage("Show me listings in Irvine"));
  console.log(await handleMessage("What is the market like in Pasadena?"));
}

main();