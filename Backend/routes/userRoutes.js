const express = require("express");
const jwt = require("jsonwebtoken");
const {
  registerUser,
  loginUser,
  logoutUser,
  checkAuth,
  generateInviteLink,
  validateInvite
} = require("../controllers/userController");
const { verifyToken } = require("../middleware/verifyToken");

const router = express.Router();

// Auth routes
router.get("/check-auth", verifyToken, checkAuth);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/invite-link", verifyToken, generateInviteLink);
router.get("/validate-invite/:token", validateInvite);
module.exports = router;
