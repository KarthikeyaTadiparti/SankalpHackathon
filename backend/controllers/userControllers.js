const mongoose = require("mongoose");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const jwt_secret = process.env.JWT_SECRET;

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, jwt_secret, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ message: "User created successfully", userId: user._id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isMatch = bcryptjs.compareSync(password.trim(), user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password is wrong" });
    }

    const token = jwt.sign({ id: user._id }, jwt_secret, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful", userId: user._id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    // Clear the token cookie completely
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "Lax",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


const userDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = { login, register, logout, userDetails };
