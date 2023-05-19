const express = require("express");
const mongoose = require("mongoose");  
const cors = require("cors");

const app = express();
const bodyparser = require("body-parser");
// const serverless = require('serverless-http')
const userRouter = require("./src/route/user")


require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 2023;

mongoose
  .connect(process.env.DB_URI)
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

// module.exports = {
//   handler: serverless(app)
// }