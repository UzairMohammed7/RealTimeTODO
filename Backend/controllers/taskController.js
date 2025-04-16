const Task = require("../models/Task");

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("createdBy", "name")
      .populate("completedBy", "name");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add task
const addTask = async (req, res) => {
  try {
    const { title } = req.body;
    const newTask = new Task({ title, createdBy: req.userId });

    const savedTask = await newTask.save();
    const populatedTask = await savedTask.populate("createdBy", "name");

    res.status(201).json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle task completion
const toggleTaskCompletion = async (req, res) => {
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
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (String(task.createdBy) !== req.userId)
      return res.status(403).json({ message: "Unauthorized" });

    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllTasks,
  addTask,
  toggleTaskCompletion,
  deleteTask
};
