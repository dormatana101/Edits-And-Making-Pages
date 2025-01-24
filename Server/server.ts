require("dotenv").config();
import http from "http";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth_route";
import postsRoutes from './routes/posts'; 
import commentsRoutes from './routes/comments'; 
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from "swagger-jsdoc";
import socketIo from "socket.io"; 
import chatRoutes from "./routes/chat_route";



const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});
app.use(bodyParser.json());

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API Documentation for the project',
    },
  },
  apis: ['./routes/*.ts'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/auth", authRoutes);
app.use("/posts", postsRoutes);
app.use("/comments", commentsRoutes);
app.use("/api", chatRoutes);


const server = http.createServer(app);
const io = new socketIo.Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("send_message", (message) => {
    console.log("Message received:", message);
    io.emit("new_message", message); 
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const initApp = (): Promise<http.Server> => {
  return new Promise<http.Server>((resolve, reject) => {
    if (process.env.DB_CONNECT === undefined) {
      console.error("DB_CONNECT is not defined");
      reject("DB_CONNECT is not defined");
      return;
    } else {
      mongoose
        .connect(process.env.DB_CONNECT)
        .then(() => {
          console.log("Connected to database");

          resolve(server); 
        })
        .catch((err) => {
          console.error("Database connection error:", err);
          reject(err);
        });
    }
  });
};

export default initApp;
