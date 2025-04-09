const express = require("express");
const Comment = require("../models/Comment");
const router = express.Router();

// GET all comments
router.get("/", async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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

// DELETE comment
router.delete("/:id", async (req, res) => {
   await Comment.findByIdAndDelete(req.params.id);
   res.json({ message: "Comment deleted" });
});
  
// EDIT comment
router.put("/:id", async (req, res) => {
  const { text } = req.body;
  const updated = await Comment.findByIdAndUpdate(req.params.id, { text }, { new: true });
  res.json(updated);
});
  
module.exports = router;
