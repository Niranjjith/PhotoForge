import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: "", trim: true },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

reviewSchema.index({ provider: 1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ createdAt: -1 });

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);

