import mongoose from 'mongoose';

// Investment Schema
const InvestmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  packageId: { type:String, required: true }, // Reference to investment package
  status: { type: String, default: 'active' }, // active, completed, etc.
  dailyReturn: { type: Number, required: true },
  reinvestmentStatus: { type: Boolean, default: false }, // If the user reinvested
});

const Investment = mongoose.model('Investment', InvestmentSchema);

// Investment Package Schema
const InvestmentPackageSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the package (e.g., "Basic Plan", "Gold Plan")
  description: { type: String }, // Description of the package
  minAmount: { type: Number, required: true }, // Minimum investment amount
  maxAmount: { type: Number }, // Maximum investment amount (optional)
  dailyReturnPercentage: { type: Number, required: true }, // Daily return percentage
  durationInDays: { type: Number }, // Duration for which the package is valid (optional)
  isActive: { type: Boolean, default: true }, // If the package is active or not
}, { timestamps: true });

const InvestmentPackage = mongoose.model('InvestmentPackage', InvestmentPackageSchema);

// Export both models together
export { Investment, InvestmentPackage };
