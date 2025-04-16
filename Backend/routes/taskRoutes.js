const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken");
const {
  getAllTasks,
  addTask,
  toggleTaskCompletion,
  deleteTask,
} = require("../controllers/taskController");

router.get("/", verifyToken, getAllTasks);
router.post("/", verifyToken, addTask);
router.put("/:id", verifyToken, toggleTaskCompletion);
router.delete("/:id", verifyToken, deleteTask);

module.exports = router;
