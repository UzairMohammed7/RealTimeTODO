const express = require("express");
const Task = require("../models/Task");
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken");

// Get all tasks
router.get("/", verifyToken, async (req, res) => {
  const tasks = await Task.find()
  .populate("createdBy", "name")
  .populate("completedBy", "name");
  res.json(tasks);
});

// Add task
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title } = req.body;
    const newTask = new Task({ title, createdBy: req.userId });

    const savedTask = await newTask.save();
    const populatedTask = await savedTask.populate("createdBy", "name");

    res.status(201).json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Toggle task completion
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    
    task.completed = !task.completed;
    task.completedBy = task.completed ? req.userId : null;

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("createdBy", "name")
      .populate("completedBy", "name");

    res.json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE task
router.delete("/:id", async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
});

module.exports = router;
