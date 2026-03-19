import mongoose from "mongoose";

const serviceItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "", trim: true },
  pricePerHead: { type: Number, required: true, min: 0 },
  image: { type: String, default: "" },
  category: { type: String, default: "main" }, // appetizer, main, dessert, beverage
});

const providerSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  businessName: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  email: { type: String, default: "" },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  address: { type: String, default: "", trim: true },
  city: { type: String, default: "", trim: true },
  state: { type: String, default: "", trim: true },
  zipCode: { type: String, default: "" },
  description: { type: String, default: "", trim: true },
  menu: [serviceItemSchema],
  portfolio: {
    images: [{ type: String }], // Array of image URLs
    bio: { type: String, default: "" },
    specialties: [{ type: String }], // e.g., ["Weddings", "Corporate Events"]
    yearsOfExperience: { type: Number, default: 0 },
    certifications: [{ type: String }],
  },
  socialLinks: {
    website: { type: String, default: "" },
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    twitter: { type: String, default: "" },
  },
  coverImage: { type: String, default: "" },
  logo: { type: String, default: "" },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  serviceRadius: { type: Number, default: 50 }, // km
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

providerSchema.index({ location: "2dsphere" });
providerSchema.index({ owner: 1 });
providerSchema.index({ isFeatured: 1 });
providerSchema.index({ rating: -1 });

providerSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Provider || mongoose.model("Provider", providerSchema);
