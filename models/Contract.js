import mongoose from "mongoose";

const contractSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  contractType: {
    type: String,
    enum: ["Standard", "Premium", "Custom"],
    default: "Standard",
  },
  terms: {
    paymentTerms: { type: String, default: "50% advance, 50% on completion" },
    cancellationPolicy: { type: String, default: "7 days notice required" },
    liability: { type: String, default: "Provider insured" },
    forceMajeure: { type: String, default: "Standard force majeure clause" },
  },
  status: {
    type: String,
    enum: ["Draft", "Pending", "Accepted", "Active", "Completed", "Cancelled"],
    default: "Draft",
  },
  signedAt: { type: Date },
  expiresAt: { type: Date },
  compliance: {
    fssaiLicense: { type: String, default: "" },
    insuranceValid: { type: Boolean, default: false },
    taxCompliant: { type: Boolean, default: false },
    healthPermit: { type: String, default: "" },
  },
  autoRenew: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

contractSchema.index({ provider: 1 });
contractSchema.index({ customer: 1 });
contractSchema.index({ booking: 1 });
contractSchema.index({ status: 1 });

contractSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Contract || mongoose.model("Contract", contractSchema);

