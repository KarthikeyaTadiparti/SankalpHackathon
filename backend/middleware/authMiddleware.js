const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ msg: "Unauthorized - No Token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = decoded; // user._id is available
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};
 
module.exports = verifyToken;
