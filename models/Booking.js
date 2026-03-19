import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true },
  services: [{ 
    name: String, 
    pricePerHead: Number,
    quantity: { type: Number, default: 1 }
  }],
  eventDate: { type: Date, required: true },
  eventTime: { type: String, default: "" },
  guests: { type: Number, required: true, min: 1 },
  eventType: { type: String, default: "Other" }, // Wedding, Birthday, Corporate, Other
  eventLocation: {
    address: { type: String, required: true },
    city: { type: String, default: "" },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  specialRequests: { type: String, default: "" },
  totalAmount: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "Accepted", "Rejected", "Completed", "Cancelled"],
    default: "Pending" 
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Partial", "Paid", "Refunded"],
    default: "Pending"
  },
  customerNotes: { type: String, default: "" },
  providerNotes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

bookingSchema.index({ customer: 1 });
bookingSchema.index({ provider: 1 });
bookingSchema.index({ eventDate: 1 });
bookingSchema.index({ status: 1 });

bookingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
