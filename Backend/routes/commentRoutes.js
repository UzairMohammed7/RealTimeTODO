const express = require("express");
const Comment = require("../models/Comment");
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken");

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
router.get("/:taskId", verifyToken, async (req, res) => {
  try {
    const comments = await Comment.find({ taskId: req.params.taskId })
      .populate("userId", "name");
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add comment
router.post("/", verifyToken, async (req, res) => {
  try {
    const { text, taskId } = req.body;

    const newComment = new Comment({
      text,
      taskId,
      userId: req.userId
    });

    const savedComment = await newComment.save();
    const populatedComment = await savedComment.populate("userId", "name");

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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
