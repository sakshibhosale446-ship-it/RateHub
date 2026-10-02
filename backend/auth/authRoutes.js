const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, address } = req.body;
        // Required fields
if (!name || !email || !password || !address) {
    return res.status(400).json({
        message: "Name, email, password and address are required"
    });
}

// Name validation: 20-60 characters
if (name.trim().length < 20 || name.trim().length > 60) {
    return res.status(400).json({
        message: "Name must be between 20 and 60 characters"
    });
}

// Address validation: maximum 400 characters
if (address.trim().length > 400) {
    return res.status(400).json({
        message: "Address must not exceed 400 characters"
    });
}

// Email validation
const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
    return res.status(400).json({
        message: "Please enter a valid email address"
    });
}

// Password validation:
// 8-16 characters
// At least one uppercase
// At least one special character
const passwordRegex =
    /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

if (!passwordRegex.test(password)) {
    return res.status(400).json({
        message:
            "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
    });
}
        // Basic validation
        if (!name || !email || !password || !address) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check whether email already exists
        const [existingUser] = await db.promise().query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create normal user
        const [result] = await db.promise().query(
            `INSERT INTO users (name, email, password, address, role)
             VALUES (?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, address, "USER"]
        );

        res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId
        });

    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user by email
        const [users] = await db.promise().query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // Compare entered password with hashed password
        const isPasswordValid = await bcrypt.compare(
    password,
    user.password
);

console.log("LOGIN DEBUG");
console.log("Email:", email);
console.log("User found:", user.email);
console.log("Role:", user.role);
console.log("Password valid:", isPasswordValid);

if (!isPasswordValid) {
    return res.status(401).json({
        message: "Invalid email or password"
    });
}

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;