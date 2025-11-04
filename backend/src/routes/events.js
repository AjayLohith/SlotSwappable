import { Router } from "express"
import Event from "../models/Event.js"
import auth from "../middleware/auth.js"

const router = Router()

router.use(auth)

router.get("/", async (req, res) => {
  try {
    const events = await Event.find({ owner: req.user._id }).sort({ startTime: 1 })
    res.json(events)
  } catch (e) {
    console.error("GET /events failed", e)
    res.status(500).json({ message: "Failed to fetch events" })
  }
})

router.post("/", async (req, res) => {
  try {
    const { title, startTime, endTime } = req.body
    if (!title || !startTime || !endTime) return res.status(400).json({ message: "Missing fields" })
    const event = await Event.create({ title, startTime, endTime, owner: req.user._id, status: "BUSY" })
    res.status(201).json(event)
  } catch (e) {
    console.error("POST /events failed", e)
    res.status(500).json({ message: "Failed to create event" })
  }
})

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { title, startTime, endTime, status } = req.body
    const event = await Event.findOne({ _id: id, owner: req.user._id })
    if (!event) return res.status(404).json({ message: "Not found" })
    if (title !== undefined) event.title = title
    if (startTime !== undefined) event.startTime = startTime
    if (endTime !== undefined) event.endTime = endTime
    if (status !== undefined) event.status = status
    await event.save()
    res.json(event)
  } catch (e) {
    console.error("PATCH /events/:id failed", e)
    res.status(500).json({ message: "Failed to update event" })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Event.findOneAndDelete({ _id: id, owner: req.user._id })
    if (!deleted) return res.status(404).json({ message: "Not found" })
    res.status(204).send()
  } catch (e) {
    console.error("DELETE /events/:id failed", e)
    res.status(500).json({ message: "Failed to delete event" })
  }
})

export default router


