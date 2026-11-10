const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const crypto = require("crypto");

require("dotenv").config();

const { db, createTables } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const fileName = Date.now() + "-" + crypto.randomBytes(4).toString("hex") + ext;
        cb(null, fileName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp",
            "video/mp4",
            "video/webm",
            "video/quicktime"
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only image and video files are allowed"));
        }
    }
});

// =====================================
// ROOT TEST API
// =====================================
app.get("/", (req, res) => {
    res.send("SmartSeva Backend is Running!");
});

// =====================================
// USERS API
// =====================================
app.post("/users", async (req, res) => {
    try {
        const { firstName, lastName, mobile, password } = req.body;

        if (!firstName || !lastName || !mobile || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (!/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid 10-digit mobile number"
            });
        }

        const [existingUsers] = await db.query(
            "SELECT id FROM users WHERE mobile = ?",
            [mobile]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Mobile number already exists"
            });
        }

        const sql = `
            INSERT INTO users (first_name, last_name, mobile, password)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.query(sql, [firstName, lastName, mobile, password]);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            userId: result.insertId
        });
    } catch (error) {
        console.error("User registration error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to save user data"
        });
    }
});

// =====================================
// CITIZEN SUBMIT COMPLAINT
// =====================================
app.post("/submitComplaint", upload.single("media"), async (req, res) => {
    try {
        const { category, subject, description, mobile, location } = req.body;

        if (!category || !subject || !description || !mobile || !location) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }

        if (!/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: "Invalid mobile number"
            });
        }

        let image_path = null;
        if (req.file) {
            image_path = "/uploads/" + req.file.filename;
        }

        const case_id = "CASE-" + Date.now();

        const sql = `
            INSERT INTO complaints
            (case_id, subject, description, category, image_path, mobile_no, location, status, contractor_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Submitted', 'Pending')
        `;

        await db.query(sql, [
            case_id,
            subject,
            description,
            category.trim().toUpperCase(),
            image_path,
            mobile,
            location
        ]);

        console.log("Complaint created:", case_id, "Category:", category);

        res.status(201).json({
            success: true,
            message: "Complaint submitted successfully",
            case_id: case_id,
            category: category,
            image_path: image_path
        });
    } catch (error) {
        console.error("Complaint submission error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit complaint"
        });
    }
});

// =====================================
// CITIZEN TRACK COMPLAINT BY CASE ID
// =====================================
app.get(["/api/submitComplaint/case/:caseId", "/submitComplaint/:caseId"], async (req, res) => {
    try {
        const caseId = req.params.caseId.trim();

        if (!caseId) {
            return res.status(400).json({
                success: false,
                message: "Case ID is required"
            });
        }

        const sql = `
            SELECT
                c.case_id,
                c.subject,
                c.description,
                c.category,
                c.status,
                c.location,
                c.mobile_no,
                c.image_path,
                c.image_path AS media_url,
                c.deadline,
                c.created_at,
                c.contractor_status,
                c.contractor_proof_url,
                k.name AS contractor_name
            FROM complaints c
            LEFT JOIN contractors k ON c.contractor_id = k.id
            WHERE c.case_id = ?
            LIMIT 1
        `;

        const [rows] = await db.query(sql, [caseId]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Case not found. Please check your Case ID."
            });
        }

        const complaint = rows[0];

        return res.status(200).json({
            success: true,
            case_id: complaint.case_id,
            subject: complaint.subject,
            description: complaint.description,
            category: complaint.category,
            status: complaint.status,
            deadline: complaint.deadline,
            created_at: complaint.created_at,
            image_path: complaint.image_path,
            media_url: complaint.media_url,
            contractor_status: complaint.contractor_status,
            contractor_proof_url: complaint.contractor_proof_url,
            contractor_name: complaint.contractor_name
        });
    } catch (error) {
        console.error("Track case error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to track complaint at the moment"
        });
    }
});

// =====================================
// ADMIN DASHBOARD - FETCH ALL COMPLAINTS
// =====================================
app.get("/api/complaints", async (req, res) => {
    try {
        const sql = `
            SELECT
                c.id,
                c.case_id,
                c.subject,
                c.description,
                c.category,
                c.location,
                c.mobile_no,
                c.image_path,
                c.image_path AS media_url,
                c.created_at,
                c.status,
                c.deadline,
                c.contractor_id,
                COALESCE(c.contractor_status, 'Pending') AS contractor_status,
                c.contractor_proof_url,
                k.name AS contractor_name
            FROM complaints c
            LEFT JOIN contractors k ON c.contractor_id = k.id
            ORDER BY c.created_at DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (error) {
        console.error("Fetch complaints error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch complaints"
        });
    }
});

// =====================================
// CONTRACTORS LIST (FOR ASSIGN MODAL)
// =====================================
app.get("/api/contractors", async (req, res) => {
    try {
        const { category } = req.query;
        let sql = "SELECT id, name, email, category FROM contractors WHERE role = 'contractor'";
        const params = [];

        if (category) {
            sql += " AND UPPER(TRIM(category)) = UPPER(TRIM(?))";
            params.push(category);
        }

        sql += " ORDER BY name ASC";
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("Contractors list error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch contractors"
        });
    }
});

// =====================================
// ADMIN ASSIGN COMPLAINT TO CONTRACTOR WITH DEADLINE
// =====================================
const assignComplaintHandler = async (req, res) => {
    try {
        const { caseId } = req.params;
        const { contractor_id, deadline } = req.body;

        if (!contractor_id) {
            return res.status(400).json({
                success: false,
                message: "Contractor ID is required"
            });
        }

        // Verify contractor
        const [contractors] = await db.query(
            "SELECT id, name, category FROM contractors WHERE id = ? AND role = 'contractor'",
            [contractor_id]
        );

        if (contractors.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Contractor not found"
            });
        }

        const contractor = contractors[0];

        // Update complaint with contractor_id, deadline, status
        const [result] = await db.query(
            `UPDATE complaints
             SET contractor_id = ?,
                 deadline = ?,
                 status = 'Assigned',
                 contractor_status = 'Pending'
             WHERE case_id = ?`,
            [contractor_id, deadline || null, caseId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        return res.json({
            success: true,
            message: "Complaint assigned successfully",
            contractor: contractor.name,
            case_id: caseId,
            deadline: deadline
        });
    } catch (error) {
        console.error("Assignment error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to assign complaint"
        });
    }
};

app.put("/api/complaints/assign/:caseId", assignComplaintHandler);
app.put("/api/admin/complaints/:caseId/assign", assignComplaintHandler);

// =====================================
// ADMIN UPDATE COMPLAINT STATUS
// =====================================
app.put("/api/complaints/:caseId/status", async (req, res) => {
    try {
        const { caseId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }

        const [result] = await db.query(
            "UPDATE complaints SET status = ? WHERE case_id = ?",
            [status, caseId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        res.json({
            success: true,
            message: `Status updated to ${status}`
        });
    } catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update status"
        });
    }
});

// =====================================
// CONTRACTOR DASHBOARD - FETCH ASSIGNED COMPLAINTS
// =====================================
const contractorComplaintsHandler = async (req, res) => {
    try {
        const contractorId = req.params.contractorId || req.query.contractor_id;
        const category = req.query.category;

        let sql = `
            SELECT
                c.id,
                c.case_id,
                c.subject,
                c.description,
                c.category,
                c.image_path,
                c.image_path AS media_url,
                c.location,
                c.mobile_no,
                c.status,
                c.deadline,
                c.contractor_id,
                COALESCE(c.contractor_status, 'Pending') AS contractor_status,
                c.contractor_proof_url,
                c.created_at,
                k.name AS contractor_name
            FROM complaints c
            LEFT JOIN contractors k ON c.contractor_id = k.id
            WHERE c.contractor_id IS NOT NULL
        `;
        const params = [];

        if (contractorId && category) {
            sql += ` AND (c.contractor_id = ? OR UPPER(TRIM(c.category)) = UPPER(TRIM(?)))`;
            params.push(contractorId, category);
        } else if (contractorId) {
            sql += ` AND c.contractor_id = ?`;
            params.push(contractorId);
        } else if (category) {
            sql += ` AND UPPER(TRIM(c.category)) = UPPER(TRIM(?))`;
            params.push(category);
        }

        sql += ` ORDER BY c.created_at DESC`;

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) {
        console.error("Contractor complaints error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch contractor complaints"
        });
    }
};

app.get("/api/complaints/contractor", contractorComplaintsHandler);
app.get("/api/complaints/contractor/:contractorId", contractorComplaintsHandler);
app.get("/contractor/:id/complaints/:contractorId", contractorComplaintsHandler);
app.get("/api/water-contractor/:contractorId/complaints", contractorComplaintsHandler);

// =====================================
// CONTRACTOR ACCEPT OR REJECT CONTRACT
// =====================================
const contractorStatusHandler = async (req, res) => {
    try {
        const { caseId } = req.params;
        const { contractor_status } = req.body;

        if (!contractor_status) {
            return res.status(400).json({
                success: false,
                message: "Contractor status is required (Accepted or Rejected)"
            });
        }

        let updateSql = `
            UPDATE complaints
            SET contractor_status = ?,
                status = CASE 
                    WHEN ? = 'Accepted' THEN 'In Progress'
                    WHEN ? = 'Rejected' THEN 'Submitted'
                    ELSE status 
                END,
                contractor_id = CASE
                    WHEN ? = 'Rejected' THEN NULL
                    ELSE contractor_id
                END
            WHERE case_id = ?
        `;

        const [result] = await db.query(updateSql, [
            contractor_status,
            contractor_status,
            contractor_status,
            contractor_status,
            caseId
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        res.json({
            success: true,
            message: `Contract status updated to ${contractor_status}`
        });
    } catch (error) {
        console.error("Contractor status update error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update contractor status"
        });
    }
};

app.put("/api/complaints/contractor-status/:caseId", contractorStatusHandler);
app.put("/submitComplaint/contractor-status/:caseId", contractorStatusHandler);

// =====================================
// CONTRACTOR UPLOAD WORK PROOF
// =====================================
const proofUploadHandler = async (req, res) => {
    try {
        const { caseId } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload proof media"
            });
        }

        const proofPath = "/uploads/" + req.file.filename;

        const [complaints] = await db.query(
            "SELECT id, contractor_id FROM complaints WHERE case_id = ?",
            [caseId]
        );

        if (complaints.length === 0) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        const complaint = complaints[0];

        // Update complaints table with proof URL and Completed status
        await db.query(
            `UPDATE complaints
             SET contractor_proof_url = ?,
                 contractor_status = 'Completed'
             WHERE case_id = ?`,
            [proofPath, caseId]
        );

        // Record in contractor_proof table
        if (complaint.contractor_id) {
            await db.query(
                `INSERT INTO contractor_proof (complaint_id, contractor_id, contractor_proof_url)
                 VALUES (?, ?, ?)`,
                [complaint.id, complaint.contractor_id, proofPath]
            );
        }

        res.json({
            success: true,
            message: "Proof uploaded successfully",
            proof_url: proofPath
        });
    } catch (error) {
        console.error("Proof upload error:", error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: "Proof upload failed"
        });
    }
};

app.post("/api/complaints/proof/:caseId", upload.single("proof_media"), proofUploadHandler);
app.post("/api/contractor/proof/:caseId", upload.single("proof_media"), proofUploadHandler);
app.post("/submitComplaint/proof/:caseId", upload.single("proof_media"), proofUploadHandler);

// =====================================
// CONTRACTOR LOGIN (DYNAMIC)
// =====================================
app.post(["/contractor/login", "/contractorform"], async (req, res) => {
    try {
        const { email, idOrEmail, password, category } = req.body;
        const loginIdentifier = email || idOrEmail;

        let sql = "SELECT id, name, email, password, role, category FROM contractors WHERE role = 'contractor'";
        const params = [];

        if (loginIdentifier) {
            sql += " AND (email = ? OR id = ? OR name = ?)";
            params.push(loginIdentifier, loginIdentifier, loginIdentifier);
        } else if (category) {
            sql += " AND UPPER(TRIM(category)) = UPPER(TRIM(?))";
            params.push(category);
        }

        const [contractors] = await db.query(sql, params);

        if (contractors.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Contractor account not found"
            });
        }

        const contractor = contractors[0];

        if (password && contractor.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        res.json({
            success: true,
            message: "Login successful",
            contractor: {
                id: contractor.id,
                name: contractor.name,
                email: contractor.email,
                category: contractor.category
            }
        });
    } catch (error) {
        console.error("Contractor login error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during contractor login"
        });
    }
});

// Multer error handler
app.use((error, req, res, next) => {
    console.error(error);
    if (error instanceof multer.MulterError || error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    next();
});

// =====================================
// SERVER START
// =====================================
async function startServer() {
    try {
        await createTables();
        app.listen(PORT, () => {
            console.log(`SmartSeva server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Server could not start:", error.message);
    }
}

startServer();
