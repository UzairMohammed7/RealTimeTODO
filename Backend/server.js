const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/db");
const UserRoutes = require("./routes/userRoutes")

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" },
    method: ["GET", "POST"]
});

app.use(cors());
app.use(express.json());
app.use('/users', UserRoutes)

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
