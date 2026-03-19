import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, required: true },
  address: { type: String, default: "" },
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  zipCode: { type: String, default: "" },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  experience: { type: String, default: "" }, // e.g., "5 years in catering"
  skills: [{ type: String }], // e.g., ["Chef", "Server", "Event Manager"]
  availability: {
    type: String,
    enum: ["Full-time", "Part-time", "Event-based", "Weekend-only"],
    default: "Event-based",
  },
  expectedSalary: { type: Number, default: 0 },
  resume: { type: String, default: "" }, // URL or file path
  status: {
    type: String,
    enum: ["Pending", "Contacted", "Hired", "Rejected"],
    default: "Pending",
  },
  interestedProvider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider" },
  notes: { type: String, default: "" }, // Provider's notes about this staff
  contactedAt: { type: Date },
  hiredAt: { type: Date },
  lastLocationUpdate: { type: Date },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

staffSchema.index({ location: "2dsphere" });
staffSchema.index({ status: 1 });
staffSchema.index({ interestedProvider: 1 });
staffSchema.index({ createdAt: -1 });

staffSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Staff || mongoose.model("Staff", staffSchema);

