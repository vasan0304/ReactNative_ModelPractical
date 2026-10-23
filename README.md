# FreshMart - Modern React Native Grocery Shop Mobile App
**RVS College of Arts and Science (Autonomous) — School of Computer Studies (SCS) MCA**  
**Core Elective-II: Mobile App Development using React Native (Oct 2026)**

---

## 🌟 Overview & Architecture

This application is built with **React Native** and **Expo**, designed according to modern mobile grocery shop UI standards (clean pastel cards, fresh produce imagery, badge accents, and intuitive touch interactions).

It satisfies all exam criteria across **Screens (Part I)**, **React Navigation (Part II)**, and **Functional Requirements (Part III)**.

---

## 📱 Navigation Structure (Part II - 30 Marks)

The app combines all **three** core navigation patterns:

1. **Stack Navigation (`@react-navigation/native-stack`)**
   - `AuthScreen`: Sign Up & Sign In with form validation.
   - `MainDrawer`: Wraps the drawer navigation.
   - `ProductDetail`: Dedicated detail screen opened when any grocery item is selected.
   - `EditProfile`: Customer profile modification form with validation.

2. **Bottom Tabs Navigation (`@react-navigation/bottom-tabs`)**
   - 🛒 **Daily Grocery**: Main grocery catalog with categories and search.
   - ❤️ **Favorites**: Saved items with badge count.
   - 🛍️ **My Cart**: Active shopping cart with real-time item count badge.
   - 👤 **Profile**: Customer / Admin profile overview.

3. **Drawer Navigation (`@react-navigation/drawer`)**
   - Custom sidebar drawer accessible via the top hamburger icon or swipe gesture:
     - Daily Grocery Store
     - Explore Categories
     - Favorite Items
     - My Shopping Cart
     - Profile & Settings
     - One-touch User Role Switcher (Customer / Student ↔ Admin)
     - Sign Out / Switch User

---

## 📋 Screens & Features (Part I & III - 45 Marks)

| Screen | Users | Description & Validation |
| :--- | :--- | :--- |
| **1. Home / Auth Screen** | Admin & Customer | Toggle between Sign In & Sign Up. Role selector. Form validation for name, email pattern, 6+ character password, and 10-digit phone number. Quick demo login buttons provided. |
| **2. Daily Grocery Products List** | Admin & Customer | Real-time search bar, category chips (*All, Vegetables, Fruits, Dairy, Bakery, Beverages*), 30% discount promo banner, and product cards with rating, price, and instant `+ Add` button. Admin includes an "Add Product" modal with input validation. |
| **3. Profile & Edit Profile** | Customer | Shows avatar, role badge, phone, delivery address, and quick stats. The Edit Profile screen provides validated editing of name, email, phone (10 digits), and address. |
| **4. Add Favorite Screen** | Customer | Displays favorited grocery items. Allows removing favorites, adding individual items to cart, or tapping **"Add All to Cart"** to add multiple products simultaneously. |
| **5. Product Details Screen** | Customer / Student | Large product hero image, 100% organic badge, rating, description, freshness cards, and a quantity stepper (`-` and `+`) with dynamic price computation before adding to cart. |
| **6. My Cart Screen** | Admin & Customer | List of basket items with thumbnail, unit, and **Add (`+`) / Subtract (`-`) stepper** (decrementing at 1 removes item). Supports promo coupons (e.g. `FRESH20` for 20% discount), delivery fee calculation, and order placement modal. |

---

## 🚀 How to Run the Application

The development server is currently active on port `8081`.

### 1. View in Web Browser
Open your browser and navigate to:
```
http://localhost:8081
```

Or run via terminal:
```bash
npm run web
```

### 2. View on Mobile Phone (Expo Go)
1. Install **Expo Go** from Google Play Store or Apple App Store.
2. Run:
   ```bash
   npx expo start
   ```
3. Scan the QR code shown in the terminal with the Expo Go app (Android) or Camera app (iOS).

### 3. Quick Demo Login Credentials
- **Customer / Student**:
  - Email: `student@rvscas.ac.in`
  - Password: `student123`
  - *(Or tap the "Demo Customer / Student" quick button)*
- **Admin**:
  - Email: `admin@groceryshop.com`
  - Password: `admin123`
  - *(Or tap the "Demo Admin Portal" quick button)*
- **Coupon Codes to Test in Cart**:
  - `FRESH20` (20% off)
  - `SAVE10` (10% off)

