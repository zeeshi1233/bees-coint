
import transactionSchema from '../model/TransactionSchema.js';
import User from '../model/UserSchema.js';
import { initiatePixDeposit, initiatePixWithdrawal } from '../utils/syncpayService.js';

export const createTransaction = async (req, res) => {
  const { user, amount, type, method } = req.body;

  try {    
    const userData = await User.findById(user);
    console.log(userData);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const transaction = new transactionSchema({
      user: userData,
      amount,
      transactionType: type,
      method,
      status: 'pending', // same for both deposit and withdraw
    });

    await transaction.save();

    let syncpayResponse = null;

    // Deposit via PIX: Call SyncPay immediately
    if (type === 'deposit' && method === 'PIX') {
      syncpayResponse = await initiatePixDeposit({ amount, userData });

      return res.status(201).json({
        message: 'Deposit transaction created successfully',
        transaction,
        pixInfo: syncpayResponse || null,
      });
    }

    // Withdraw via PIX: Just save, wait for admin approval
    if (type === 'withdraw' && method === 'PIX') {
      return res.status(201).json({
        message: 'Withdrawal request submitted. Awaiting admin approval.',
        transaction,
      });
    }

    res.status(400).json({ message: 'Invalid transaction type or method' });

  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all transactions for a user
export const getUserTransactions = async (req, res) => {
  try {
    const transactions = await transactionSchema.find({ userId: req.params.id });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update transaction status (e.g., after a withdrawal is approved)
export const updateTransactionStatus = async (req, res) => {
  const { transactionId, status, method } = req.body;

  try {
    const transaction = await transactionSchema.findById(transactionId);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    // Check if method is being updated, if it's required, make sure it's provided
    if (method && !['PIX', 'Crypto', 'Card'].includes(method)) {
      return res.status(400).json({ message: 'Invalid method' });
    }

    // Only update the status, and method (if provided)
    transaction.status = status;
    if (method) transaction.method = method;  // Update method if it’s provided

    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};



export const approveWithdrawal = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction =await transactionSchema.findById(id).populate({ path: 'user', strictPopulate: false });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    if (transaction.transactionType !== 'withdraw' || transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Invalid withdrawal request' });
    }

    // Initiate withdrawal with SyncPay
     console.log(transaction.amount,transaction.user);
     
    const syncpayResponse = await initiatePixWithdrawal({
      amount: transaction.amount,
      user: transaction.user,
    });

    transaction.status = 'pending';
    transaction.externalId = syncpayResponse.id; // optional, if SyncPay returns one
    await transaction.save();

    res.status(200).json({
      message: 'Withdrawal approved and initiated',
      transaction,
      syncpayResponse,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve withdrawal', error: error.message });
  }
};

export const rejectWithdrawal = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await transactionSchema.findById(id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    if (transaction.transactionType !== 'withdraw' || transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Invalid withdrawal request' });
    }

    transaction.status = 'rejected';
    await transaction.save();

    res.status(200).json({ message: 'Withdrawal request rejected', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject withdrawal', error: error.message });
  }
};



export const GetTransactionLive = async (req, res) => {
  const { transaction_id, status } = req.body;

  try {
    const transaction = await transactionSchema.findOne({ _id: transaction_id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    transaction.status = status; // 'completed' or 'failed'
    await transaction.save();

    if (status === 'completed') {
      const user = await User.findById(transaction.userId);
      user.balance += transaction.amount;
      await user.save();
    }

    res.status(200).json({ message: 'Transaction updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error handling webhook', error: err.message });
  }
}
