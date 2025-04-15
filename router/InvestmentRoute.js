import express from 'express';
import { createInvestment, getInvestments} from '../controller/Investment.js';
import { protect } from '../Middleware/ProtectedRoutes.js';

const investmentRouter = express.Router();

investmentRouter.post('/create-investment', protect, createInvestment);

investmentRouter.get('/get-investment/:user_id', protect, getInvestments);

// investmentRouter.post('/reinvest', protect, reinvest);

export default investmentRouter;
