import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider" },
  date: { type: Date, required: true, default: Date.now },
  metrics: {
    views: { type: Number, default: 0 },
    bookings: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    cancellations: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    newCustomers: { type: Number, default: 0 },
    repeatCustomers: { type: Number, default: 0 },
  },
  forecasts: {
    nextMonthBookings: { type: Number, default: 0 },
    nextMonthRevenue: { type: Number, default: 0 },
    peakDays: [{ type: String }],
    recommendedPricing: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

analyticsSchema.index({ provider: 1, date: -1 });
analyticsSchema.index({ date: -1 });

export default mongoose.models.Analytics || mongoose.model("Analytics", analyticsSchema);

