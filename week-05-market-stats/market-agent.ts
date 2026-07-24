// Queries california_sold to generate market statistics for any California city
// Answers questions like "what is the average price in Irvine?"
// or "how fast are homes selling in Pasadena?"

import { query } from "../week-03-database/db-connection.ts";

interface MarketStats {
    city: string;
    soldCount: number;
    avgClosePrice: number;
    avgPricePerSqft: number;
    avgDaysOnMarket: number;
    listToCloseRatio: number;
}

// Get key market stats for a city over the last N months
export async function getCityMarketStats(
    city: string,
    months = 12
): Promise<MarketStats | null> {
    const sql = `
        SELECT
            City,
            COUNT(*) AS sold_count,
            ROUND(AVG(ClosePrice), 0) AS avg_close_price,
            ROUND(AVG(ClosePrice / NULLIF(LivingArea, 0)), 0) AS avg_price_per_sqft,
            ROUND(AVG(DaysOnMarket), 1) AS avg_dom,
            ROUND(AVG(ClosePrice / NULLIF(ListPrice, 0)) * 100, 1) AS list_to_close_pct
        FROM california_sold
        WHERE City = ?
            AND PropertyType = 'Residential'
            AND CloseDate >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
            AND LivingArea > 0
        GROUP BY City
    `;

    const rows = await query<any>(sql, [city, months]);
    if (!rows.length) return null;

    const row = rows[0];
    return {
        city: row.City,
        soldCount: row.sold_count,
        avgClosePrice: row.avg_close_price,
        avgPricePerSqft: row.avg_price_per_sqft,
        avgDaysOnMarket: row.avg_dom,
        listToCloseRatio: row.list_to_close_pct,
    };
}

// Get top 10 cities by sales volume
export async function getTopCitiesByVolume(): Promise<any[]> {
    const sql = `
        SELECT
            City,
            COUNT(*) AS sold_count,
            ROUND(AVG(ClosePrice), 0) AS avg_price,
            ROUND(AVG(DaysOnMarket), 1) AS avg_dom
        FROM california_sold
        WHERE PropertyType = 'Residential'
            AND CloseDate >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY City
        ORDER BY sold_count DESC
        LIMIT 10
    `;
    return query<any>(sql, []);
}

// Format stats as a readable market report
function formatMarketReport(stats: MarketStats): string {
    const competitive = stats.listToCloseRatio >= 100 ? " Seller's market" : " Buyer's market";
    const fastSelling = stats.avgDaysOnMarket < 20 ? "Homes sell FAST here." : "Homes are selling slowly.";

    return `
Market Report: ${stats.city} (Last 12 Months)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Homes Sold: ${stats.soldCount}
Avg Close Price: $${stats.avgClosePrice?.toLocaleString()}
Avg Price/sqft: $${stats.avgPricePerSqft}
Avg Days on Market: ${stats.avgDaysOnMarket}
List-to-Close Ratio: ${stats.listToCloseRatio}%

${competitive} | ${fastSelling}
`.trim();
}

// Test it
async function main() {
    console.log("=== Market Statistics Agent Test ===\n");

    const cities = ["Irvine", "Pasadena", "San Diego"];

    for (const city of cities) {
        const stats = await getCityMarketStats(city, 12);
        if (stats) {
            console.log(formatMarketReport(stats));
        } else {
            console.log(`No data found for ${city}`);
        }
        console.log("\n---\n");
    }
    console.log("Top 10 Cities by Sales Volume:");
    const top = await getTopCitiesByVolume();
    top.forEach((row, i) => {
        console.log(`${i + 1}. ${row.City} — ${row.sold_count} sold | Avg $${row.avg_price}`);
    });

    process.exit(0);
}
main();