import https from "https";
import initApp from "./server";
const port = process.env.PORT || 4000;
import fs from "fs";


initApp().then((app:any) => {
  if(process.env.NODE_ENV!="production"){
  app.listen(port, () => {
    console.log(`The server is listening on port ${port}`);
  });
}
else{
  const prop={
    key: fs.readFileSync("../client-key.pem"),
    cert: fs.readFileSync("../client-cert.pem"),
  }
  https.createServer(prop,app).listen(port,()=>{
    console.log(`The server is listening on port ${port}`);
  });
}
});


