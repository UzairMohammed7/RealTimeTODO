import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import io from "socket.io-client";
import axios from "axios";
import PrivateTodos from "../components/PrivateTodos";
import SharedTodos from "../components/SharedTodos";
import Sidebar from "./Sidebar";
import Header from "./Header";
const API_URL = import.meta.env.VITE_BASE_URL;

const socket = io(`${API_URL}`);

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [comments, setComments] = useState({});
  const [allComments, setAllComments] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [activeTab, setActiveTab] = useState("shared");
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    if (token) {
      localStorage.setItem("inviteToken", token);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      socket.connect();
      socket.emit("userConnected", { userId: user._id, name: user.name });

      const fetchAllData = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/tasks`);
          setTasks(res.data);

          const commentMap = {};
          await Promise.all(
            res.data.map(async (task) => {
              const resComments = await axios.get(
                `${API_URL}/api/comments/${task._id}`
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

      socket.on("updateOnlineUsers", (usersArray) => {
        setOnlineUsers(usersArray);
      });

      return () => {
        socket.off("taskUpdated", fetchAllData);
        socket.off("commentUpdated", fetchAllData);
        socket.off("updateOnlineUsers");
        socket.disconnect();
      };
    }
  }, [user, isAuthenticated]);

  const generateInviteLink = async () => {
    setIsGeneratingLink(true);
    try {
      const res = await axios.get(`${API_URL}/api/users/invite-link`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setInviteLink(res.data.inviteLink);
      toast.success("Invite link generated!");
      return res.data.inviteLink;
    } catch (err) {
      console.error("Error generating invite link:", err);
      toast.error("Failed to generate invite link");
      return null;
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyInviteLink = async () => {
    let link = inviteLink;
    if (!link) {
      link = await generateInviteLink();
    }
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success("Invite link copied to clipboard!");
    }
  };

  const handleDeleteTask = async (id) => {
    await axios.delete(`${API_URL}/api/tasks/${id}`);
    socket.emit("taskUpdated");
    toast.success("Task deleted");
  };

  const handleDeleteComment = async (id) => {
    await axios.delete(`${API_URL}/api/comments/${id}`);
    socket.emit("commentUpdated");
    toast.info("Comment deleted");
  };

  const addTask = async () => {
    if (!task) return;
    await axios.post(`${API_URL}/api/tasks`, { title: task });
    setTask("");
    socket.emit("taskUpdated");
  };

  const completeTask = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/api/tasks/${id}`);
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
    await axios.post(`${API_URL}/api/comments`, { taskId, text });
    setComments((prev) => ({ ...prev, [taskId]: "" }));
    socket.emit("commentUpdated");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar for online users */}
      <Sidebar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onlineUsers={onlineUsers}
        user={user}
        inviteLink={inviteLink}
        isGeneratingLink={isGeneratingLink}
        copyInviteLink={copyInviteLink}
      />

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="absolute top-4 left-4 z-40 md:hidden bg-white shadow-lg p-2 rounded-md"
      >
        <Menu />
      </button>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 mt-16 md:mt-0">
        {/* Header */}
        <Header user={user} handleLogout={handleLogout} />

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("shared")}
            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
              activeTab === "shared"
                ? "border-b-2 border-cyan-400 text-cyan-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Shared Tasks
          </button>
          <button
            onClick={() => setActiveTab("private")}
            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
              activeTab === "private"
                ? "border-b-2 border-cyan-400 text-cyan-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Private Tasks
          </button>
        </div>

        {activeTab === "shared" ? (
          <SharedTodos
            task={task}
            setTask={setTask}
            addTask={addTask}
            tasks={tasks}
            user={user}
            completeTask={completeTask}
            handleDeleteTask={handleDeleteTask}
            comments={comments}
            setComments={setComments}
            addComment={addComment}
            allComments={allComments}
            handleDeleteComment={handleDeleteComment}
          />
        ) : (
          <PrivateTodos />
        )}
      </main>
    </div>
  );
};

export default Home;
