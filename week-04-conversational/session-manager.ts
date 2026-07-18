// session-manager.ts
// Manages per-user conversation state.
// Each user gets their own "session" — a notepad of what they've told us.
// When they add more info, we update the notepad.
// When the conversation ends, we clear the notepad.
interface ListingRow {
    L_Address: string;
    L_City: string;
    price: number;
    beds: number;
    baths: number;
    sqft: number;
}

interface UserSession {
    city?: string;
    maxPrice?: number;
    beds?: number;
    baths?: number;
    type?: string;
    pool?: string;
    lastResults?: ListingRow[];
    conversationStep: number; // tracks where we are in the conversation
}

// Store all sessions in memory (Map = like a dictionary)
// Key = userId (e.g. phone number), Value = their session data
const sessions = new Map<string, UserSession>();

// Get a user's session — create one if they're new
export function getSession(userId: string): UserSession {
    if (!sessions.has(userId)) {
    sessions.set(userId, { conversationStep: 0 });
    }
    return sessions.get(userId)!;
}

// Update a user's session with new info (merges with existing data)
export function updateSession(userId: string, updates: Partial<UserSession>) {
    const session = getSession(userId);
    sessions.set(userId, { ...session, ...updates });
}

// Clear a user's session (start fresh)
export function clearSession(userId: string) {
    sessions.delete(userId);
    console.log(`Session cleared for user: ${userId}`);
}

// Show what's in a session (for debugging)
export function showSession(userId: string) {
    const session = getSession(userId);
    console.log(`Session for ${userId}:`, JSON.stringify(session, null, 2));
}