// sold-comps.ts
// Queries california_sold to find recently closed transactions.
// "Comps" = comparable sales = what similar homes actually sold for.
// Real estate agents use this to determine if a listing is priced fairly.

import { query } from "./db-connection.ts";

interface SoldRow {
    ListingKey: number;
    UnparsedAddress: string;
    City: string;
    CloseDate: string;
    ClosePrice: number;
    OriginalListPrice: number;
    ListPrice: number;
    DaysOnMarket: number;
    BedroomsTotal: number;
    BathroomsTotalInteger: number;
    LivingArea: number;
    PropertyType: string;
    PropertySubType: string;
    YearBuilt: number;
    ListAgentFullName: string;
    ListOfficeName: string;
    BuyerOfficeName: string;
}

export async function getSoldComps(city: string, months = 12): Promise<SoldRow[]> {
    const sql = `
        SELECT
            ListingKey,
            UnparsedAddress,
            City,
            CloseDate,
            ClosePrice,
            OriginalListPrice,
            ListPrice,
            DaysOnMarket,
            BedroomsTotal,
            BathroomsTotalInteger,
            LivingArea,
            PropertyType,
            PropertySubType,
            YearBuilt,
            ListAgentFullName,
            ListOfficeName,
            BuyerOfficeName
            FROM california_sold
            WHERE City = ?
            AND CloseDate >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
            AND PropertyType = 'Residential'
            ORDER BY CloseDate DESC
            LIMIT 50
        `;
        return query<SoldRow>(sql, [city, months]);
    }

// Format a sold comp for display
function formatComp(comp: SoldRow): string {
    const ratio = comp.ListPrice > 0
        ? ((comp.ClosePrice / comp.ListPrice) * 100).toFixed(1)
        : "N/A";
    return `
        ${comp.UnparsedAddress}, ${comp.City}
        Sold: $${comp.ClosePrice?.toLocaleString()} (Listed: $${comp.ListPrice?.toLocaleString()})
        Closed: ${comp.CloseDate} | ${comp.DaysOnMarket} days on market
        ${comp.BedroomsTotal}bd / ${comp.BathroomsTotalInteger}ba | ${comp.LivingArea} sqft
        ${comp.PropertyType} | ${comp.PropertySubType} | Built ${comp.YearBuilt}
        Agent: ${comp.ListAgentFullName} | Office: ${comp.ListOfficeName} | Buyer Office: ${comp.BuyerOfficeName}
    `.trim();
}

// Test it
async function main() {
    console.log("=== Testing Sold Comps Query ===\n");
    const comps = await getSoldComps("Irvine", 12);
    console.log(`Found ${comps.length} sold comps in Irvine (last 12 months):`);
    comps.slice(0, 5).forEach(c => console.log(formatComp(c)));
    process.exit(0);
}

main();