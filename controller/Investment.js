import { Investment } from '../model/InvestmentSchema.js';
import User from '../model/UserSchema.js';
import { initiatePixDeposit } from '../utils/syncpayService.js';

// Create a new investment
const createInvestment = async (req, res) => {
  const { amount, packageId, userId, type, method } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if user has already invested in this package
    const existingInvestment = await Investment.findOne({
      user: userId,
      packageId: packageId,
    });

    if (existingInvestment) {
      return res.status(400).json({ message: 'User has already invested in this package' });
    }

    const investment = new Investment({
      user: userId,
      amount,
      packageId,
      status: 'active',
      dailyReturn: amount * 0.01,
    });

    await investment.save();
    user.investments.push(investment._id);
    await user.save();

    let syncpayResponse = null;

    if (type === 'deposit' && method === 'PIX') {
      syncpayResponse = await initiatePixDeposit({ amount, userData: user });
      return res.status(201).json({
        message: 'Deposit investment created successfully',
        investment,
        pixInfo: syncpayResponse || null,
      });
    }

    res.status(201).json({ message: 'Investment created successfully', investment });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all investments for a user
const getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.params.user_id });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Reinvest after reaching the target
const reinvest = async (req, res) => {
  const { investmentId } = req.body;

  try {
    const investment = await Investment.findById(investmentId);
    if (!investment) return res.status(404).json({ message: 'Investment not found' });

    investment.reinvestmentStatus = true;
    await investment.save();

    res.json({ message: 'Reinvestment successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export { createInvestment, getInvestments, reinvest };
