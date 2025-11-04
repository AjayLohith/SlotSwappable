import { Router } from "express"
import auth from "../middleware/auth.js"
import Event from "../models/Event.js"
import SwapRequest from "../models/SwapRequest.js"

const router = Router()

router.use(auth)

// GET /api/swappable-slots
router.get("/swappable-slots", async (req, res) => {
  try {
    const slots = await Event.find({ status: "SWAPPABLE", owner: { $ne: req.user._id } }).sort({ startTime: 1 })
    res.json(slots)
  } catch (e) {
    console.error("GET /swappable-slots failed", e)
    res.status(500).json({ message: "Failed to fetch swappable slots" })
  }
})

// POST /api/swap-request
router.post("/swap-request", async (req, res) => {
  try {
    const { mySlotId, theirSlotId } = req.body
    const my = await Event.findOne({ _id: mySlotId, owner: req.user._id })
    const theirs = await Event.findById(theirSlotId)
    if (!my || !theirs) return res.status(404).json({ message: "Slot not found" })
    if (my.status !== "SWAPPABLE" || theirs.status !== "SWAPPABLE") return res.status(400).json({ message: "Slots not swappable" })
    if (String(theirs.owner) === String(req.user._id)) return res.status(400).json({ message: "Cannot swap with yourself" })

    const session = await Event.startSession()
    await session.withTransaction(async () => {
      await Event.updateOne({ _id: my._id }, { $set: { status: "SWAP_PENDING" } })
      await Event.updateOne({ _id: theirs._id }, { $set: { status: "SWAP_PENDING" } })
      await SwapRequest.create({ fromUser: req.user._id, toUser: theirs.owner, fromEvent: my._id, toEvent: theirs._id })
    })
    session.endSession()
    res.status(201).json({ ok: true })
  } catch (e) {
    console.error("POST /swap-request failed", e)
    res.status(500).json({ message: "Failed to create swap request" })
  }
})

// GET /api/swap-requests
router.get("/swap-requests", async (req, res) => {
  try {
    const incoming = await SwapRequest.find({ toUser: req.user._id })
      .sort({ createdAt: -1 })
      .populate("fromUser", "name email")
      .populate("fromEvent")
      .populate("toEvent")
    const outgoing = await SwapRequest.find({ fromUser: req.user._id })
      .sort({ createdAt: -1 })
      .populate("toUser", "name email")
      .populate("fromEvent")
      .populate("toEvent")
    res.json({ incoming, outgoing })
  } catch (e) {
    console.error("GET /swap-requests failed", e)
    res.status(500).json({ message: "Failed to fetch swap requests" })
  }
})

// POST /api/swap-response/:id
router.post("/swap-response/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { accept } = req.body
    const reqDoc = await SwapRequest.findById(id)
    if (!reqDoc) return res.status(404).json({ message: "Request not found" })
    if (String(reqDoc.toUser) !== String(req.user._id)) return res.status(403).json({ message: "Not allowed" })
    if (reqDoc.status !== "PENDING") return res.status(400).json({ message: "Already handled" })

    const fromEvent = await Event.findById(reqDoc.fromEvent)
    const toEvent = await Event.findById(reqDoc.toEvent)
    if (!fromEvent || !toEvent) return res.status(404).json({ message: "Events missing" })

    const session = await Event.startSession()
    await session.withTransaction(async () => {
      if (!accept) {
        reqDoc.status = "REJECTED"
        await reqDoc.save()
        await Event.updateOne({ _id: fromEvent._id }, { $set: { status: "SWAPPABLE" } })
        await Event.updateOne({ _id: toEvent._id }, { $set: { status: "SWAPPABLE" } })
        return
      }

      const fromOwner = fromEvent.owner
      const toOwner = toEvent.owner
      await Event.updateOne({ _id: fromEvent._id }, { $set: { owner: toOwner, status: "BUSY" } })
      await Event.updateOne({ _id: toEvent._id }, { $set: { owner: fromOwner, status: "BUSY" } })
      reqDoc.status = "ACCEPTED"
      await reqDoc.save()
    })
    session.endSession()

    res.json({ ok: true })
  } catch (e) {
    console.error("POST /swap-response/:id failed", e)
    res.status(500).json({ message: "Failed to process swap response" })
  }
})

export default router


