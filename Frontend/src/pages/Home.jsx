import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000", {
//   withCredentials: true,
//   autoConnect: false,
});

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [comments, setComments] = useState({});
  const [allComments, setAllComments] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?._id) return;
    socket.connect();
    socket.emit("userConnected", user._id);
    // socket.emit("userConnected", { userId: user._id, name: user.name });

    const fetchAllData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/tasks");
        setTasks(res.data);

        const commentMap = {};
        await Promise.all(
          res.data.map(async (task) => {
            const resComments = await axios.get(
              `http://localhost:5000/api/comments/${task._id}`
            );
            commentMap[task._id] = resComments.data;
          })
        );

        setAllComments(commentMap);
      } catch (err) {
        console.log("Error loading tasks/comments:", err);
      }
    };

    fetchAllData();

    socket.on("taskUpdated", fetchAllData);
    socket.on("commentUpdated", fetchAllData);

    const handleUpdate = (users) => {
      setOnlineUsers(users);
    };
    socket.on("updateOnlineUsers", handleUpdate);
    
    return () => {
      socket.off("taskUpdated", fetchAllData);
      socket.off("commentUpdated", fetchAllData);

      socket.off("updateOnlineUsers", handleUpdate);
    //   socket.disconnect();
    };
  }, [user]);

  const handleDeleteTask = async (id) => {
    await axios.delete(`http://localhost:5000/api/tasks/${id}`);
    socket.emit("taskUpdated");
    toast.success("Task deleted");
  };

  const handleDeleteComment = async (id) => {
    await axios.delete(`http://localhost:5000/api/comments/${id}`);
    socket.emit("commentUpdated");
    toast.info("Comment deleted");
  };

  const addTask = async () => {
    if (!task) return;
    await axios.post("http://localhost:5000/api/tasks", { title: task });
    setTask("");
    socket.emit("taskUpdated");
  };

  const completeTask = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/tasks/${id}`);
      const updatedTask = res.data;

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === id ? updatedTask : task))
      );

      socket.emit("taskUpdated");

      if (updatedTask.completed) {
        toast.success("Task marked as complete");
      } else {
        toast.info("Task marked as incomplete");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to update task");
    }
  };

  const addComment = async (taskId, text) => {
    if (!text) return;
    await axios.post(`http://localhost:5000/api/comments`, { taskId, text });
    setComments((prev) => ({ ...prev, [taskId]: "" }));
    socket.emit("commentUpdated");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen p-6 bg-gradient-to-r from-cyan-900 to-green-400">
      <div>
        <div className="bg-white shadow-md rounded-xl p-4 w-full max-w-md mx-auto mb-6 sticky top-0 overflow-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-green-500">●</span> Online Users
          </h2>
          <ul className="space-y-3">
            {onlineUsers.map(([userId, { name }]) => (
              <li
                key={user._id}
                className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition p-2 rounded-lg shadow-sm"
              >
                <div className="w-10 h-10 bg-green-200 text-green-800 font-bold flex items-center justify-center rounded-full shadow">
                  {name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm text-gray-700">
                  {userId === user._id ? (
                    <span className="font-semibold text-green-600">You</span>
                  ) : (
                    <span className="font-medium">{name}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <div className="sticky top-0 z-50 p-4 bg-gradient-to-r from-cyan-900 to-green-400">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
            <h2 className="text-3xl font-bold text-white text-center md:text-left">
              My Tasks
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div className="flex items-center">
                <img
                    src="https://static-00.iconduck.com/assets.00/profile-circle-icon-2048x2048-cqe5466q.png"
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover border border-green-400 shadow"
                />
                <span className="text-white font-extrabold text-xl sm:text-2xl text-center sm:text-left">
                  {user?.name || "User"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="flex mb-4">
            <input
              type="text"
              placeholder="Add new task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              className="w-full px-4 py-2 rounded-lg border text-white border-gray-300 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={addTask}
              className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        <ul className="space-y-4">
          {[...tasks].reverse().map((task) => (
            <div
              key={task._id}
              className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 mb-6 border-t-4 border-cyan-400 transition-all duration-300"
            >
              {/* Task Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <h3
                    className={`text-lg font-semibold ${
                      task.completed
                        ? "line-through text-gray-500"
                        : "text-gray-800"
                    }`}
                  >
                    Task: <strong>{task.title}</strong>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    📝 Task Created by: <strong>{task.createdBy?.name}</strong>
                  </p>
                  {task.completed && (
                    <p className="text-sm text-green-600">
                      ✅ Task Completed by:{" "}
                      <strong>{task.completedBy?.name}</strong>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => completeTask(task._id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium shadow transition-all ${
                      task.completed
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {task.completed ? "Mark as Incomplete" : "Mark as Complete"}
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow"
                  >
                    Delete Task
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-4 border-l-4 border-cyan-100 pl-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={comments[task._id] || ""}
                    onChange={(e) =>
                      setComments((prev) => ({
                        ...prev,
                        [task._id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addComment(task._id, comments[task._id]);
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                    placeholder="Add a comment"
                  />
                  <button
                    onClick={() => addComment(task._id, comments[task._id])}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow text-sm font-medium"
                  >
                    Add Comment
                  </button>
                </div>

                <ul className="mt-3 max-h-48 overflow-auto">
                  {(allComments[task._id] || []).map((comment) => (
                    <li
                      key={comment._id}
                      className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md border border-gray-200 mt-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <span className="font-semibold text-gray-700">
                          {comment.userId?.name || "Unknown"}:
                        </span>
                        <p className="text-gray-700 break-words">
                          {comment.text}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs rounded-md ml-2"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;
