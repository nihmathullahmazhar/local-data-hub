-- SQL script to create the leads table in MySQL/Sequel Ace
-- Run this in your CRM database

CREATE TABLE IF NOT EXISTS `leads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `date` DATE,
  `business_name` VARCHAR(255),
  `client_name` VARCHAR(255),
  `country` VARCHAR(100),
  `platform` VARCHAR(100),
  `industry` VARCHAR(100),
  `contact_info` TEXT,
  
  -- Sales Pipeline
  `lead_status` VARCHAR(50) DEFAULT 'New',
  `contacted` TINYINT(1) DEFAULT 0,
  `replied` TINYINT(1) DEFAULT 0,
  `demo_sent` TINYINT(1) DEFAULT 0,
  `interested` TINYINT(1) DEFAULT 0,
  `next_follow_up` DATE,
  
  -- Project Details
  `package_type` VARCHAR(50),
  `project_type` VARCHAR(50),
  `project_scope` TEXT,
  `services` JSON,
  
  -- Pricing
  `currency` VARCHAR(10) DEFAULT 'LKR',
  `exchange_rate` DECIMAL(10, 4) DEFAULT 1,
  `final_value` DECIMAL(15, 2) DEFAULT 0,
  `advance_scheme` VARCHAR(20) DEFAULT '50',
  `advance_amount` DECIMAL(15, 2) DEFAULT 0,
  `balance_amount` DECIMAL(15, 2) DEFAULT 0,
  `payment_method` VARCHAR(50),
  `amount_in_lkr` DECIMAL(15, 2) DEFAULT 0,
  
  -- Payments
  `advance_paid` TINYINT(1) DEFAULT 0,
  `advance_date` DATE,
  `advance_method` VARCHAR(50),
  `advance_proof` TINYINT(1) DEFAULT 0,
  `advance_date_received` DATE,
  `balance_paid` TINYINT(1) DEFAULT 0,
  `balance_date` DATE,
  `balance_method` VARCHAR(50),
  `balance_proof` TINYINT(1) DEFAULT 0,
  `balance_date_received` DATE,
  
  -- Delivery
  `expected_delivery` DATE,
  `actual_delivery` DATE,
  `project_completed` TINYINT(1) DEFAULT 0,
  `revisions_included` INT DEFAULT 2,
  `revision_notes` TEXT,
  `delivery_features` JSON,
  
  -- Admin
  `free_domain` TINYINT(1) DEFAULT 0,
  `domain_name` VARCHAR(255),
  `domain_provider` VARCHAR(100),
  `hosting_provider` VARCHAR(100),
  `renewal_agreement` TINYINT(1) DEFAULT 0,
  `domain_renewal` DATE,
  `hosting_renewal` DATE,
  `repeat_client` TINYINT(1) DEFAULT 0,
  `agreement_link` TEXT,
  `agreement_file_name` VARCHAR(255),
  
  -- Notes
  `notes` TEXT,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index for common queries
CREATE INDEX idx_lead_status ON leads(lead_status);
CREATE INDEX idx_date ON leads(date);
CREATE INDEX idx_business_name ON leads(business_name);