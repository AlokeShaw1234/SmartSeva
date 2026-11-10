const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),

    ssl: {
        rejectUnauthorized: false
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});

async function ensureColumn(table, column, definition) {
    try {
        const [cols] = await db.query(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
            [table, column]
        );
        if (cols.length === 0) {
            await db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
            console.log(`Added column ${column} to table ${table}`);
        }
    } catch (e) {
        console.warn(`Column check/addition error (${column}):`, e.message);
    }
}

async function createTables() {
    try {
        await db.query("SELECT 1");
        console.log("Database connected successfully");

        const sqlPath = path.join(
            __dirname,
            "..",
            "database",
            "myschema.sql"
        );

        if (fs.existsSync(sqlPath)) {
            const sql = fs.readFileSync(sqlPath, "utf8");
            await db.query(sql);
            console.log("MySQL schema executed successfully");
        }

        // Ensure required columns in complaints table in case it was created previously
        await ensureColumn("complaints", "contractor_id", "INT NULL");
        await ensureColumn("complaints", "deadline", "DATE NULL");
        await ensureColumn("complaints", "contractor_status", "VARCHAR(50) DEFAULT 'Pending'");
        await ensureColumn("complaints", "contractor_proof_url", "VARCHAR(255) NULL");

        console.log("Database tables verified and ready");

    } catch (error) {
        console.error("Database initialization error:", error.message);
        throw error;
    }
}

module.exports = {
    db,
    createTables
};
