import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth";
import walletRoutes from "./routes/wallet";
import adminRoutes from "./routes/admin";
import referralRoutes from './routes/referral';
import dashboard from "./routes/dasboard"

dotenv.config();
connectDB();

const app: Application = express();

const corsOptions = {
    origin: ['http://localhost:3000'], // Your frontend URL
    credentials: true, // Allow cookies/sessions
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    exposedHeaders: ['set-cookie']
  };
// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/dashboard', dashboard )



 const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


export default app