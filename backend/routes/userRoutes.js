const router = require("express").Router();
const {login,register,userDetails} = require("../controllers/userControllers");
const verifyToken = require("../middleware/authMiddleware");


router.post("/login",login);
router.post("/register",register);
router.get("/userDetails",verifyToken,userDetails);

module.exports = router;
