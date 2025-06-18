const { pool } = require('../config/database');

class WalletService {
    // Get all wallets for a group
    static async getWallets(groupId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM wallets WHERE group_id = ? AND is_active = TRUE ORDER BY wallet_type, wallet_name',
                [groupId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting wallets:', error);
            throw error;
        }
    }

    // Get wallet by name
    static async getWalletByName(groupId, walletName) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM wallets WHERE group_id = ? AND wallet_name = ? AND is_active = TRUE',
                [groupId, walletName]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting wallet by name:', error);
            throw error;
        }
    }

    // Create new wallet
    static async createWallet(groupId, walletName, walletType) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO wallets (group_id, wallet_name, wallet_type) VALUES (?, ?, ?)',
                [groupId, walletName, walletType]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating wallet:', error);
            throw error;
        }
    }

    // Update wallet balance
    static async updateWalletBalance(walletId, amount, isIncome = false) {
        try {
            const balanceChange = isIncome ? amount : -amount;
            const [result] = await pool.execute(
                'UPDATE wallets SET balance = balance + ? WHERE id = ?',
                [balanceChange, walletId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating wallet balance:', error);
            throw error;
        }
    }

    // Get wallet balance
    static async getWalletBalance(walletId) {
        try {
            const [rows] = await pool.execute(
                'SELECT balance FROM wallets WHERE id = ?',
                [walletId]
            );
            return rows[0] ? rows[0].balance : 0;
        } catch (error) {
            console.error('Error getting wallet balance:', error);
            throw error;
        }
    }

    // Get total balance for all wallets in a group
    static async getTotalBalance(groupId) {
        try {
            const [rows] = await pool.execute(
                'SELECT SUM(balance) as total_balance FROM wallets WHERE group_id = ? AND is_active = TRUE',
                [groupId]
            );
            return rows[0].total_balance || 0;
        } catch (error) {
            console.error('Error getting total balance:', error);
            throw error;
        }
    }

    // Parse wallet from message
    static parseWalletFromMessage(message) {
        // Pattern: "[wallet_name] [transaction]"
        const walletPatterns = [
            /^(cash|mandiri|gopay|ovo|dana)\s+(.+)$/i,
            /^([a-zA-Z]+)\s+(.+)$/i
        ];

        for (let pattern of walletPatterns) {
            const match = message.match(pattern);
            if (match) {
                return {
                    walletName: match[1].toLowerCase(),
                    remainingMessage: match[2].trim()
                };
            }
        }
        return null;
    }

    // Get wallet type icon
    static getWalletIcon(walletType) {
        const icons = {
            'cash': '💵',
            'bank': '🏦',
            'ewallet': '📱',
            'other': '💳'
        };
        return icons[walletType] || '💳';
    }

    // Format wallet list for display
    static formatWalletList(wallets) {
        if (!wallets || wallets.length === 0) {
            return "Tidak ada dompet yang tersedia.";
        }

        let formatted = "💼 *Daftar Dompet:*\n\n";
        wallets.forEach((wallet, index) => {
            const icon = this.getWalletIcon(wallet.wallet_type);
            formatted += `${index + 1}. ${icon} ${wallet.wallet_name}\n`;
            formatted += `   Saldo: Rp ${wallet.balance.toLocaleString()}\n\n`;
        });

        return formatted;
    }
}

module.exports = WalletService; 