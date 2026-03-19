import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: String, required: true, unique: true },
  paymentId: { type: String, default: "" },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "cancelled"],
    default: "pending",
  },
  paypalOrderId: { type: String, default: "" },
  paymentMethod: { type: String, default: "paypal" },
  billPdf: { type: String, default: "" }, // Path to PDF file
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

paymentSchema.index({ user: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ paypalOrderId: 1 });

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

