import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eventType: { type: String, required: true },
  eventDate: { type: Date, required: true },
  guests: { type: Number, required: true },
  services: [
    {
      name: String,
      description: String,
      quantity: Number,
      unitPrice: Number,
      total: Number,
    },
  ],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  validUntil: { type: Date, required: true },
  status: {
    type: String,
    enum: ["Draft", "Sent", "Accepted", "Rejected", "Expired"],
    default: "Draft",
  },
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

quotationSchema.index({ provider: 1 });
quotationSchema.index({ customer: 1 });
quotationSchema.index({ status: 1 });
quotationSchema.index({ validUntil: 1 });

quotationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Quotation || mongoose.model("Quotation", quotationSchema);

