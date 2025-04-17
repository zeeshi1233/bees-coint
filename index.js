import "dotenv/config";
import mongoose from "mongoose";
import express from "express";
import UserRouter from "./router/UserRoute.js";
import Transactionrouter from "./router/TransactionRoute.js";
import investmentRouter from "./router/InvestmentRoute.js";
import InvesmentPackagerouter from "./router/InvestmentRoutePackage.js";
import cors from "cors"; // ⬅️ Add this line
const app = express();
const port = process.env.PORT || 3000;
app.use(cors()); // ⬅️ Allow all origins
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", UserRouter);
app.use("/transaction",Transactionrouter);
app.use("/investment",investmentRouter);
app.use("/package",InvesmentPackagerouter);

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("MongoDB connected!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
