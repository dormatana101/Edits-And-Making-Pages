import http from "http";
import https from "https";
import fs from "fs";
import socketIo from "socket.io";
import initApp from "./server"; 
import { setupSocket } from "./controllers/socketService";

const port = process.env.PORT || 4000;

initApp().then((app: any) => {
  let server: http.Server | https.Server;
  
  if (process.env.NODE_ENV !== "production") {
    server = http.createServer(app);
  } else {
    const options = {
      key: fs.readFileSync("./client-key.pem"),
      cert: fs.readFileSync("./client-cert.pem"),
    };
    server = https.createServer(options, app);
  }
  
  const io = new socketIo.Server(server, {
    cors: {
      origin: process.env.CLIENT_CONNECT,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  
  setupSocket(io);
  
  server.listen(port, () => {
    console.log(`The server is listening on port ${port}`);
  });
}).catch((error) => {
  console.error("Error initializing app:", error);
});
