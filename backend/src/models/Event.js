import mongoose, { Schema } from "mongoose"

const eventSchema = new Schema(
  {
    title: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ["BUSY", "SWAPPABLE", "SWAP_PENDING"], default: "BUSY" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }
  },
  { timestamps: true }
)

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema)
export default Event


