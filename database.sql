-- Create database
CREATE DATABASE IF NOT EXISTS inoutcome_db;
USE inoutcome_db;

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id VARCHAR(50) NOT NULL,
    wallet_name VARCHAR(100) NOT NULL,
    wallet_type ENUM('cash', 'bank', 'ewallet', 'other') NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(100),
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    transaction_category ENUM('income', 'outcome') NOT NULL,
    transaction_type ENUM('pending', 'confirmed', 'rejected') DEFAULT 'pending',
    wallet_id INT,
    sender VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE SET NULL
);

-- Create transaction_sessions table for temporary storage
CREATE TABLE IF NOT EXISTS transaction_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(100),
    session_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 1 HOUR)
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_group_id ON transactions(group_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_wallets_group_id ON wallets(group_id);
CREATE INDEX idx_wallets_wallet_type ON wallets(wallet_type);
CREATE INDEX idx_transaction_sessions_group_user ON transaction_sessions(group_id, user_id);
CREATE INDEX idx_transaction_sessions_expires_at ON transaction_sessions(expires_at);

-- Insert default wallets for the group
INSERT INTO wallets (group_id, wallet_name, wallet_type, balance) VALUES 
('120363418918054891@g.us', 'Cash', 'cash', 0.00),
('120363418918054891@g.us', 'Mandiri', 'bank', 0.00),
('120363418918054891@g.us', 'GoPay', 'ewallet', 0.00),
('120363418918054891@g.us', 'OVO', 'ewallet', 0.00),
('120363418918054891@g.us', 'DANA', 'ewallet', 0.00);

-- Insert sample data (optional)
-- INSERT INTO transactions (group_id, user_id, user_name, item_name, quantity, price, total_amount) 
-- VALUES ('120363418918054891@g.us', '1234567890@c.us', 'John Doe', 'Eskopi', 1, 30000.00, 30000.00); 