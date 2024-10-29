import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.route.js"
import productRoutes from "./routes/product.route.js"
import cartRoutes from "./routes/cart.route.js"
import couponRoutes from "./routes/coupon.route.js"

import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

// Load environment variables from .env file
dotenv.config();

// Create Express server 
const app = express();
const PORT = process.env.PORT || 5000;

// Use middleware 
app.use(express.json()); // allows you to parse the body of the request
app.use(cookieParser()); // To Access cookies


// Routes 
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);

// Start server
app.listen(PORT, () => {
    console.log("Server is running on http://localhost:" + PORT);

    connectDB();
});

