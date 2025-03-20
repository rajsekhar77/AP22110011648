import express from "express";
import router from "./routers/user.js";

const PORT = 3000;
const app = express();

app.use(express.json());

app.use("/", router);

app.get("/", (req, res) => {
  res.send("api working");
});

app.listen(PORT, (req, res) => {
  console.log(`server is running on port: ${PORT}`);
});
