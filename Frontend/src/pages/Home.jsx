import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const Home = () => {
    const [tasks, setTasks] = useState([]);
    const [task, setTask] = useState("");
    const [comments, setComments] = useState({});
    const [allComments, setAllComments] = useState({});
    const {user, logout} = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate("/login");

        const fetchTasks = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/tasks`); 
                setTasks(res.data);
              } catch (err) {
                console.log(err);
                toast.error("Failed to fetch tasks");
              }
        };

        const fetchAllComments = async () => {
            for (const task of tasks) {
              const res = await axios.get(`http://localhost:5000/api/comments/${task._id}`);
              setAllComments((prev) => ({
                ...prev,
                [task._id]: res.data
              }));
            }
        };
          
        
        fetchTasks();
        fetchAllComments();

        socket.on("taskUpdated", fetchTasks);
        socket.on("commentUpdated", fetchTasks);

        return () => {
            socket.off("taskUpdated");
            socket.off("commentUpdated");
        };

    }, [tasks, user, navigate]);

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
        await axios.post("http://localhost:5000/api/tasks", {title: task});
        // await axios.post("http://localhost:5000/api/tasks", { title: task, createdBy: user.userId });
        setTask("");
        socket.emit("taskUpdated");
    };

    // const completeTask = async (id) => {
    //     try {
    //       const res = await axios.put(`http://localhost:5000/api/tasks/${id}`);
    //       const updatedTask = res.data;
      
    //       setTasks((prevTasks) =>
    //         prevTasks.map((task) =>
    //           task._id === id ? { ...task, completed: updatedTask.completed } : task
    //         )
    //       );
      
    //       socket.emit("taskUpdated");
      
    //       if (updatedTask.completed) {
    //         toast.success("Task marked as complete");
    //       } else {
    //         toast.info("Task marked as incomplete");
    //       }
    //     } catch (err) {
    //         console.log(err)
    //       toast.error("Failed to update task");
    //     }
    // };
    
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
        await axios.post(`http://localhost:5000/api/comments`, { taskId, text, userId: user.userId });
        setComments((prev) => ({ ...prev, [taskId]: "" }));
        socket.emit("commentUpdated");
    };
      
    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen p-6 bg-gradient-to-r from-blue-500 to-green-400">

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold text-white">My Tasks</h2>
                <button onClick={handleLogout} className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer">
                    Logout
                </button>
            </div>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Add new task"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-white"
                />
                <button onClick={addTask} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer">
                    Add
                </button>
            </div>

            <ul className="space-y-4">
                {tasks.map((task) => (
                    <div key={task._id} className="bg-white p-4 rounded-lg shadow mb-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className={`text-lg ${task.completed ? "line-through text-gray-500" : ""}`}>
                                    {task.title}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    📝 Created by: <strong>{task.createdBy?.name }</strong>
                                </p>
                                {task.completed && (
                                    <p className="text-sm text-green-600">
                                    ✅ Completed by: <strong>{task.completedBy?.name }</strong>
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleDeleteTask(task._id)}>Delete Task</button>

                                {/* Completion Toggle Button */}
                                <button
                                    onClick={() => completeTask(task._id)}
                                    className={`px-2 py-1 rounded ${
                                        task.completed ? "bg-yellow-500 text-white" : "bg-green-500 text-white"
                                    }`}
                                    >
                                    {task.completed ? "Mark as Incomplete" : "Mark as Complete"}
                                </button>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="mt-2 pl-4 border-l">
                            <input
                                type="text"
                                value={comments[task._id] || ""}
                                onChange={(e) =>
                                setComments((prev) => ({ ...prev, [task._id]: e.target.value }))
                                }
                                className="border rounded p-1 mt-2 w-full"
                                placeholder="Add a comment"
                            />
                            <button
                                onClick={() => addComment(task._id, comments[task._id])}
                                className="mt-1 text-sm bg-blue-500 text-white px-2 py-1 rounded"
                            >
                                Add Comments
                            </button>
                            <ul className="overflow-auto">
                                {(allComments[task._id] || []).map((comment) => (
                                <li key={comment._id} className="flex justify-between items-center">
                                    <div>
                                        {/* <p>{task.createdBy?.name}</p> */}
                                        <p>{comment.text}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleDeleteComment(comment._id)}>🗑️Delete Comment</button>
                                    </div>
                                </li>
                                ))}
                            </ul>   
                        </div>
                    </div>
                ))}
            </ul>

        </div>
    );
};

export default Home;
