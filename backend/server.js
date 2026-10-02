const userRoutes = require("./user/userRoutes");
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const storeOwnerRoutes = require("./storeOwner/storeOwnerRoutes");
const authRoutes = require("./auth/authRoutes");
const adminRoutes = require("./admin/adminRoutes");

const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");

const app = express();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/store-owner", storeOwnerRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("RateHub Backend is running!");
});

// Protected test route
app.get(
    "/api/protected",
    authMiddleware,
    (req, res) => {
        res.status(200).json({
            message: "You have accessed a protected route!",
            user: req.user
        });
    }
);

// Admin-only test route
app.get(
    "/api/admin-test",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => {
        res.status(200).json({
            message: "Welcome Admin! You have access to this route."
        });
    }
);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});