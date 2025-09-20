const express = require("express");
require("dotenv").config();
const connectToDb = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");


const userRoutes = require("./routes/userRoutes");

const app = express();
const port = process.env.PORT;

  
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", // NOT '*'
  credentials: true,              // ✅ Allow cookies
}));

app.use(cookieParser());



connectToDb();

app.get("/",(req,res)=>{
    res.send("Hey there!!")
})
   
// API Routes
app.use("/api/users",userRoutes);

app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
})