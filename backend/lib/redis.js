import Redis from "ioredis"
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Connect to Redis
export const redis = new Redis(process.env.UPSTASH_REDIS_URL);
