const express = require("express");
const Comment = require("../models/Comment.js");
const router = express.Router();

// Get comments by task
router.get("/:taskId", async (req, res) => {
  const comments = await Comment.find({ taskId: req.params.taskId }).sort({ createdAt: 1 });
  res.json(comments);
});

// Add comment
router.post("/", async (req, res) => {
  const { taskId, text, userId } = req.body;
  const comment = new Comment({ taskId, text, userId });
  await comment.save();
  res.status(201).json(comment);
});

module.exports = router;
