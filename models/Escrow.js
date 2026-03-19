import mongoose from "mongoose";

const escrowSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  status: {
    type: String,
    enum: ["Pending", "Held", "Released", "Refunded", "Disputed"],
    default: "Pending",
  },
  releaseConditions: {
    eventCompleted: { type: Boolean, default: false },
    customerApproval: { type: Boolean, default: false },
    daysAfterEvent: { type: Number, default: 0 },
  },
  releasedAt: { type: Date },
  releasedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  disputeReason: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

escrowSchema.index({ booking: 1 });
escrowSchema.index({ provider: 1 });
escrowSchema.index({ customer: 1 });
escrowSchema.index({ status: 1 });

escrowSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Escrow || mongoose.model("Escrow", escrowSchema);

