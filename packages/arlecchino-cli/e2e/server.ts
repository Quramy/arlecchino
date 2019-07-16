import path from "path";
import express from "express";

const app = express();

app.use("/", express.static(path.join(__dirname, "static")));

app.listen(3000, () => {
  console.log("Server started with 3000 port.");
});
