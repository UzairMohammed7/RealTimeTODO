const express = require("express");
const { registerUser, loginUser, logoutUser, checkAuth } = require("../controllers/userController");
const { verifyToken } = require("../middleware/verifyToken")
const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

module.exports = router;
