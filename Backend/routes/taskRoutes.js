const express = require("express");
const Task = require("../models/Task.js");
const router = express.Router();

// Get all tasks
router.get("/", async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

// Add task
router.post("/", async (req, res) => {
  const { title, createdBy } = req.body;
  const task = new Task({ title, createdBy });
  await task.save();
  res.status(201).json(task);
});

// Mark task complete
router.put("/:id", async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, { completed: true }, { new: true });
  res.json(task);
});

module.exports = router;
