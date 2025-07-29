const express=require("express")
const router=express.Router();
const {login, register, verifyOtp, enableMfa, disableMfa} = require("../controller/AuthController");



router.post("/login",  login);
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/enable-mfa", enableMfa); // User must be authenticated
router.post("/disable-mfa", disableMfa); // User must be authenticated


module.exports=router;