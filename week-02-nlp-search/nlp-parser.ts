// Week 2 — Natural Language Property Search Parser
// Takes a free-text query and extracts structured filters

interface PropertyFilters {
  city: string | null;
  maxPrice: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  type: string | null;
  pool: string | null;
  hasView: string | null;
  maxHOA: number | null;
}

export async function parsePropertyQuery(query: string): Promise<PropertyFilters> {
  // Extract city
  const cityMatch = query.match(/in ([A-Za-z\s]+?)(?:\s+under|\s+with|\s+at|\s+below|$)/i);

  // Extract max price
  const priceMatch = query.match(/under \$?([\d,.]+)(k|m)?/i);

  // Extract bedrooms
  const bedsMatch = query.match(/(\d+)[\s-]*(bed|beds|bedroom|bedrooms)/i);

  // Extract bathrooms
  const bathsMatch = query.match(/(\d+(?:\.5)?)[\s-]*(bath|baths|bathroom)/i);

  // Extract square footage
  const sqftMatch = query.match(/(\d+)[\s,]*(sqft|sq ft|square feet)/i);

  // Extract features
  const poolMatch = /pool/i.test(query);
  const viewMatch = /view/i.test(query);

  // Extract HOA
  const hoaMatch = query.match(/hoa\s+(?:under|below|max)?\s*\$?([\d,]+)/i);

  // Map property types
  const typeMap: Record<string, string> = {
    condo: "Condominium",
    townhome: "Townhouse",
    townhouse: "Townhouse",
    "single family": "SingleFamilyResidence",
    house: "SingleFamilyResidence",
    land: "UnimprovedLand",
  };
  const typeKey = Object.keys(typeMap).find(k =>
    query.toLowerCase().includes(k)
  );

  // Parse price (handles 1.5m, 500k, 1,500,000)
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
    sqft: sqftMatch ? Number(sqftMatch[1]) : null,
    type: typeKey ? typeMap[typeKey] : null,
    pool: poolMatch ? "True" : null,
    hasView: viewMatch ? "True" : null,
    maxHOA: hoaMatch ? Number(hoaMatch[1].replace(/,/g, "")) : null,
  };
}

// Test with 10 queries
async function main() {
  const testQueries = [
    "3 bedroom condo in Irvine under $1.5M with a pool",
    "single family home in Pasadena under $900k with 2 baths",
    "2 bed 2 bath townhouse in San Diego under $800k",
    "homes in Beverly Hills under $5M with a view",
    "1500 sqft house in Riverside under $500k",
    "condo in Santa Monica under $1.2M with pool and view",
    "4 bedroom single family in Irvine under $2M",
    "land in Malibu under $3M",
    "2 bedroom condo in Long Beach under $600k",
    "townhome in Pasadena under $1M with 3 beds",
  ];

  console.log("=== NLP Parser Test Results ===\n");
  for (const query of testQueries) {
    const result = await parsePropertyQuery(query);
    console.log(`Query: "${query}"`);
    console.log("Parsed:", JSON.stringify(result, null, 2));
    console.log("---");
  }
}

main();