import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"
import authRouter from "./routes/auth.js"
import eventsRouter from "./routes/events.js"
import swapsRouter from "./routes/swaps.js"

dotenv.config()

const app = express()
app.use(express.json())

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173"
// Allow any origin in dev to prevent CORS issues
app.use(cors({ origin: true, credentials: true }))

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "slotswapper", time: new Date().toISOString() })
})

app.use("/api/auth", authRouter)
app.use("/api/events", eventsRouter)
app.use("/api", swapsRouter)

const PORT = Number(process.env.PORT || 4000)
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/slotswapper"

async function start() {
  await mongoose.connect(MONGODB_URI)
  // Mask credentials if present in the URI
  console.log("MongoDB connected:", MONGODB_URI.replace(/:\/\/.*@/, "://***:***@"))
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error("Failed to start server", err)
  process.exit(1)
})

// Global error handler to surface errors
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err)
  res.status(500).json({ message: "Internal Server Error" })
})


