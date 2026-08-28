// Takes raw agent results and formats them for WhatsApp.
// Messages are kept short and easy to read on a phone.

interface ListingResult {
  L_Address: string;
  L_City: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  DaysOnMarket: number;
  PoolPrivateYN: string;
  PhotoCount: number;
}

interface MarketResult {
  city: string;
  avgClosePrice: number;
  avgPricePerSqft: number;
  avgDaysOnMarket: number;
  listToCloseRatio: number;
  soldCount: number;
}


// Format property listings for WhatsApp
export function formatListingsForWhatsApp(
  listings: ListingResult[]
): string {

  if (!listings || listings.length === 0) {
    return "No listings found matching your criteria. Try adjusting your filters.";
  }

  const header = `🏠 *Found ${listings.length} properties:*\n`;

  const items = listings
    .slice(0, 5)
    .map(
      (l, i) =>
        `${i + 1}. *${l.L_Address}, ${l.L_City}*\n` +
        `   💰 $${l.price?.toLocaleString()} | 🛏 ${l.beds}bd/${l.baths}ba | 📐 ${l.sqft} sqft\n` +
        `   ⏱ ${l.DaysOnMarket} days on market | 📷 ${l.PhotoCount} photos` +
        (l.PoolPrivateYN === "True" ? " | 🏊 Pool" : "")
    )
    .join("\n\n");

  return (
    header +
    items +
    "\n\nReply with a number for more details, or ask to refine your search."
  );
}


// Format market statistics for WhatsApp
export function formatMarketForWhatsApp(
  stats: MarketResult
): string {

  const trend =
    stats.listToCloseRatio >= 100
      ? "🔥 Seller's market"
      : "🧊 Buyer's market";

  return (
    `📊 *${stats.city} Market Report*\n` +
    `━━━━━━━━━━━━━━\n` +
    `🏠 Homes sold (12mo): ${stats.soldCount}\n` +
    `💰 Avg price: $${stats.avgClosePrice?.toLocaleString()}\n` +
    `📐 Price/sqft: $${stats.avgPricePerSqft}\n` +
    `⏱ Avg days on market: ${stats.avgDaysOnMarket}\n` +
    `📈 List-to-close: ${stats.listToCloseRatio}%\n\n` +
    trend
  );
}


// Format normal text responses
export function formatTextForWhatsApp(text: string): string {
  return text;
}


// Test formatter
async function main() {

  const mockListings: ListingResult[] = [
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
      L_Address: "456 Maple Ave",
      L_City: "Irvine",
      price: 1100000,
      beds: 4,
      baths: 3,
      sqft: 2200,
      DaysOnMarket: 8,
      PoolPrivateYN: "False",
      PhotoCount: 31
    }
  ];

  const mockMarket: MarketResult = {
    city: "Irvine",
    avgClosePrice: 1250000,
    avgPricePerSqft: 650,
    avgDaysOnMarket: 18,
    listToCloseRatio: 101.2,
    soldCount: 342
  };

  console.log("=== WhatsApp Message Formatter Test ===\n");

  console.log("--- Listings ---");
  console.log(formatListingsForWhatsApp(mockListings));

  console.log("\n--- Market Stats ---");
  console.log(formatMarketForWhatsApp(mockMarket));
}


// main();