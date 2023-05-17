const express = require("express");
const mongoose = require("mongoose");  
const cors = require("cors");

const app = express();
const bodyparser = require("body-parser");
// const serverless = require('serverless-http')
const userRouter = require("./src/route/user");
// const walletRouter = require("./routes/wallet");
// const paymentRouter=require("./routes/payment")



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

app.use("/api/v1", userRouter);
// app.use("/api/wallet", walletRouter);
// app.use("/paymentRouter",paymentRouter)



function errorHandler(err, req, res, next) {
  console.error(err.stack); // log the error to the console

  // check if the error has a custom message
  const errorMessage = err.message || "Something went wrong!";

  // send an error response to the client with the custom message
  res.status(500).json({ message: errorMessage });
}
module.exports = errorHandler;



app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

// module.exports = {
//   handler: serverless(app)
// }