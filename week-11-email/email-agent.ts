// Email drafting + approval workflow.
//
// SAFETY RULE:
// Emails are NEVER sent automatically.
//
// Step 1: draft()
// Creates a draft and shows a preview.
//
// Step 2: approveAndSend()
// Sends ONLY after explicit human confirmation.
//
// This implements human-in-the-loop safety.

import {
  listingAlertTemplate,
  marketReportTemplate
} from "./email-templates.ts";


// ----------------------------------------------------
// Email Draft Type
// ----------------------------------------------------

interface EmailDraft {
  id: string;
  to: string;
  subject: string;
  body: string;

  status:
    | "pending_approval"
    | "approved"
    | "sent"
    | "rejected";

  createdAt: Date;
}


// ----------------------------------------------------
// Pending Draft Store
// ----------------------------------------------------

const draftQueue =
  new Map<string, EmailDraft>();


// ----------------------------------------------------
// Step 1: Draft
// NEVER sends an email
// ----------------------------------------------------

export function draftEmail(
  to: string,
  subject: string,
  body: string
): EmailDraft {

  const id = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const draft: EmailDraft = {
    id,
    to,
    subject,
    body,
    status: "pending_approval",
    createdAt: new Date()
  };

  draftQueue.set(id, draft);

  console.log(
    "\n📧 EMAIL DRAFT CREATED (NOT SENT)"
  );

  console.log(
    "================================"
  );

  console.log(
    `Draft ID: ${id}`
  );

  console.log(
    `To: ${to}`
  );

  console.log(
    `Subject: ${subject}`
  );

  console.log(
    `Status: ${draft.status}`
  );

  console.log(
    "================================"
  );

  console.log(
    "⚠️ This email has NOT been sent. Approval required."
  );

  return draft;
}


// ----------------------------------------------------
// Step 2: Approve and Send
// ----------------------------------------------------

export async function approveAndSend(
  draftId: string
): Promise<void> {

  const draft =
    draftQueue.get(draftId);

  if (!draft) {

    console.log(
      `❌ Draft ${draftId} not found`
    );

    return;
  }


  if (
    draft.status !==
    "pending_approval"
  ) {

    console.log(
      `❌ Draft ${draftId} is not pending approval (status: ${draft.status})`
    );

    return;
  }


  // Human approval has been explicitly given.
  draft.status = "approved";


  // IMPORTANT:
  // This Week 11 test SIMULATES sending.
  //
  // In production, nodemailer would be called here,
  // but only AFTER explicit approval.


  console.log(
    `\n✅ Email APPROVED AND SENT to ${draft.to}`
  );

  console.log(
    `   Subject: ${draft.subject}`
  );

  draft.status = "sent";
}


// ----------------------------------------------------
// Reject Draft
// ----------------------------------------------------

export function rejectDraft(
  draftId: string
): void {

  const draft =
    draftQueue.get(draftId);

  if (draft) {

    draft.status =
      "rejected";

    console.log(
      `🚫 Draft ${draftId} rejected - email will NOT be sent`
    );
  }
}


// ----------------------------------------------------
// High-Level Helper:
// Listing Alert
// ----------------------------------------------------

export function draftListingAlert(
  to: string,
  listings: any[]
): EmailDraft {

  return draftEmail(

    to,

    "🏠 New Listings Match Your Search - IDX Exchange",

    listingAlertTemplate(
      listings
    )
  );
}


// ----------------------------------------------------
// High-Level Helper:
// Market Report
// ----------------------------------------------------

export function draftMarketReport(
  to: string,
  stats: any
): EmailDraft {

  return draftEmail(

    to,

    `📊 Weekly Market Report: ${stats.city} - IDX Exchange`,

    marketReportTemplate(
      stats
    )
  );
}


// ----------------------------------------------------
// Safety Test Suite
// ----------------------------------------------------

async function main() {

  console.log(
    "=== Email Agent Safety Test ===\n"
  );


  const mockListings = [
    {
      L_Address: "123 Oak St",
      L_City: "Irvine",
      price: 950000,
      beds: 3,
      baths: 2,
      sqft: 1800,
      DaysOnMarket: 12
    }
  ];


  const mockStats = {
    city: "Irvine",
    avgClosePrice: 1250000,
    avgPricePerSqft: 650,
    avgDaysOnMarket: 18,
    listToCloseRatio: 101.2,
    soldCount: 342
  };


  // Test 1
  console.log(
    "Test 1: Draft a listing alert"
  );

  const draft1 =
    draftListingAlert(
      "buyer@example.com",
      mockListings
    );


  // Test 2
  console.log(
    "\nTest 2: Approve and send"
  );

  await approveAndSend(
    draft1.id
  );


  // Test 3
  console.log(
    "\nTest 3: Draft market report then reject"
  );

  const draft2 =
    draftMarketReport(
      "agent@example.com",
      mockStats
    );

  rejectDraft(
    draft2.id
  );


  // Test 4
  console.log(
    "\nTest 4: Try to send rejected draft"
  );

  await approveAndSend(
    draft2.id
  );
}


main();