import express from 'express';
import { createInvestmentPackage, getAllPackages, updateInvestmentPackage, deactivateInvestmentPackage } from '../controller/InvestmentPackage.js';
import { protect } from '../Middleware/ProtectedRoutes.js';

const InvesmentPackagerouter = express.Router();

// Admin Route to Create a New Investment Package
InvesmentPackagerouter.post('/create-pacakge',protect, createInvestmentPackage);

// Admin Route to Get All Active Investment Packages
InvesmentPackagerouter.get('/get-pacakge',protect, getAllPackages);

// Admin Route to Update an Existing Investment Package
InvesmentPackagerouter.put('/update-package/:id',protect, updateInvestmentPackage);

// Admin Route to Deactivate an Investment Package
// InvesmentPackagerouter.put('/deactivate', deactivateInvestmentPackage);

export default InvesmentPackagerouter;
