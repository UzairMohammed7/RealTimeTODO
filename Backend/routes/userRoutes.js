const express = require("express");
const jwt = require("jsonwebtoken");
const {
  registerUser,
  loginUser,
  logoutUser,
  checkAuth,
} = require("../controllers/userController");
const { verifyToken } = require("../middleware/verifyToken");

const router = express.Router();

// Auth routes
router.get("/check-auth", verifyToken, checkAuth);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Invite link route
router.get("/invite-link", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const inviteToken = jwt.sign({ invitedBy: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });

    const inviteLink = `${process.env.FRONTEND_URL}/invite/${inviteToken}`;

    res.json({ inviteLink });
  } catch (err) {
    console.error("Error generating invite link:", err);
    res.status(500).json({ error: "Failed to generate invite link" });
  }
});

// Add this new route to handle invitation validation
router.get('/validate-invite/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ valid: true, invitedBy: decoded.invitedBy });
    } catch (err) {
        res.status(400).json({ valid: false, error: "Invalid or expired token" });
    }
});

module.exports = router;
