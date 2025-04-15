import mongoose from 'mongoose';

const ReferralSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralCode: { type: String, required: true, unique: true },
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // User who referred
});

export default mongoose.model('Referral', ReferralSchema);
