import { InvestmentPackage } from "../model/InvestmentSchema.js";

// Create a new investment package
export const createInvestmentPackage = async (req, res) => {
  const { name, description, minAmount, maxAmount, dailyReturnPercentage, durationInDays,price } = req.body;

  try {
    const newPackage = new InvestmentPackage({
      name,
      description,
      minAmount,
      maxAmount,
      dailyReturnPercentage,
      durationInDays,
      price
    });

    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all investment packages
export const getAllPackages = async (req, res) => {
  try {
    const packages = await InvestmentPackage.find({ isActive: true });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update an existing investment package
export const updateInvestmentPackage = async (req, res) => {
  const { name, description, minAmount, maxAmount, dailyReturnPercentage, durationInDays, isActive } = req.body;
  const id=req.params.id;
  try {
    const investmentPackage = await InvestmentPackage.findById(id);
    if (!investmentPackage) return res.status(404).json({ message: 'Package not found' });

    investmentPackage.name = name || investmentPackage.name;
    investmentPackage.description = description || investmentPackage.description;
    investmentPackage.minAmount = minAmount || investmentPackage.minAmount;
    investmentPackage.maxAmount = maxAmount || investmentPackage.maxAmount;
    investmentPackage.dailyReturnPercentage = dailyReturnPercentage || investmentPackage.dailyReturnPercentage;
    investmentPackage.durationInDays = durationInDays || investmentPackage.durationInDays;
    investmentPackage.isActive = isActive;

    await investmentPackage.save();
    res.json(investmentPackage);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Deactivate an investment package
export const deactivateInvestmentPackage = async (req, res) => {
  const { packageId } = req.body;

  try {
    const investmentPackage = await InvestmentPackageSchema.findById(packageId);
    if (!investmentPackage) return res.status(404).json({ message: 'Package not found' });

    investmentPackage.isActive = false;
    await investmentPackage.save();

    res.json({ message: 'Package deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
