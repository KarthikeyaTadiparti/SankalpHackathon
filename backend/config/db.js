const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI;

const connectToDb = async () => {
  await mongoose
    .connect(MONGO_URI)
    .then(() => console.log("MongoDb Connected Successfully!"))
    .catch(() => console.log("Error in connecting"));
};

module.exports = connectToDb;
