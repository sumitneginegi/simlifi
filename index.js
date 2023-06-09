const express = require("express");
const mongoose = require("mongoose");  
const cors = require("cors");

const app = express();
const router = express.Router()
const bodyparser = require("body-parser");
const userRouter = require("./src/route/user")


require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 2022;

mongoose
  .connect("mongodb+srv://simlifi:uNTTxXNXD8KBc2GP@cluster0.jjfrdfm.mongodb.net/")
  .then(() => {
    console.log("Db conneted succesfully");
  })
  .catch((err) => {
    console.log(err);
  });


  app.get('/home',(req,res)=>{
res.send("hello world")
  })
app.use("/api/v1", userRouter);

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
