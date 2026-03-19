import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Provider from "../models/Provider.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import connectDB from "../config/db.js";

dotenv.config();

const sampleProviders = [
  {
    businessName: "Frame & Light Studio",
    phone: "+91 9876543210",
    email: "studio@frameandlight.com",
    address: "123 Art Street",
    city: "Mumbai",
    state: "Maharashtra",
    zipCode: "400001",
    description: "Wedding and portrait photography with a cinematic touch. We specialize in candid moments, editorial style, and cinematic wedding films.",
    location: {
      type: "Point",
      coordinates: [72.8777, 19.0760],
    },
    menu: [
      {
        name: "Wedding Photography (Full Day)",
        description: "Full-day coverage, 500+ edited photos, album design, online gallery",
        pricePerHead: 800,
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
        category: "photography",
      },
      {
        name: "Portrait Session",
        description: "1–2 hour portrait shoot, 30 edited high-res images",
        pricePerHead: 350,
        image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
        category: "photography",
      },
      {
        name: "Event Coverage (Half Day)",
        description: "Corporate or private event, 4 hours, 200+ edited photos",
        pricePerHead: 600,
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
        category: "photography",
      },
    ],
    portfolio: {
      images: [
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1452587925148-ce4e3d4b2b7b?auto=format&fit=crop&w=1200&q=80",
      ],
      bio: "With over 12 years of experience, Frame & Light Studio delivers wedding and portrait photography that feels both timeless and modern. We focus on natural light and candid moments.",
      specialties: ["Wedding Photography", "Portrait", "Event Coverage"],
      yearsOfExperience: 12,
      certifications: ["Professional Photographers of America"],
    },
    socialLinks: {
      website: "https://frameandlight.com",
      instagram: "https://instagram.com/frameandlight",
    },
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80",
    logo: "https://images.unsplash.com/photo-1452587925148-ce4e3d4b2b7b?auto=format&fit=crop&w=200&q=80",
    rating: 4.8,
    totalReviews: 45,
    isVerified: true,
    isFeatured: true,
    serviceRadius: 50,
  },
  {
    businessName: "Edit Flow Video",
    phone: "+91 9876543211",
    email: "hello@editflowvideo.com",
    address: "456 Media Park",
    city: "Delhi",
    state: "Delhi",
    zipCode: "110001",
    description: "Professional video editing for weddings, commercials, and social content. Color grading, motion graphics, and quick turnaround.",
    location: {
      type: "Point",
      coordinates: [77.2090, 28.6139],
    },
    menu: [
      {
        name: "Wedding Film (Highlight)",
        description: "5–8 min highlight film, color grading, music, drone footage edit",
        pricePerHead: 450,
        image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80",
        category: "video",
      },
      {
        name: "Commercial / Brand Video",
        description: "Up to 2 min promo, cuts and motion graphics",
        pricePerHead: 550,
        image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=800&q=80",
        category: "video",
      },
      {
        name: "Social Reels / Shorts",
        description: "Up to 60 sec edited reels from your raw clips",
        pricePerHead: 200,
        image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=800&q=80",
        category: "video",
      },
    ],
    portfolio: {
      images: [
        "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=1200&q=80",
      ],
      bio: "Edit Flow Video brings a cinematic eye to wedding films and brand content. Fast turnaround and consistent quality.",
      specialties: ["Wedding Films", "Commercial", "Social Content"],
      yearsOfExperience: 8,
    },
    coverImage: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=2000&q=80",
    rating: 4.6,
    totalReviews: 32,
    isVerified: true,
    isFeatured: true,
    serviceRadius: 40,
  },
  {
    businessName: "Pixel Craft Photography",
    phone: "+91 9876543212",
    email: "book@pixelcraft.in",
    address: "789 Creative Hub",
    city: "Bangalore",
    state: "Karnataka",
    zipCode: "560001",
    description: "Lifestyle and commercial photography. Product shots, brand campaigns, and personal branding sessions.",
    location: {
      type: "Point",
      coordinates: [77.5946, 12.9716],
    },
    menu: [
      {
        name: "Product Photography (10 shots)",
        description: "E-commerce or catalog, white/ lifestyle backdrop, edited files",
        pricePerHead: 700,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
        category: "photography",
      },
      {
        name: "Personal Branding Session",
        description: "2-hour shoot, 25 edited images for LinkedIn/social",
        pricePerHead: 900,
        image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
        category: "photography",
      },
    ],
    portfolio: {
      images: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
      ],
      bio: "Pixel Craft focuses on clean, commercial-grade imagery for brands and professionals. Fast delivery and consistent style.",
      specialties: ["Product", "Commercial", "Personal Branding"],
      yearsOfExperience: 8,
    },
    coverImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=2000&q=80",
    rating: 4.7,
    totalReviews: 28,
    isVerified: true,
    serviceRadius: 60,
  },
  {
    businessName: "CineStory Films",
    phone: "+91 9876543213",
    email: "hello@cinestoryfilms.com",
    address: "202 Film Lane",
    city: "Mumbai",
    state: "Maharashtra",
    zipCode: "400002",
    description: "Wedding cinematography and corporate videos. We create cinematic wedding films and brand stories that resonate.",
    location: { type: "Point", coordinates: [72.8822, 19.0825] },
    menu: [
      { name: "Wedding Film (Full Day)", description: "Full-day coverage, 15–20 min film, drone, highlight reel", pricePerHead: 1200, image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&w=800&q=80", category: "video" },
      { name: "Pre-Wedding Shoot", description: "2-hour shoot, 3–5 min video, scenic locations", pricePerHead: 800, image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80", category: "video" },
    ],
    portfolio: {
      images: [
        "https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
      ],
      bio: "CineStory Films specializes in wedding and pre-wedding cinematography with a cinematic, emotional storytelling approach.",
      specialties: ["Wedding Films", "Pre-Wedding", "Corporate"],
      yearsOfExperience: 7,
    },
    coverImage: "https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&w=2000&q=80",
    rating: 4.9,
    totalReviews: 52,
    isVerified: true,
    isFeatured: true,
    serviceRadius: 80,
  },
  {
    businessName: "Moment Lens Photography",
    phone: "+91 9876543214",
    email: "book@momentlens.in",
    address: "55 Creative Block",
    city: "Pune",
    state: "Maharashtra",
    zipCode: "411001",
    description: "Candid and lifestyle photography for weddings, engagements, and maternity. Natural, emotional, and timeless.",
    location: { type: "Point", coordinates: [73.8567, 18.5204] },
    menu: [
      { name: "Wedding Candid (Full Day)", description: "Full-day candid coverage, 400+ edited photos, soft copy", pricePerHead: 650, image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80", category: "photography" },
      { name: "Engagement Shoot", description: "3–4 hour shoot, 80 edited photos", pricePerHead: 400, image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80", category: "photography" },
    ],
    portfolio: {
      images: [
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200&q=80",
      ],
      bio: "Moment Lens captures real emotions and candid moments. Specializing in wedding and engagement photography.",
      specialties: ["Candid", "Wedding", "Engagement"],
      yearsOfExperience: 6,
    },
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80",
    rating: 4.8,
    totalReviews: 38,
    isVerified: true,
    isFeatured: true,
    serviceRadius: 60,
  },
  {
    businessName: "Clip Masters Studio",
    phone: "+91 9876543215",
    email: "contact@clipmasters.in",
    address: "88 Media Complex",
    city: "Bangalore",
    state: "Karnataka",
    zipCode: "560002",
    description: "Professional video editing for YouTube, ads, and social media. Fast turnaround, color grading, and motion graphics.",
    location: { type: "Point", coordinates: [77.6065, 12.9698] },
    menu: [
      { name: "YouTube Edit (10 min)", description: "Cut, color grade, thumbnails, up to 10 min video", pricePerHead: 300, image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=800&q=80", category: "video" },
      { name: "Ad / Promo (60 sec)", description: "Commercial promo, motion graphics, sound design", pricePerHead: 500, image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=800&q=80", category: "video" },
    ],
    portfolio: {
      images: [
        "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=1200&q=80",
      ],
      bio: "Clip Masters delivers professional video edits for creators and brands. Quick turnaround and consistent quality.",
      specialties: ["YouTube", "Ads", "Social"],
      yearsOfExperience: 5,
    },
    coverImage: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=2000&q=80",
    rating: 4.6,
    totalReviews: 24,
    isVerified: true,
    serviceRadius: 0,
  },
  {
    businessName: "Urban Lens Co",
    phone: "+91 9876543216",
    email: "hello@urbanlens.co",
    address: "12 Street Photography Hub",
    city: "Hyderabad",
    state: "Telangana",
    zipCode: "500001",
    description: "Street, travel, and event photography. Bold, dynamic, and editorial-style imagery.",
    location: { type: "Point", coordinates: [78.4867, 17.3850] },
    menu: [
      { name: "Event Coverage (4 hrs)", description: "Corporate or cultural event, 150+ edited photos", pricePerHead: 550, image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80", category: "photography" },
      { name: "Travel / Brand Shoot", description: "Half-day shoot, 100 edited images, editorial style", pricePerHead: 750, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80", category: "photography" },
    ],
    portfolio: {
      images: [
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      ],
      bio: "Urban Lens Co brings editorial and travel photography to events and brands. Distinctive, bold visuals.",
      specialties: ["Events", "Travel", "Editorial"],
      yearsOfExperience: 9,
    },
    coverImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=2000&q=80",
    rating: 4.7,
    totalReviews: 31,
    isVerified: true,
    isFeatured: true,
    serviceRadius: 70,
  },
  {
    businessName: "Reel Edit Pro",
    phone: "+91 9876543217",
    email: "book@reeleditpro.com",
    address: "99 Content Park",
    city: "Chennai",
    state: "Tamil Nadu",
    zipCode: "600001",
    description: "Short-form video editing for Instagram, TikTok, and YouTube Shorts. Viral-style edits, transitions, and effects.",
    location: { type: "Point", coordinates: [80.2707, 13.0827] },
    menu: [
      { name: "Reels Package (5 videos)", description: "5 reels/shorts, trendy edits, captions", pricePerHead: 250, image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=800&q=80", category: "video" },
      { name: "Single Reel (Premium)", description: "1 viral-style reel with music, effects", pricePerHead: 150, image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=800&q=80", category: "video" },
    ],
    portfolio: {
      images: [
        "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1200&q=80",
      ],
      bio: "Reel Edit Pro specializes in short-form video edits that get views. Fast, trendy, and optimized for algorithms.",
      specialties: ["Reels", "Shorts", "TikTok"],
      yearsOfExperience: 4,
    },
    coverImage: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=2000&q=80",
    rating: 4.5,
    totalReviews: 18,
    isVerified: true,
    serviceRadius: 0,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Provider.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});

    // Create admin user
    console.log("👤 Creating admin user...");
    const admin = new User({
      name: "Admin User",
      email: "admin@GraphyHub.com",
      password: "admin123",
      role: "admin",
    });
    await admin.save();
    console.log("✅ Admin created: admin@GraphyHub.com / admin123");

    // Create sample customers
    console.log("👥 Creating sample customers...");
    const customer1 = new User({
      name: "Sayed Sharaz",
      email: "sayed@example.com",
      password: "password123",
      role: "customer",
      isStudent: true,
    });
    await customer1.save();

    const customer2 = new User({
      name: "Jane Smith",
      email: "jane@example.com",
      password: "password123",
      role: "customer",
    });
    await customer2.save();

    const customer3 = new User({
      name: "Rahul Kumar",
      email: "rahul@example.com",
      password: "password123",
      role: "customer",
      isStudent: true,
    });
    await customer3.save();

    const customer4 = new User({
      name: "Priya Sharma",
      email: "priya@example.com",
      password: "password123",
      role: "customer",
    });
    await customer4.save();

    const customer5 = new User({
      name: "Alex Johnson",
      email: "alex@example.com",
      password: "password123",
      role: "customer",
    });
    await customer5.save();
    console.log("✅ Customers created");

    // Create provider users and providers
    console.log("🏪 Creating providers...");
    const providerUsers = [];
    for (let i = 0; i < sampleProviders.length; i++) {
      const providerUser = new User({
        name: `Provider ${i + 1}`,
        email: sampleProviders[i].email,
        password: "password123",
        role: "provider",
      });
      await providerUser.save();
      providerUsers.push(providerUser);

      const provider = new Provider({
        ...sampleProviders[i],
        owner: providerUser._id,
      });
      await provider.save();
      console.log(`✅ Provider created: ${provider.businessName}`);
    }

    // Create sample bookings
    console.log("📅 Creating sample bookings...");
    const booking1 = new Booking({
      customer: customer1._id,
      provider: (await Provider.findOne({ businessName: "Frame & Light Studio" }))._id,
      services: [
        { name: "Wedding Photography (Full Day)", pricePerHead: 800, quantity: 1 },
      ],
      eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      eventTime: "10:00",
      guests: 1,
      eventType: "Wedding",
      eventLocation: {
        address: "Grand Hotel, Mumbai",
        city: "Mumbai",
        coordinates: [72.8777, 19.0760],
      },
      specialRequests: "Candid focus, sunset shots preferred",
      totalAmount: 800,
      discount: 80,
      finalAmount: 720,
      status: "Accepted",
    });
    await booking1.save();

    // Create sample reviews
    console.log("⭐ Creating sample reviews...");
    const review1 = new Review({
      customer: customer1._id,
      provider: (await Provider.findOne({ businessName: "Frame & Light Studio" }))._id,
      booking: booking1._id,
      rating: 5,
      comment: "Excellent work! The photos were stunning and delivery was on time. Highly recommended!",
    });
    await review1.save();

    console.log("✅ Database seeded successfully!");
    console.log("\n" + "=".repeat(60));
    console.log("📝 LOGIN CREDENTIALS (password: same as shown)");
    console.log("=".repeat(60));
    console.log("\n🔐 ADMIN:");
    console.log("   Email: admin@GraphyHub.com");
    console.log("   Password: admin123");
    console.log("\n👤 CUSTOMERS (Client role - view portfolios & book):");
    console.log("   sayed@example.com   / password123  (Student)");
    console.log("   jane@example.com    / password123");
    console.log("   rahul@example.com   / password123  (Student)");
    console.log("   priya@example.com   / password123");
    console.log("   alex@example.com    / password123");
    console.log("\n📷 CREATORS (Provider - add portfolio, manage services):");
    console.log("   studio@frameandlight.com  / password123  (Frame & Light Studio)");
    console.log("   hello@editflowvideo.com   / password123  (Edit Flow Video)");
    console.log("   book@pixelcraft.in        / password123  (Pixel Craft Photography)");
    console.log("   hello@cinestoryfilms.com  / password123  (CineStory Films)");
    console.log("   book@momentlens.in        / password123  (Moment Lens Photography)");
    console.log("   contact@clipmasters.in    / password123  (Clip Masters Studio)");
    console.log("   hello@urbanlens.co        / password123  (Urban Lens Co)");
    console.log("   book@reeleditpro.com      / password123  (Reel Edit Pro)");
    console.log("\n" + "=".repeat(60));
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();

