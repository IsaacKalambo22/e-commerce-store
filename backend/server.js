import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js"
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

// Start server
app.listen(PORT, () => {
    console.log("Server is running on http://localhost:" + PORT);

    connectDB();
});

