import { Router } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

const router = Router()

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" })
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: "Email already in use" })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash })
    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET || "devsecret", { expiresIn: "7d" })
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email } })
  } catch (e) {
    res.status(500).json({ message: "Signup failed" })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: "Invalid credentials" })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ message: "Invalid credentials" })
    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET || "devsecret", { expiresIn: "7d" })
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email } })
  } catch (e) {
    res.status(500).json({ message: "Login failed" })
  }
})

export default router


