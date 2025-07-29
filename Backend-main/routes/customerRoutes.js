const express=require("express");
const { findAll, saveAll,findById, deleteById, update ,   getActiveStatus,
    updateActiveStatus, changePassword } = require("../controller/CustomersController");
const CustomerValidation=require("../validation/CustomerValidation")
const multer = require('multer');
const path = require('path');
// Multer setup for profile images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'profile_images'),
  filename:  (req, file, cb) => {
    const ts = Date.now();
    cb(null, `${ts}-${file.originalname}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Only images allowed'), ok);
  }
});

const router=express.Router();




router.get("/",findAll);
router.post("/",CustomerValidation,saveAll);
router.get("/:id",findById);
router.delete("/:id",deleteById);
router.put("/:id", upload.single('profileImage'), update);
router.get("/active-status/:id",getActiveStatus);

// Route to update the active status of a customer
router.put("/active-status/:id",updateActiveStatus);
router.put("/:id/password", changePassword);
module.exports=router;