import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { Menu, X, Copy, Link  } from "lucide-react"; 
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import io from "socket.io-client";
import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL;

const socket = io(`${API_URL}`);

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [comments, setComments] = useState({});
  const [allComments, setAllComments] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [privateTasks, setPrivateTasks] = useState([]);
  const [privateTask, setPrivateTask] = useState("")
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
    // if (!user || !user?._id) return;
    if (isAuthenticated) {
    socket.connect();
    socket.emit("userConnected", { userId: user._id, name: user.name });

    const fetchAllData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/tasks`);
        setTasks(res.data);

        const privateRes = await axios.get(`${API_URL}/api/tasks/private`);
        setPrivateTasks(privateRes.data)
        

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

    socket.on("taskUpdated",  fetchAllData);
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
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
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

  // const addPrivateTask = async () => {
  //   if (!privateTask) return;
  //   await axios.post(`${API_URL}/api/tasks/private`, { title: privateTask });
  //   setPrivateTask("");
  //   socket.emit("privateTaskUpdated");
  // };

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

  // const completePrivateTask = async (id) => {
  //   try {
  //     const res = await axios.put(`${API_URL}/api/tasks/private/${id}`);
  //     const updatedTask = res.data;

  //     setPrivateTasks((prevTasks) =>
  //       prevTasks.map((privateTask) => (privateTask._id === id ? updatedTask : privateTask))
  //     );

  //     socket.emit("privateTaskUpdated");

  //     if (updatedTask.completed) {
  //       toast.success("Task marked as complete");
  //     } else {
  //       toast.info("Task marked as incomplete");
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     toast.error("Failed to update task");
  //   }
  // }

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
    // <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      
    //   {/* Sidebar for online users */}
    //   <aside className={`bg-white w-full md:w-64 shadow-lg md:block fixed md:static z-60 transition-transform duration-300 ease-in-out
    //     ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        
    //     <div className="p-4 border-b flex justify-between items-center md:hidden">
    //       <h2 className="text-xl font-bold pl-12">Online Users</h2>
    //       <button onClick={() => setMobileMenuOpen(false)} className="text-gray-700">
    //         <X />
    //       </button>
    //     </div>

    //     {/* Online Users */}
    //     <div className="p-4 md:p-6 sticky top-0 z-50">
    //       <h2 className="text-xl font-bold mb-4 hidden md:block">Online Users</h2>
    //       <ul className="space-y-3">
    //         {onlineUsers.map(([userId, userData]) => {
    //           if (!userData?.name) return null; // avoid rendering blank entries

    //           return (
    //             <li key={userId} className="flex items-center gap-3 bg-gray-100 hover:bg-gray-200 transition p-2 rounded-lg">
    //               <div className="w-8 h-8 bg-green-100 text-green-700 font-semibold flex items-center justify-center rounded-full">
    //                 {userData.name.charAt(0).toUpperCase()}
    //               </div>
    //               <span className="text-sm">
    //                 {userId === user._id ? <strong>You</strong> : <strong>{userData.name}</strong>}
    //               </span>
    //             </li>
    //           );
    //         })}
    //       </ul>
    //       {/* Invite Link Section */}
    //       <div className="mt-6 p-4 bg-blue-50 rounded-lg">
    //         <p className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
    //           <Link size={18} /> Invite your friends
    //         </p>
    //         <div className="flex justify-center flex-col items-center gap-2">
    //           <input 
    //             value={inviteLink || "Click copy to generate link"} 
    //             readOnly 
    //             className="flex-1 px-3 py-2 border rounded text-sm truncate bg-white"
    //           />
    //           <button 
    //             onClick={copyInviteLink}
    //             disabled={isGeneratingLink}
    //             className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm flex items-center gap-1 disabled:opacity-50 cursor-pointer"
    //           >
    //             {isGeneratingLink ? (
    //               "Generating..."
    //             ) : (
    //               <>
    //                 <Copy size={16} /> Copy
    //               </>
    //             )}
    //           </button>
    //         </div>
    //         {inviteLink && (
    //           <p className="text-xs text-gray-500 mt-2">
    //             Link expires in 24 hours
    //           </p>
    //         )}
    //       </div>
    //     </div>
    //   </aside>

    //   {/* Mobile menu button */}
    //   <button
    //     onClick={() => setMobileMenuOpen(true)}
    //     className="absolute top-4 left-4 z-40 md:hidden bg-white shadow-lg p-2 rounded-md"
    //   >
    //     <Menu />
    //   </button>

    //   {/* Main Content */}
    //   <main className="flex-1 p-4 md:p-6 mt-16 md:mt-0">
        
    //     {/* Header */}
    //     <div className="flex justify-between items-center mb-6 sticky top-0 z-50 pt-3 pb-3 bg-white">
    //       <h1 className="text-2xl font-bold text-cyan-400">TODO</h1>
    //       <div className="flex items-center gap-4">
    //         <img
    //           src="https://static-00.iconduck.com/assets.00/profile-circle-icon-2048x2048-cqe5466q.png"
    //           alt="profile"
    //           className="w-10 h-10 rounded-full object-cover border border-green-400 shadow"
    //         />
    //         <span className="font-bold text-2xl text-cyan-400 mr-2">{user?.name}</span>
    //         <button
    //           onClick={handleLogout}
    //           className="bg-transparent hover:bg-red-100 text-red-600 font-medium px-4 py-2 rounded transition border-2 cursor-pointer"
    //         >
    //           Logout
    //         </button>
    //       </div>
    //     </div>

    //     {/* Tab Navigation */}
    //     <div className="flex border-b border-gray-200 mb-6">
    //       <button
    //         onClick={() => setActiveTab("shared")}
    //         className={`px-4 py-2 font-medium text-sm focus:outline-none ${
    //           activeTab === "shared"
    //             ? "border-b-2 border-cyan-400 text-cyan-600"
    //             : "text-gray-500 hover:text-gray-700"
    //         }`}
    //       >
    //         Shared Tasks
    //       </button>
    //       <button
    //         onClick={() => setActiveTab("private")}
    //         className={`px-4 py-2 font-medium text-sm focus:outline-none ${
    //           activeTab === "private"
    //             ? "border-b-2 border-cyan-400 text-cyan-600"
    //             : "text-gray-500 hover:text-gray-700"
    //         }`}
    //       >
    //         Private Tasks
    //       </button>
    //     </div>

    //     {/* Add Task */}
    //     {/* <div className="flex gap-2 mb-6">
    //       <input
    //         type="text"
    //         placeholder={`Add New task`}
    //         value={task}
    //         onChange={(e) => setTask(e.target.value)}
    //         onKeyDown={(e) => e.key === "Enter" && addTask()}
    //         className="flex-1 border rounded px-4 py-2 focus:outline-none focus:ring focus:ring-cyan-400"
    //       />
    //       <button
    //         onClick={addTask}
    //         className="bg-cyan-400 hover:bg-cyan-600 text-white px-4 py-2 rounded cursor-pointer"
    //       >
    //         Add
    //       </button>
    //     </div> */}

    //     <div className="flex gap-2 mb-6">
    //         <input
    //           type="text"
    //           placeholder="Add New task"
    //           value={activeTab === "shared" ? task : privateTask}
    //           onChange={(e) =>
    //             activeTab === "shared"
    //               ? setTask(e.target.value)
    //               : setPrivateTask(e.target.value)
    //           }
    //           onKeyDown={(e) => {
    //             if (e.key === "Enter") {
    //               activeTab === "shared" ? addTask() : addPrivateTask();
    //             }
    //           }}
    //           className="flex-1 border rounded px-4 py-2 focus:outline-none focus:ring focus:ring-cyan-400"
    //         />
    //         <button
    //           onClick={activeTab === "shared" ? addTask : addPrivateTask}
    //           className="bg-cyan-400 hover:bg-cyan-600 text-white px-4 py-2 rounded cursor-pointer"
    //         >
    //           Add
    //         </button>
    //     </div>

    //     {/* Shared Tasks */}
    //     <ul className="space-y-4">
    //       {tasks.length === 0 ? (
    //         <li className="bg-white p-8 rounded-lg shadow text-center">
    //           <div className="flex flex-col items-center justify-center">
    //             <img 
    //               src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" 
    //               alt="No tasks" 
    //               className="w-24 h-24 opacity-50 mb-4"
    //             />
    //             <h3 className="text-xl font-medium text-gray-500">
    //               No Tasks Are Added
    //             </h3>
    //           </div>
    //         </li>
    //       ) : (
    //         [...tasks].reverse().map((task) => (
    //           <li
    //             key={task._id}
    //             className={`bg-white p-4 rounded-lg shadow border-l-4 border-cyan-400`}>
    //             <div className="flex justify-between items-start">
    //             <div>
    //               <h3
    //                 className={`text-lg font-semibold ${
    //                   task.completed ? "line-through text-gray-400" : "text-gray-800"
    //                 }`}
    //               >
    //                 {task.title}
    //               </h3>
    //               <p className="text-sm text-gray-500 mt-1">
    //                 📝 Created by: <strong>{task.createdBy?.name}</strong>
    //               </p>
    //               {task.completed && (
    //                 <p className="text-sm text-green-600">
    //                   ✅ Completed by: <strong>{task.completedBy?.name}</strong>
    //                 </p>
    //               )}
    //             </div>

    //             <div className="flex gap-2">
    //               <button
    //                 onClick={() => completeTask(task._id)}
    //                 className="bg-transparent hover:bg-green-100 text-green-600 px-3 py-1 rounded-md text-sm border-2"
    //               >
    //                 {task.completed ? "Undo" : "Complete"}
    //               </button>

    //               {/* Only show delete button if current user is the task creator */}
    //               {user._id === task.createdBy._id && (
    //                 <button
    //                   onClick={() => handleDeleteTask(task._id)}
    //                   className="bg-transparent hover:bg-red-100 text-red-500 px-3 py-1 rounded-md text-sm border-2"
    //                 >
    //                   Delete Task
    //                 </button>
    //               )}
    //             </div>
    //             </div>

    //           {/* Comment Section */}
    //           <div className="mt-4">
    //             <input
    //               type="text"
    //               placeholder="Add comment"
    //               value={comments[task._id] || ""}
    //               onChange={(e) =>
    //                 setComments((prev) => ({ ...prev, [task._id]: e.target.value }))
    //               }
    //               onKeyDown={(e) => e.key === "Enter" && addComment(task._id, comments[task._id])}
    //               className="w-full px-3 py-2 border rounded mt-2 focus:outline-none focus:ring focus:ring-blue-300"
    //             />
    //             <ul className="mt-3 space-y-2">
    //               {(allComments[task._id] || []).map((comment) => (
    //                 <li
    //                   key={comment._id}
    //                   className="bg-gray-100 p-2 rounded-md flex justify-between items-center"
    //                 >
    //                   <span className="text-sm">
    //                     <strong>{comment.userId?.name || "User"}:</strong> {comment.text}
    //                   </span>
    //                   {/* Only show delete button if current user is the comment creator */}
    //                   {user._id === comment.userId._id && (
    //                     <button
    //                       onClick={() => handleDeleteComment(comment._id)}
    //                       className="bg-transparent hover:bg-red-200 text-red-500 px-2 py-1 rounded text-xs border-2"
    //                     >
    //                       Delete Comment
    //                     </button>
    //                   )}
    //                 </li>
    //               ))}
    //             </ul>
    //           </div>
    //           </li>
    //         ))
    //       )}
    //     </ul>

    //     {activeTab === "private" && (
    //     <>
    //       {/* Private task input */}
          


    //       {/* Private Tasks List */}
    //       <ul className="space-y-4">
    //         {privateTasks.length === 0 ? (
    //           <li className="bg-white p-8 rounded-lg shadow text-center">
    //             <h3 className="text-xl font-medium text-gray-500">
    //               No Private Tasks Yet
    //             </h3>
    //           </li>
    //         ) : (
    //           [...privateTasks].reverse().map((task) => (
    //             <li
    //               key={task._id}
    //               className="bg-white p-4 rounded-lg shadow border-l-4 border-cyan-600"
    //             >
    //               <div className="flex justify-between items-start">
    //                 <h3
    //                   className={`text-lg font-semibold ${
    //                     task.completed ? "line-through text-gray-400" : "text-gray-800"
    //                   }`}
    //                 >
    //                   {task.title}
    //                 </h3>
    //                 <div className="flex gap-2">
    //                   <button
    //                     onClick={() => completePrivateTask(task._id)}
    //                     className="bg-transparent hover:bg-green-100 text-green-600 px-3 py-1 rounded-md text-sm border-2"
    //                   >
    //                     {task.completed ? "Undo" : "Complete"}
    //                   </button>
    //                   <button
    //                     onClick={() => handleDeleteTask(task._id)}
    //                     className="bg-transparent hover:bg-red-100 text-red-500 px-3 py-1 rounded-md text-sm border-2"
    //                   >
    //                     Delete Task
    //                   </button>
    //                 </div>
    //               </div>
    //             </li>
    //           ))
    //         )}
    //       </ul>
    //     </>
    //   )}


    //   </main>

    // </div>

    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`w-64 bg-white border-r border-gray-200 p-4 space-y-4 z-50 transition-transform transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 md:relative md:translate-x-0`}
      >
        <h2 className="text-2xl font-bold text-cyan-600">TeamUp</h2>
        <div>
          <p className="font-medium text-gray-600 mb-2">Online Users</p>
          <ul className="space-y-2">
            {onlineUsers.map((u) => (
              <li key={u._id} className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">{user.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium text-gray-600 mb-2">Tabs</p>
          <div className="space-y-2">

            {/* Invite Link Section */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
                <Link size={18} /> Invite your friends
              </p>
              <div className="flex justify-center flex-col items-center gap-2">
                <input 
                  value={inviteLink || "Click copy to generate link"} 
                  readOnly 
                  className="flex-1 px-3 py-2 border rounded text-sm truncate bg-white"
                />
                <button 
                  onClick={copyInviteLink}
                  disabled={isGeneratingLink}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingLink ? (
                    "Generating..."
                  ) : (
                    <>
                      <Copy size={16} /> Copy
                    </>
                  )}
                </button>
              </div>
              {inviteLink && (
                <p className="text-xs text-gray-500 mt-2">
                  Link expires in 24 hours
                </p>
              )}
            </div>

            <button
              className={`w-full text-left px-3 py-2 rounded-md ${
                activeTab === "shared"
                  ? "bg-cyan-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setActiveTab("shared")}
            >
              Shared Tasks
            </button>
            <button
              className={`w-full text-left px-3 py-2 rounded-md ${
                activeTab === "private"
                  ? "bg-cyan-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setActiveTab("private")}
            >
              Private Tasks
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        className="absolute top-4 left-4 z-50 md:hidden bg-cyan-600 text-white px-3 py-2 rounded"
        onClick={() => setMobileMenuOpen((prev) => !prev)}
      >
        ☰
      </button>



      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 pt-16 bg-gray-100">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 sticky top-0 z-50 pt-3 pb-3 bg-white">
            <h1 className="text-2xl font-bold text-cyan-400">TODO</h1>
              <div className="flex items-center gap-4">
                <img
                  src="https://static-00.iconduck.com/assets.00/profile-circle-icon-2048x2048-cqe5466q.png"
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover border border-green-400 shadow"
                />
                <span className="font-bold text-2xl text-cyan-400 mr-2">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-transparent hover:bg-red-100 text-red-600 font-medium px-4 py-2 rounded transition border-2 cursor-pointer"
                >
                  Logout
                </button>
              </div>
        </div>
        <h1 className="text-3xl font-bold mb-6 text-cyan-700">
          {activeTab === "shared" ? "Shared" : "Private"} Tasks
        </h1>

        {/* Add Task Input */}
        <div className="flex items-center mb-6 space-x-4">
          <input
            type="text"
            placeholder={`Add New ${activeTab === "shared" ? "Shared" : "Private"} Task`}
            value={activeTab === "shared" ? task : privateTask}
            onChange={(e) =>
              activeTab === "shared"
                ? setTask(e.target.value)
                : setPrivateTask(e.target.value)
            }
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            className="flex-1 border rounded px-4 py-2 focus:outline-none focus:ring focus:ring-cyan-400"
          />
          <button
            onClick={addTask}
            className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
          >
            Add
          </button>
        </div>

        {/* Task List */}
        {activeTab === "shared" ? (
          <ul className="space-y-4">
            {tasks.length === 0 ? (
              <li className="bg-white p-8 rounded-lg shadow text-center">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
                  alt="No tasks"
                  className="w-24 h-24 opacity-50 mx-auto mb-4"
                />
                <p className="text-xl text-gray-500">No Tasks Are Added</p>
              </li>
            ) : (
              [...tasks].reverse().map((task) => (
                <li key={task._id} className="bg-white p-4 rounded shadow space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => completeTask(task._id)}
                        className="mr-2"
                      />
                      <span
                        className={`text-lg font-medium ${
                          task.completed ? "line-through text-gray-400" : ""
                        }`}
                      >
                        {task.name}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Added by: {task.createdBy?.fullname || "Unknown"}
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="pl-6 mt-4">
                    {task.comments?.map((c) => (
                      <div
                        key={c._id}
                        className="flex items-center justify-between bg-gray-100 rounded px-3 py-2 mb-2"
                      >
                        <span className="text-gray-700">
                          <strong>{c.commentedBy?.fullname}:</strong> {c.text}
                        </span>
                        {c.commentedBy?._id === user._id && (
                          <button
                            onClick={() => handleDeleteComment(task._id, c._id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ))}

                    <div className="flex items-center space-x-2 mt-2">
                    <input
                        type="text"
                        placeholder="Add comment"
                        value={comments[task._id] || ""}
                        onChange={(e) =>
                          setComments((prev) => ({ ...prev, [task._id]: e.target.value }))
                        }
                        onKeyDown={(e) => e.key === "Enter" && addComment(task._id, comments[task._id])}
                        className="w-full px-3 py-2 border rounded mt-2 focus:outline-none focus:ring focus:ring-blue-300"
                      />
                      <ul className="mt-3 space-y-2">
                        {(allComments[task._id] || []).map((comment) => (
                          <li
                            key={comment._id}
                            className="bg-gray-100 p-2 rounded-md flex justify-between items-center"
                          >
                            <span className="text-sm">
                              <strong>{comment.userId?.name || "User"}:</strong> {comment.text}
                            </span>
                            {/* Only show delete button if current user is the comment creator */}
                            {user._id === comment.userId._id && (
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="bg-transparent hover:bg-red-200 text-red-500 px-2 py-1 rounded text-xs border-2"
                              >
                                Delete Comment
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>

                    </div>

                  </div>

                  <div className="text-right mt-2">
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete Task
                    </button>
                  </div>


                </li>
              ))
            )}
          </ul>
        ) : (
          <ul className="space-y-4">
            {privateTasks.length === 0 ? (
              <li className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-xl text-gray-500">No Private Tasks Yet</p>
              </li>
            ) : (
              [...privateTasks].reverse().map((task) => (
                <li
                  key={task._id}
                  className="bg-white p-4 rounded shadow flex justify-between items-center"
                >
                  <div>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => completeTask(task._id)}
                      className="mr-2"
                    />
                    <span
                      className={`text-lg font-medium ${
                        task.completed ? "line-through text-gray-400" : ""
                      }`}
                    >
                      {task.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </main>
    </div>
  
  );
};

export default Home;

