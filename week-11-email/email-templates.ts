// HTML email templates for listing alerts and market reports.


// Template 1: New listing alert
export function listingAlertTemplate(listings: any[]): string {

  const items = listings.map((l) => `
    <tr>
      <td style="padding:12px; border-bottom:1px solid #eee;">
        <strong>${l.L_Address}, ${l.L_City}</strong><br>
        💰 $${l.price?.toLocaleString()} |
        🛏 ${l.beds}bd/${l.baths}ba |
        📐 ${l.sqft} sqft<br>
        <span style="color:#888;">
          ⏱ ${l.DaysOnMarket} days on market
        </span>
      </td>
    </tr>
  `).join("");

  return `
    <html>
      <body style="font-family:Arial, sans-serif; max-width:600px; margin:0 auto;">
        <h2 style="color:#1a73e8;">🏠 New Listings Alert</h2>

        <p>
          Here are the latest properties matching your saved search:
        </p>

        <table width="100%" cellpadding="0" cellspacing="0">
          ${items}
        </table>

        <p style="color:#888; font-size:12px;">
          Powered by IDX Exchange AI Assistant
        </p>
      </body>
    </html>
  `;
}


// Template 2: Weekly market report
export function marketReportTemplate(stats: any): string {

  const trend =
    stats.listToCloseRatio >= 100
      ? "🔥 Seller's Market"
      : "🧊 Buyer's Market";

  return `
    <html>
      <body style="font-family:Arial, sans-serif; max-width:600px; margin:0 auto;">

        <h2 style="color:#1a73e8;">
          📊 Weekly Market Report: ${stats.city}
        </h2>

        <table
          width="100%"
          style="border-collapse:collapse;"
        >

          <tr style="background:#f5f5f5;">
            <td style="padding:10px;">
              <strong>Avg Close Price</strong>
            </td>

            <td style="padding:10px;">
              $${stats.avgClosePrice?.toLocaleString()}
            </td>
          </tr>

          <tr>
            <td style="padding:10px;">
              <strong>Price per sqft</strong>
            </td>

            <td style="padding:10px;">
              $${stats.avgPricePerSqft}
            </td>
          </tr>

          <tr style="background:#f5f5f5;">
            <td style="padding:10px;">
              <strong>Avg Days on Market</strong>
            </td>

            <td style="padding:10px;">
              ${stats.avgDaysOnMarket}
            </td>
          </tr>

          <tr>
            <td style="padding:10px;">
              <strong>List-to-Close Ratio</strong>
            </td>

            <td style="padding:10px;">
              ${stats.listToCloseRatio}% - ${trend}
            </td>
          </tr>

          <tr style="background:#f5f5f5;">
            <td style="padding:10px;">
              <strong>Homes Sold (12mo)</strong>
            </td>

            <td style="padding:10px;">
              ${stats.soldCount}
            </td>
          </tr>

        </table>

        <p style="color:#888; font-size:12px;">
          Powered by IDX Exchange AI Assistant
        </p>

      </body>
    </html>
  `;
}