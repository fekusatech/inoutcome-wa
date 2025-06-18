const { pool } = require('../config/database');
const WalletService = require('./walletService');

class TransactionService {
    // Parse transaction message with wallet support
    static parseTransactionMessage(message) {
        // First, try to parse wallet from message
        const walletInfo = WalletService.parseWalletFromMessage(message);
        let remainingMessage = message;
        let walletName = null;

        if (walletInfo) {
            walletName = walletInfo.walletName;
            remainingMessage = walletInfo.remainingMessage;
        }

        // Pattern for outcome (expenses): "beli/buy/tumbas [item] [quantity] [price]" or "beli/buy/tumbas [item] [price]" (qty=1)
        const outcomePatterns = [
            /^(beli|buy|tumbas)\s+([^\d]+)\s+(\d+)\s+(\d+)$/i,
            /^(beli|buy|tumbas)\s+([^\d]+)\s+(\d+)$/i
        ];

        // Pattern for income: "transfer dari [sender] [amount]" or "terima dari [sender] [amount]"
        const incomePatterns = [
            /^(transfer|terima)\s+dari\s+([^\d]+)\s+(\d+)$/i,
            /^(dari|from)\s+([^\d]+)\s+(\d+)$/i
        ];

        // Check for outcome patterns
        for (let pattern of outcomePatterns) {
            const match = remainingMessage.match(pattern);
            if (match) {
                const quantity = match[3] ? parseInt(match[3]) : 1;
                const price = match[4] ? parseFloat(match[4]) : parseFloat(match[3]);
                return {
                    type: 'outcome',
                    action: match[1].toLowerCase(),
                    itemName: match[2].trim(),
                    quantity: quantity,
                    price: price,
                    totalAmount: quantity * price,
                    sender: null,
                    walletName: walletName
                };
            }
        }

        // Check for income patterns
        for (let pattern of incomePatterns) {
            const match = remainingMessage.match(pattern);
            if (match) {
                return {
                    type: 'income',
                    action: match[1].toLowerCase(),
                    itemName: `Transfer dari ${match[2].trim()}`,
                    quantity: 1,
                    price: parseFloat(match[3]),
                    totalAmount: parseFloat(match[3]),
                    sender: match[2].trim(),
                    walletName: walletName
                };
            }
        }

        return null;
    }

    // Save transaction to database with wallet support
    static async saveTransaction(groupId, userId, userName, transactionData) {
        try {
            let walletId = null;
            
            // Get wallet ID if wallet name is provided
            if (transactionData.walletName) {
                const wallet = await WalletService.getWalletByName(groupId, transactionData.walletName);
                if (wallet) {
                    walletId = wallet.id;
                }
            }

            const [result] = await pool.execute(
                'INSERT INTO transactions (group_id, user_id, user_name, item_name, quantity, price, total_amount, transaction_category, sender, wallet_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [groupId, userId, userName, transactionData.itemName, transactionData.quantity, transactionData.price, transactionData.totalAmount, transactionData.type, transactionData.sender, walletId]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error saving transaction:', error);
            throw error;
        }
    }

    // Get pending transactions for a user in a group
    static async getPendingTransactions(groupId, userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM transactions WHERE group_id = ? AND user_id = ? AND transaction_type = "pending" ORDER BY created_at ASC',
                [groupId, userId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting pending transactions:', error);
            throw error;
        }
    }

    // Confirm transactions
    static async confirmTransactions(groupId, userId) {
        try {
            const [result] = await pool.execute(
                'UPDATE transactions SET transaction_type = "confirmed" WHERE group_id = ? AND user_id = ? AND transaction_type = "pending"',
                [groupId, userId]
            );
            return result.affectedRows;
        } catch (error) {
            console.error('Error confirming transactions:', error);
            throw error;
        }
    }

    // Reject transactions
    static async rejectTransactions(groupId, userId) {
        try {
            const [result] = await pool.execute(
                'UPDATE transactions SET transaction_type = "rejected" WHERE group_id = ? AND user_id = ? AND transaction_type = "pending"',
                [groupId, userId]
            );
            return result.affectedRows;
        } catch (error) {
            console.error('Error rejecting transactions:', error);
            throw error;
        }
    }

    // Generate transaction summary with wallet information
   static async generateTransactionSummary(transactions, groupId) {
       if (!transactions || transactions.length === 0) {
           return "Tidak ada transaksi yang pending.";
       }

       let summary = "📋 *Transaksi Anda:*\n\n";
       let totalIncome = 0;
       let totalOutcome = 0;
       let transactionIndex = 1;

       // Pisahkan income dan outcome
       const incomes = transactions.filter(t => t.transaction_category === 'income');
       const outcomes = transactions.filter(t => t.transaction_category === 'outcome');

       // Tampilkan pengeluaran terlebih dahulu
       if (outcomes.length > 0) {
           summary += "💸 *Pengeluaran:*\n";
           for (const transaction of outcomes) {
               const walletInfo = transaction.wallet_name ? ` (${transaction.wallet_name})` : '';
               const total = transaction.quantity * transaction.price;
               summary += `${transactionIndex++}. ${transaction.quantity} ${transaction.item_name}${walletInfo} - Rp ${total.toLocaleString()}\n`;
               totalOutcome += total;
           }
           summary += "\n";
       }

       // Tampilkan pemasukan
       if (incomes.length > 0) {
           summary += "💰 *Pemasukan:*\n";
           for (const transaction of incomes) {
               const walletInfo = transaction.wallet_name ? ` (${transaction.wallet_name})` : '';
               const total = transaction.quantity * transaction.price;
               summary += `${transactionIndex++}. ${transaction.item_name}${walletInfo} - Rp ${total.toLocaleString()}\n`;
               totalIncome += total;
           }
           summary += "\n";
       }

       // Tampilkan ringkasan
       summary += "📊 *Ringkasan:*\n";
       summary += `💸 Total Pengeluaran: Rp ${totalOutcome.toLocaleString()}\n`;
       summary += `💰 Total Pemasukan: Rp ${totalIncome.toLocaleString()}\n`;
       summary += `💵 Saldo: Rp ${(totalIncome - totalOutcome).toLocaleString()}\n\n`;

       // Tampilkan saldo dompet
       try {
           const wallets = await WalletService.getWallets(groupId);
           if (wallets && wallets.length > 0) {
               summary += "💼 *Saldo Dompet:*\n";
               wallets.forEach(wallet => {
                   const icon = WalletService.getWalletIcon(wallet.wallet_type);
                   summary += `${icon} ${wallet.wallet_name}: Rp ${wallet.balance.toLocaleString()}\n`;
               });
               summary += "\n";
           }
       } catch (error) {
           console.error('Error getting wallet balances:', error);
       }

       summary += "Balas *ya* jika ini sesuai, balas *tidak* jika ingin revisi";

       return summary;
   }

    // Clean up old sessions
    static async cleanupOldSessions() {
        try {
            await pool.execute('DELETE FROM transaction_sessions WHERE expires_at < NOW()');
        } catch (error) {
            console.error('Error cleaning up old sessions:', error);
        }
    }
}

module.exports = TransactionService; 