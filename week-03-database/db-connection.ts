// db-connection.ts
// This file opens a connection pool to our MySQL database.
// A "pool" means we keep multiple connections open at once
// so we don't have to wait to connect every single time we query.

import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

// Create the connection pool using our .env credentials
export const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || ""
    ,
    database: process.env.MYSQL_DATABASE || "idx_exchange",
    waitForConnections: true,
    connectionLimit: 10, // max 10 connections at once
    queueLimit: 0,
});

// Generic query function — pass in SQL and parameters, get back rows
export async function query<T>(sql: string, params: any[] = []): Promise<T[]> {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
}

// Test the connection
export async function testConnection() {
    try {
        const result = await query<{ count: number }>(
            "SELECT COUNT(*) as count FROM rets_property"
        );
        console.log(`Connected! rets_property has ${result[0].count} listings.`);
    } catch (err) {
        console.error("Connection failed:", err);
    }
}

testConnection();