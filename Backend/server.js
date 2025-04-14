const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser')
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/db");
const UserRoutes = require("./routes/userRoutes")
const TaskRoutes =  require("./routes/taskRoutes");
const CommentRoutes = require("./routes/commentRoutes");

connectDB();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: { origin: `${process.env.FRONTEND_URL}` || "*" },
    methods: ["GET", "POST", 'PUT', "DELETE"],
    credentials: true,
});

app.use(cors(
    {
        origin: `${process.env.FRONTEND_URL}` || "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use('/api/users', UserRoutes)
app.use("/api/tasks", TaskRoutes);
app.use("/api/comments", CommentRoutes);

let onlineUsers = new Map();

io.on("connection", (socket) => {
    socket.on("userConnected", ({ userId, name }) => {
        onlineUsers.set(userId, { socketId: socket.id, name });
        io.emit("updateOnlineUsers", Array.from(onlineUsers.entries()));
    });
    
    socket.on("disconnect", () => {
      for (let [userId, socketInfo] of onlineUsers.entries()) {
        if (socketInfo.socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit("updateOnlineUsers", Array.from(onlineUsers.entries()));
    });

    socket.on("taskUpdated", () => {io.emit("taskUpdated");});   
    socket.on("commentUpdated", () => {io.emit("commentUpdated");});
    socket.on("taskCreated", () => {io.emit("taskCreated");});   
});

app.get("/", (req, res) => {res.send("API is running...")});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
