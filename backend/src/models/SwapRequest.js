import mongoose, { Schema } from "mongoose"

const swapRequestSchema = new Schema(
  {
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fromEvent: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    toEvent: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED"], default: "PENDING" }
  },
  { timestamps: true }
)

const SwapRequest = mongoose.models.SwapRequest || mongoose.model("SwapRequest", swapRequestSchema)
export default SwapRequest


