// search-listings.ts
// This file takes the parsed filters from Week 2 and runs a real SQL query
// against rets_property to find matching active listings.

import { query } from "./db-connection.ts";

// This defines what a "filter object" looks like
interface PropertyFilters {
    city?: string | null;
    maxPrice?: number | null;
    beds?: number | null;
    baths?: number | null;
    sqft?: number | null;
    type?: string | null;
    pool?: string | null;
    hasView?: string | null;
}

// This defines what one listing row looks like when it comes back from the DB
interface ListingRow {
    L_ListingID: string;
    L_Address: string;
    L_City: string;
    L_Zip: string;
    price: number;
    beds: number;
    baths: number;
    sqft: number;
    type: string;
    status: string;
    YearBuilt: number;
    AssociationFee: number;
    DaysOnMarket: number;
    PoolPrivateYN: string;
    ViewYN: string;
    PhotoCount: number;
    agentFirstName: string;
    agentLastName: string;
    officeName: string;
}

export async function searchActiveListings(
    filters: PropertyFilters,
    page = 1,
    limit = 10 
): Promise<ListingRow[]> {
    const offset = (page - 1) * limit;

    // Start with base SQL — always filter for Active listings only
    let sql = `
    SELECT
        L_ListingID,
        L_Address,
        L_City,
        L_Zip,
        L_SystemPrice AS price,
        L_Keyword2 AS beds,
        LM_Dec_3 AS baths,
        LM_Int2_3 AS sqft,
        L_Type_ AS type,
        L_Status AS status,
        YearBuilt,
        AssociationFee,
        DaysOnMarket,
        PoolPrivateYN,
        ViewYN,
        PhotoCount,
        LA1_UserFirstName AS agentFirstName,
        LA1_UserLastName AS agentLastName,
        LO1_OrganizationName AS officeName
        FROM rets_property
        WHERE L_Status = 'Active'
    `;
    
    const params: any[] = [];

    // Dynamically add filters — only include if the user specified them
    if (filters.city) {
        sql += " AND L_City = ?";
        params.push(filters.city);
    }
    if (filters.maxPrice) {
        sql += " AND L_SystemPrice <= ?";
        params.push(filters.maxPrice);
    }
    if (filters.beds) {
        sql += " AND L_Keyword2 >= ?";
        params.push(filters.beds);
    }
    if (filters.baths) {
        sql += " AND LM_Dec_3 >= ?";
        params.push(filters.baths);
    }
    if (filters.sqft) {
        sql += " AND LM_Int2_3 >= ?";
        params.push(filters.sqft);
    }
    if (filters.type) {
        sql += " AND L_Type_ = ?";
        params.push(filters.type);
    }
    if (filters.pool) {
        sql += " AND PoolPrivateYN = ?";
        params.push(filters.pool);
    }
    if (filters.hasView) {
        sql += " AND ViewYN = ?";
        params.push(filters.hasView);
    }

    // Sort cheapest first, paginate results
    sql += ` ORDER BY L_SystemPrice ASC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;
    return query<ListingRow>(sql, params);
}

// Format results for easy reading
function formatListing(listing: ListingRow): string {
    return `
        ${listing.L_Address}, ${listing.L_City} ${listing.L_Zip}
        $${listing.price?.toLocaleString()} | ${listing.beds}bd / ${listing
        .baths}ba | ${listing.sqft} sqft
        Built ${listing.YearBuilt} | ${listing.DaysOnMarket} days on market
        Pool: ${listing.PoolPrivateYN} | View: ${listing.ViewYN} | ${listing.PhotoCount} photos
        Agent: ${listing.agentFirstName} ${listing.agentLastName} | ${listing.officeName}
    `.trim();
}

//Test the search
async function main() {
    console.log("=== Testing Active Listing Search ===\n");

    // Test 1: Condos in Irvine under $1.5M
    console.log("Test 1: Condos in Irvine under $1.5M with pool");
    const results1 = await searchActiveListings({
        city: "Irvine",
        maxPrice: 1500000,
        type: "Condominium",
        pool: "True",
    });
    console.log(`Found ${results1.length} listings:`);
    results1.forEach(l => console.log(formatListing(l)));

    console.log("\n---\n");

    // Test 2: Single family homes in Pasadena under $900k
    console.log("Test 2: Single family in Pasadena under $900k");
    const results2 = await searchActiveListings({
        city: "Pasadena",
        maxPrice: 900000,
        type: "SingleFamilyResidence",
    });
    console.log(`Found ${results2.length} listings:`);
    results2.slice(0, 3).forEach(l => console.log(formatListing(l)));

    process.exit(0);
}

main();