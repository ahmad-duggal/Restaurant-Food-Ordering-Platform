# Restaurant-Food-Ordering-Platform

Developed a full-stack food delivery application using React.js and Node.js/Express. The platform features a responsive design with three distinct, secure dashboards tailored for Customers, Restaurants, and Admins.
Food CRUD Summary
step Method Route Access Status
Add Food POST /api/v1/food Admin ✅ Done
Get All Food GET /api/v1/food Public ✅ Done
Get Single Food GET /api/v1/food/:id Public ✅ Done
Update Food PUT /api/v1/food/:id Admin ✅ Done
Delete Food DELETE /api/v1/food/:id Admin ✅ Done

STEP 4 — Order Schema & Model
src/models/order.js

1. 📦 Model Design Decisions
   The Order schema has two layers:

Layer Purpose
orderItemSchema Sub-document (embedded) — stores each food item, its quantity, and its price at time of order
orderSchema Main document — stores who ordered, what they ordered, total cost, status, and delivery info

4. 🗺️ Schema Relationships Diagram
   User ──────────────────────────────┐
   ▼
   Order Document
   ┌──────────────────────┐
   │ user → User.\_id │
   │ items[] │
   │ food → Food.\_id │
   │ quantity │
   │ price (snapshot) │
   │ totalPrice │
   │ status (pending→...) │
   │ deliveryAddress │
   │ paymentMethod │
   │ isPaid │
   └──────────────────────┘
   Why Store price Inside Each Item?
   If a food item's price changes later in the DB, the original order price stays accurate. This is standard e-commerce practice — always snapshot the price at time of order.

STEP 5 — Place Order API
POST /api/v1/orders — Any Logged-in user
Key logic flow:
Request comes in
↓
Validate: items array exists + not empty
↓
Validate: deliveryAddress exists
↓
Loop through each item:
→ Validate food ObjectId format
→ Validate quantity >= 1
→ Find food in DB → 404 if not found
→ Check food.isavailable → 400 if unavailable
→ Snapshot price from DB (ignore client price)
→ Add to resolvedItems, add to totalPrice
↓
Create Order (user from req.user, set by protect middleware)
↓
Populate food name/price/category in response
↓
Return 201 with full order
Security: Price is always taken from the DB, never from the client. A user cannot manipulate the price by sending a fake value in the request body.

STEP 6 — Get Orders API
GET /api/v1/orders — Customer (own) | Admin (all)

Role-based logic: One route, one controller — the query automatically changes based on req.user.role set by the protect middleware. No extra middleware needed.

STEP 7 — Update Order Status API
PUT /api/v1/orders/:id — Admin Only

Key logic flow:

Validate ObjectId format
↓
Validate status is sent + is one of allowed values
↓
Find order by ID → 404 if not found
↓
Block update if order is already "cancelled"
↓
Set new status
↓
If status = "delivered" → auto-set isPaid=true, paidAt=now
↓
Save + Populate → return 200

Cancelled orders are locked — can't be accidentally moved back to "pending"
Auto-payment on delivery — when admin marks delivered, isPaid flips to true and paidAt is timestamped automatically (ready for Stripe in Phase 4)
Valid status values:

pending → confirmed → preparing → delivered → (auto: isPaid=true)
↘
cancelled

                STEP 8 — Vite + Axios + JWT + AuthContext + Services
                rontend Scaffolded

frontend/ ← Vite + React (165 packages, 0 vulnerabilities)
├── .env ← VITE_API_URL=http://localhost:5000/api/v1
└── src/
├── api/
│ └── axios.js ✅ NEW
├── services/
│ ├── authService.js ✅ NEW
│ ├── foodService.js ✅ NEW
│ └── orderService.js ✅ NEW
├── context/
│ └── AuthContext.jsx ✅ NEW
└── utils/
├── tokenUtils.js ✅ NEW
└── formatters.js ✅ NEW
🔧 Backend Utils Added

src/utils/
├── generateToken.js ✅ NEW — JWT generation helper
└── errorResponse.js ✅ NEW — standardized success/error response
🧠 Architecture Flow

Page Component
↓ calls
Service (authService / foodService / orderService)
↓ calls
api/axios.js ←── auto-attaches JWT from tokenUtils
↓
Backend API
↑
Response interceptor handles 401 → auto-logout

STEP 9 — Complete Summary
What Was Built


frontend/src/
├── components/
│   ├── ProtectedRoute.jsx   ✅ Auth guard (loading, auth check, admin-only)
│   └── Navbar.jsx           ✅ Context-aware nav (role-based links)
├── pages/
│   ├── Login.jsx            ✅ JWT login → AuthContext → redirect
│   ├── Register.jsx         ✅ Register → auto-login → redirect
│   ├── Menu.jsx             ✅ Food grid + category filter (public)
│   ├── PlaceOrder.jsx       ✅ Cart + qty controls + order submit
│   └── MyOrders.jsx         ✅ Order list + admin inline status updater
├── App.jsx                  ✅ Full routing (public/guest/protected)
└── main.jsx                 ✅ BrowserRouter + AuthProvider wrapping