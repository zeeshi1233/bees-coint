import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // <-- this is required for populate to work
    required: true,
  },
  amount: { type: Number, required: true },
  transactionType: { type: String, enum: ['deposit', 'withdraw'], required: true },
  method: { type: String, enum: ['PIX', 'Crypto', "Card"], required: true },
  pixType: { type: String, enum: ['CPF', 'Email', "Phone","Random Key"], required: false },
  pixKey:{ type: String, required: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Transaction', transactionSchema);
