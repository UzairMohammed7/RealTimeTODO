import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const Home = () => {
    const [tasks, setTasks] = useState([]);
    const [task, setTask] = useState("");
    const [comments, setComments] = useState({});
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate("/login");

        const fetchTasks = async () => {
            const res = await axios.get("http://localhost:5000/api/tasks");
            setTasks(res.data);
        };

        fetchTasks();

        socket.on("taskUpdated", fetchTasks);
        socket.on("commentUpdated", fetchTasks);

        return () => {
            socket.off("taskUpdated");
            socket.off("commentUpdated");
        };
    }, [user, navigate]);

    const addTask = async () => {
        if (!task) return;
        await axios.post("http://localhost:5000/api/tasks", { title: task, createdBy: user.userId });
        setTask("");
        socket.emit("taskUpdated");
    };

    const completeTask = async (id) => {
        await axios.put(`http://localhost:5000/api/tasks/${id}`);
        socket.emit("taskUpdated");
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
        <div className="min-h-screen p-6 bg-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold">Dashboard</h2>
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg">
                    Logout
                </button>
            </div>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Add new task"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                />
                <button onClick={addTask} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg">
                    Add
                </button>
            </div>
            <ul className="space-y-4">
                {tasks.map((t) => (
                    <li key={t._id} className="p-4 bg-white rounded-lg shadow">
                        <div className="flex justify-between items-center">
                            <span className={t.completed ? "line-through text-gray-500" : ""}>{t.title}</span>
                            <button
                                onClick={() => completeTask(t._id)}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg"
                            >
                                {t.completed ? "Completed" : "Complete"}
                            </button>
                        </div>
                        <div className="mt-2">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={comments[t._id] || ""}
                                onChange={(e) =>
                                    setComments((prev) => ({ ...prev, [t._id]: e.target.value }))
                                }
                                className="px-3 py-2 border rounded-lg w-full"
                            />
                            <button
                                onClick={() => addComment(t._id, comments[t._id])}
                                className="mt-2 bg-gray-500 text-white px-4 py-2 rounded-lg"
                            >
                                Comment
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Home;
