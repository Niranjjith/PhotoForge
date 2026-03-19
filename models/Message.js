import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  message: { type: String, default: "" },
  messageType: {
    type: String,
    enum: ["text", "voice", "image", "file"],
    default: "text",
  },
  voiceNote: {
    url: { type: String, default: "" },
    duration: { type: Number, default: 0 }, // seconds
  },
  attachments: [{ type: String }],
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ booking: 1 });
messageSchema.index({ createdAt: -1 });

export default mongoose.models.Message || mongoose.model("Message", messageSchema);

