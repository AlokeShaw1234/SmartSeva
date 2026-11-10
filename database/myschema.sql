-- =====================================================
-- SMARTSEVA DATABASE SCHEMA
-- =====================================================

CREATE DATABASE IF NOT EXISTS smartseva;

USE smartseva;

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    mobile VARCHAR(10) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- =====================================================
-- 2. CONTRACTORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contractors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('contractor') NOT NULL DEFAULT 'contractor',
    category VARCHAR(100) NOT NULL
);

-- =====================================================
-- 3. COMPLAINTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id VARCHAR(50) UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_path VARCHAR(255),
    mobile_no VARCHAR(10) NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Submitted',
    contractor_id INT NULL,
    deadline DATE NULL,
    contractor_status VARCHAR(50) DEFAULT 'Pending',
    contractor_proof_url VARCHAR(255) NULL,
    FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE SET NULL
);

-- =====================================================
-- 4. COMPLAINT STATUS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS complaint_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    status ENUM('Pending', 'In Progress', 'Resolved') NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- =====================================================
-- 5. CONTRACTOR STATUS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contractor_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    contractor_id INT NOT NULL,
    status ENUM('Pending', 'Accepted', 'Rejected') NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE CASCADE
);

-- =====================================================
-- 6. CONTRACTOR PROOF TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contractor_proof (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    contractor_id INT NOT NULL,
    contractor_proof_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE CASCADE
);

-- =====================================================
-- 7. SEED DEFAULT CONTRACTORS
-- =====================================================
INSERT INTO contractors (id, name, email, password, role, category) VALUES
(1, 'Water Care Services', 'water@smartseva.com', '12345', 'contractor', 'WATER SUPPLY'),
(2, 'City Drainage Solutions', 'drainage@smartseva.com', '12345', 'contractor', 'DRAINAGE'),
(3, 'Bright Lights Electricals', 'streetlight@smartseva.com', '12345', 'contractor', 'BROKEN STREETLIGHTS'),
(4, 'Rapid Road Repairs', 'potholes@smartseva.com', '12345', 'contractor', 'POTHOLES'),
(5, 'Green Tree Arborists', 'treefall@smartseva.com', '12345', 'contractor', 'TREE FALL'),
(6, 'Clean City Waste Mgmt', 'trash@smartseva.com', '12345', 'contractor', 'OVERFLOW TRASH BINS')
ON DUPLICATE KEY UPDATE name=VALUES(name), category=VALUES(category);
