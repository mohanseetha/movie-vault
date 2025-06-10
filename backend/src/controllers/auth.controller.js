import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const signup = async (req, res) => {
  try {
    const { name, username, mail, password, confirmPassword } = req.body;
    if (!name || !username || !mail || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }
    const existingEmail = await User.findOne({ mail });
    if (existingEmail) {
      return res.status(409).json({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      username,
      mail,
      password: hashedPassword,
      logged: [],
      watchlist: [],
      joined: new Date(),
    });
    const token = jwt.sign({ user_id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "3h",
    });
    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        username: user.username,
        logged: user.logged,
        watchlist: user.watchlist,
        joined: user.joined,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to register user" });
  }
};

export const login = async (req, res) => {
  try {
    const { user, password } = req.body;
    if (!user || !password) {
      return res
        .status(400)
        .json({ error: "Username/Email and Password are required" });
    }
    const foundUser = await User.findOne({
      $or: [{ username: user }, { mail: user }],
    });
    if (!foundUser) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ user_id: foundUser._id }, process.env.SECRET_KEY, {
      expiresIn: "3h",
    });
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        username: foundUser.username,
        logged: foundUser.logged,
        watchlist: foundUser.watchlist,
        joined: foundUser.joined,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Login failed" });
  }
};
