import express from 'express';
const Transactionrouter = express.Router();
import { approveWithdrawal, createTransaction, GetTransactionLive, getUserTransactions, updateTransactionStatus } from '../controller/transaction.js';
import { protect } from '../Middleware/ProtectedRoutes.js';

Transactionrouter.post('/create-transaction', protect, createTransaction);
Transactionrouter.get('/get-transaction/:id', protect, getUserTransactions);
Transactionrouter.put('/update-transaction', protect, updateTransactionStatus);
Transactionrouter.post('/approve-widraw/:id', protect, approveWithdrawal);
Transactionrouter.post('/syncpay', protect, GetTransactionLive);



export default Transactionrouter;
