import express from "express";
import { addToCart, updateQuantity, getCartProducts, removeAllFromCart } from "../controllers/cart.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, addToCart);
router.get("/", protectRoute, getCartProducts);
router.put("/:id", protectRoute, updateQuantity);
router.delete("/:productId", protectRoute, removeAllFromCart);


export default router;