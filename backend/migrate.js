require("dotenv").config();
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "smartseva_db",
});
const db = pool.promise();

async function migrate() {
  try {
    console.log("Adding new columns to complaints table...");
    await db.query(`ALTER TABLE complaints ADD COLUMN case_id VARCHAR(50) UNIQUE;`);
    await db.query(`ALTER TABLE complaints ADD COLUMN contractor_id INT NULL;`);
    await db.query(`ALTER TABLE complaints ADD COLUMN deadline DATE NULL;`);
    await db.query(`ALTER TABLE complaints ADD COLUMN contractor_status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending';`);
    await db.query(`ALTER TABLE complaints ADD COLUMN contractor_proof_url VARCHAR(255) NULL;`);
    await db.query(`ALTER TABLE complaints ADD FOREIGN KEY (contractor_id) REFERENCES users(id) ON DELETE SET NULL;`);
    console.log("Migration successful!");
  } catch (err) {

    // It might throw error if columns already exist  , but no problem with that error

    console.log("Migration error or columns already exist:", err.message);
  } finally {
    process.exit();
  }
}

migrate();
