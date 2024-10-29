import Stripe from "stripe";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripe;