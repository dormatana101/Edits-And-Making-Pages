require("dotenv").config();
import express, { Express } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import authRoutes from "./routes/auth_route";
import postsRoutes from './routes/posts'; 
import commentsRoutes from './routes/comments'; 
import swaggerUi from 'swagger-ui-express'; // импортируем Swagger UI
import swaggerJsDoc from "swagger-jsdoc";

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



// Роуты для API
app.use("/auth", authRoutes);
app.use("/posts", postsRoutes);
app.use("/comments", commentsRoutes);


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
          app.use("/posts", postsRoutes); 
          app.use("/comments", commentsRoutes); 

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
