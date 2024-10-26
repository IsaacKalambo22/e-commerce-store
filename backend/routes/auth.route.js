 import express from "express";
import { Login, Logout, Signup } from "../controllers/auth.controller.js";

//import authController from "../controllers/auth.controller.js";
 const router = express.Router();

 //router.post("/signup", authController.Signup);
 router.post("/signup", Signup);

  //router.post("/login", authController.Login);
 router.post("/login", Login); 

 //router.post("/logout", authController.Logout);
 router.post("/logout", Logout);

 export default router;