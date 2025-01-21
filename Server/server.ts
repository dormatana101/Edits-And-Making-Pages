require("dotenv").config();
import express, { Express } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import authRoutes from "./routes/auth_route";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use(bodyParser.json());

// Роуты
app.use("/auth", authRoutes);

const initApp = () => {
  return new Promise<Express>((resolve, reject) => {
    if (process.env.DB_CONNECT === undefined) {
      console.error("DB_CONNECT is not defined");
      reject("DB_CONNECT is not defined");
      return;
    } else {
      mongoose
        .connect(process.env.DB_CONNECT)
        .then(() => {
          console.log("Connected to database");

          app.use(bodyParser.json());
          app.use("/auth", authRoutes);

          resolve(app);
        })
        .catch((err) => {
          console.error("Database connection error:", err);
          reject(err);
        });
    }
  });
};

export default initApp;
