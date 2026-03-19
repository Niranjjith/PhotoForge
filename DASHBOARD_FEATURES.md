# Dashboard Features Guide

## Provider Dashboard Features

### 🎯 Main Features

#### 1. **Tabbed Interface**
- **Profile Tab**: Edit all business information
- **Images & Portfolio Tab**: Manage cover image, logo, and portfolio gallery
- **Menu Tab**: Add, edit, and remove menu items with images
- **Bookings Tab**: View recent bookings
- **Staff Tab**: Access staff applications

#### 2. **Image Management**
- **Cover Image**: Upload and test cover image URL
- **Logo**: Upload and test logo URL
- **Portfolio Images**: Add multiple portfolio images with test/preview
- **Menu Item Images**: Add images to each menu item with preview
- **Image Testing**: Test image URLs before saving
- **Image Removal**: Remove portfolio images with confirmation

#### 3. **Profile Editing**
- Business name, phone, email
- Address, city, state, zip code
- GPS coordinates (latitude/longitude)
- Service radius
- Description and bio
- Specialties (comma-separated)
- Years of experience
- Social media links (website, Facebook, Instagram, Twitter)

#### 4. **Menu Management**
- Add unlimited menu items
- Each item has: name, description, price per head, image
- Test images before saving
- Remove menu items
- Dynamic form with add/remove functionality

#### 5. **Booking Management**
- View recent bookings in dashboard
- Quick access to full booking list
- See booking status, dates, amounts
- Link to detailed booking management page

#### 6. **Staff Management**
- Quick access to staff applications
- View staff count in stats
- Link to full staff management page
- Filter by location, skills, status

#### 7. **Payment Integration**
- Payment status alert if not paid
- Link to complete payment
- Dashboard unlocked after payment

#### 8. **Statistics Dashboard**
- Total bookings count
- Average rating with stars
- Total reviews count
- Staff applications count

### 📍 Access
- URL: `/providers/dashboard`
- Requires: Provider account with payment completed

---

## Customer Dashboard Features

### 🎯 Main Features

#### 1. **Tabbed Interface**
- **Browse Providers Tab**: View all available providers
- **My Bookings Tab**: View booking history
- **Favorites Tab**: Saved favorite providers
- **My Reviews Tab**: Reviews you've written

#### 2. **Provider Browsing**
- Grid view of all providers
- Search and filter functionality
- Provider cards with:
  - Cover image
  - Business name
  - Rating with stars
  - Location
  - Review count
  - Favorite button
  - Quick view link

#### 3. **Booking Management**
- View all your bookings
- Booking status (Pending, Accepted, Rejected, Completed)
- Event details (date, guests, amount)
- Provider information
- Quick actions (View Provider, Write Review)
- Link to full booking details

#### 4. **Favorites System**
- Add/remove providers to favorites
- Heart icon toggle
- Favorites count in stats
- Persistent storage (localStorage)
- View all favorites in dedicated tab

#### 5. **Review Management**
- View all reviews you've written
- Star ratings displayed
- Review dates
- Provider information
- Link to provider profile

#### 6. **Statistics Dashboard**
- My Bookings count
- Favorites count
- Reviews Given count
- Total Spent amount

#### 7. **Quick Actions**
- Search providers
- Filter by city
- View provider details
- Book catering services
- Write reviews

### 📍 Access
- URL: `/customer/dashboard`
- Requires: Customer account
- Auto-redirect: Customers are redirected here after login

---

## Image Testing Feature

### How It Works:
1. Enter image URL in any image field
2. Click "Test" button
3. Preview appears below
4. If image loads correctly, click "Save"
5. Image is saved to your profile

### Supported Images:
- Cover Image (full-width banner)
- Logo (circular, 128x128px)
- Portfolio Images (gallery, multiple images)
- Menu Item Images (food/service photos)

### Image Requirements:
- Must be valid URL (http:// or https://)
- Supported formats: JPG, PNG, GIF, WebP
- Recommended size: 1200x600px for cover, 500x500px for portfolio

---

## Staff Application System

### For Staff Applicants:
1. Go to `/staff/register`
2. Fill in personal information
3. Add location (GPS tracking)
4. Add professional details (skills, experience)
5. Submit application
6. Providers can find and contact you

### For Providers:
1. Go to Provider Dashboard → Staff Tab
2. View all applications
3. Filter by status, location, skills
4. Find nearby staff (within 50km)
5. View detailed profiles
6. Update status (Contacted, Hired, Rejected)
7. Add notes about staff
8. Contact staff directly

---

## Booking Features

### For Customers:
- Enhanced booking form with:
  - Real-time total calculation
  - Service selection with prices
  - Event details (date, time, type, guests)
  - Location with GPS
  - Special requests
  - Student discount (10% automatic)

### For Providers:
- View all booking requests
- See customer details
- Event information
- Location with map link
- Amount breakdown
- Accept/Reject bookings
- Add provider notes
- Track booking status

---

## Payment Integration

### Provider Registration Payment:
1. Register as provider
2. Redirected to payment page
3. Pay ₹10 via PayPal
4. Receive premium PDF bill
5. Account activated
6. Full dashboard access

### Payment Status:
- Checked on dashboard load
- Alert shown if payment not completed
- Link to complete payment
- Dashboard features unlocked after payment

---

## Real-time Features

### Location Tracking:
- Staff can update location
- Providers can see staff distance
- GPS coordinates stored
- "Find Nearby" feature

### Live Calculations:
- Booking totals update in real-time
- Service selection updates price
- Student discount auto-applied

### Status Updates:
- Booking status changes instantly
- Staff application status updates
- Review ratings update provider rating

---

## Tips for Providers

1. **Complete Your Profile**: Fill all fields for better visibility
2. **Add Quality Images**: Use high-quality images for better appeal
3. **Test Images**: Always test images before saving
4. **Update Portfolio**: Regularly add new portfolio images
5. **Manage Menu**: Keep menu items updated with current prices
6. **Respond to Bookings**: Accept/reject bookings promptly
7. **Review Staff**: Check staff applications regularly
8. **Update Location**: Keep location accurate for better search results

---

## Tips for Customers

1. **Browse Providers**: Use search and filters to find caterers
2. **Check Ratings**: Look at star ratings and review counts
3. **Add Favorites**: Save providers you like for easy access
4. **Read Reviews**: Check customer reviews before booking
5. **Use Location**: Enable location for nearest providers
6. **Book Early**: Book in advance for better availability
7. **Write Reviews**: Share your experience after service
8. **Track Bookings**: Monitor booking status in dashboard

---

## Navigation

### Provider Navigation:
- Dashboard: `/providers/dashboard`
- Public Profile: `/providers/:id`
- Bookings: `/bookings/provider-bookings`
- Staff: `/staff/applications`

### Customer Navigation:
- Dashboard: `/customer/dashboard`
- Browse Providers: `/providers`
- My Bookings: `/bookings/my-bookings`
- Book Caterer: `/providers/:id/book`

---

All features are fully functional and ready to use! 🚀

## 📸 Screenshots

### 🏠 Home Page
![Home](./screenshots/home.png)

### 🔐 Login Page
![Login](./screenshots/login.png)

### 📝 Signup Page
![Signup](./screenshots/signup.png)

### 📊 Dashboard
![Dashboard](./screenshots/dashboard.png)