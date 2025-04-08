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
    cors: { origin: "http://localhost:5173" },
    method: ["GET", "POST", 'PUT']
});

app.use(cors(
    {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use('/api/users', UserRoutes)
app.use("/api/tasks", TaskRoutes);
app.use("/api/comments", CommentRoutes);

io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("taskUpdated", () => {
        io.emit("taskUpdated");
      });
    
    socket.on("commentUpdated", () => {
      io.emit("commentUpdated");
    });

    socket.on("taskCreated", () => {
        io.emit("taskCreated");
    });
    
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

app.get("/", (req, res) => {
    res.send("API is running...");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
