const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/db");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// =====================================================
// ADMIN DASHBOARD
// =====================================================

router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware("ADMIN"),
    async (req, res) => {
        try {
            const [users] = await db.promise().query(
                "SELECT COUNT(*) AS totalUsers FROM users"
            );

            const [stores] = await db.promise().query(
                "SELECT COUNT(*) AS totalStores FROM stores"
            );

            const [ratings] = await db.promise().query(
                "SELECT COUNT(*) AS totalRatings FROM ratings"
            );

            res.status(200).json({
                totalUsers: users[0].totalUsers,
                totalStores: stores[0].totalStores,
                totalRatings: ratings[0].totalRatings
            });

        } catch (error) {
            console.error("Dashboard error:", error);

            res.status(500).json({
                message: "Failed to load dashboard"
            });
        }
    }
);


// =====================================================
// ADD USER
// =====================================================

router.post(
    "/users",
    authMiddleware,
    roleMiddleware("ADMIN"),
    async (req, res) => {
        try {
            const {
                name,
                email,
                password,
                address,
                role
            } = req.body;


            // Name validation
            if (!name || name.length < 20 || name.length > 60) {
                return res.status(400).json({
                    message: "Name must be between 20 and 60 characters"
                });
            }


            // Email validation
            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!email || !emailRegex.test(email)) {
                return res.status(400).json({
                    message: "Please enter a valid email"
                });
            }


            // Address validation
            if (!address || address.length > 400) {
                return res.status(400).json({
                    message: "Address must not exceed 400 characters"
                });
            }


            // Password validation
            const passwordRegex =
                /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

            if (!password || !passwordRegex.test(password)) {
                return res.status(400).json({
                    message:
                        "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
                });
            }


            // Role validation
            const allowedRoles = [
                "USER",
                "ADMIN",
                "STORE_OWNER"
            ];

            if (!allowedRoles.includes(role)) {
                return res.status(400).json({
                    message: "Invalid role"
                });
            }


            // Check duplicate email
            const [existingUser] = await db.promise().query(
                "SELECT id FROM users WHERE email = ?",
                [email]
            );

            if (existingUser.length > 0) {
                return res.status(409).json({
                    message: "Email already exists"
                });
            }


            // Hash password
            const hashedPassword =
                await bcrypt.hash(password, 10);


            // Insert user
            const [result] = await db.promise().query(
                `
                INSERT INTO users
                (name, email, password, address, role)
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    name,
                    email,
                    hashedPassword,
                    address,
                    role
                ]
            );


            res.status(201).json({
                message: "User created successfully",
                userId: result.insertId
            });

        } catch (error) {
            console.error("Add user error:", error);

            res.status(500).json({
                message: "Failed to create user"
            });
        }
    }
);


// =====================================================
// ADD STORE
// =====================================================

router.post(
    "/stores",
    authMiddleware,
    roleMiddleware("ADMIN"),
    async (req, res) => {
        try {
            const {
                name,
                email,
                address,
                owner_id
            } = req.body;


            // Store name validation
            if (!name || name.length < 20 || name.length > 60) {
                return res.status(400).json({
                    message:
                        "Store name must be between 20 and 60 characters"
                });
            }


            // Email validation
            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!email || !emailRegex.test(email)) {
                return res.status(400).json({
                    message: "Please enter a valid email"
                });
            }


            // Address validation
            if (!address || address.length > 400) {
                return res.status(400).json({
                    message:
                        "Address must not exceed 400 characters"
                });
            }


            // Check store email
            const [existingStore] = await db.promise().query(
                "SELECT id FROM stores WHERE email = ?",
                [email]
            );

            if (existingStore.length > 0) {
                return res.status(409).json({
                    message: "Store email already exists"
                });
            }


            // Check owner
            const [owners] = await db.promise().query(
                `
                SELECT id, role
                FROM users
                WHERE id = ?
                `,
                [owner_id]
            );


            if (owners.length === 0) {
                return res.status(404).json({
                    message: "Store owner not found"
                });
            }


            if (owners[0].role !== "STORE_OWNER") {
                return res.status(400).json({
                    message:
                        "Selected user is not a Store Owner"
                });
            }


            // Insert store
            const [result] = await db.promise().query(
                `
                INSERT INTO stores
                (name, email, address, owner_id)
                VALUES (?, ?, ?, ?)
                `,
                [
                    name,
                    email,
                    address,
                    owner_id
                ]
            );


            res.status(201).json({
                message: "Store created successfully",
                storeId: result.insertId
            });

        } catch (error) {
            console.error("Add store error:", error);

            res.status(500).json({
                message: "Failed to create store"
            });
        }
    }
);


// =====================================================
// ADMIN STORE LIST
// =====================================================

router.get(
    "/stores",
    authMiddleware,
    roleMiddleware("ADMIN"),
    async (req, res) => {
        try {
            const {
                name,
                email,
                address,
                sortBy = "name",
                order = "asc"
            } = req.query;


            // Allowed sorting columns
            const allowedSortColumns = {
                name: "s.name",
                email: "s.email",
                address: "s.address",
                rating: "average_rating"
            };


            const sortColumn =
                allowedSortColumns[sortBy] || "s.name";


            const sortOrder =
                order.toLowerCase() === "desc"
                    ? "DESC"
                    : "ASC";


            let query = `
                SELECT
                    s.id,
                    s.name,
                    s.email,
                    s.address,
                    COALESCE(
                        ROUND(AVG(r.rating), 2),
                        0
                    ) AS average_rating
                FROM stores s

                LEFT JOIN ratings r
                    ON s.id = r.store_id

                WHERE 1 = 1
            `;


            const params = [];


            // Search by name
            if (name) {
                query += " AND s.name LIKE ?";
                params.push(`%${name}%`);
            }


            // Search by email
            if (email) {
                query += " AND s.email LIKE ?";
                params.push(`%${email}%`);
            }


            // Search by address
            if (address) {
                query += " AND s.address LIKE ?";
                params.push(`%${address}%`);
            }


            query += `
                GROUP BY
                    s.id,
                    s.name,
                    s.email,
                    s.address

                ORDER BY
                    ${sortColumn}
                    ${sortOrder}
            `;


            const [stores] =
                await db.promise().query(
                    query,
                    params
                );


            res.status(200).json({
                stores
            });

        } catch (error) {
            console.error(
                "Store list error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to load stores"
            });
        }
    }
);


// =====================================================
// ADMIN USER LIST
// =====================================================

router.get(
    "/users",
    authMiddleware,
    roleMiddleware("ADMIN"),
    async (req, res) => {
        try {
            const {
                name,
                email,
                address,
                role,
                sortBy = "name",
                sortOrder = "asc"
            } = req.query;


            const allowedSortColumns = {
                name: "name",
                email: "email",
                address: "address",
                role: "role"
            };


            const sortColumn =
                allowedSortColumns[sortBy] || "name";


            const order =
                sortOrder.toLowerCase() === "desc"
                    ? "DESC"
                    : "ASC";


            let query = `
                SELECT
                    id,
                    name,
                    email,
                    address,
                    role
                FROM users
                WHERE 1 = 1
            `;


            const params = [];


            if (name) {
                query += " AND name LIKE ?";
                params.push(`%${name}%`);
            }


            if (email) {
                query += " AND email LIKE ?";
                params.push(`%${email}%`);
            }


            if (address) {
                query += " AND address LIKE ?";
                params.push(`%${address}%`);
            }


            if (role) {
                query += " AND role = ?";
                params.push(role);
            }


            query += `
                ORDER BY
                    ${sortColumn}
                    ${order}
            `;


            const [users] =
                await db.promise().query(
                    query,
                    params
                );


            res.status(200).json({
                users
            });

        } catch (error) {
            console.error(
                "User list error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to load users"
            });
        }
    }
);


// =====================================================
// VIEW USER DETAILS
// =====================================================

router.get(
    "/users/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    async (req, res) => {
        try {
            const userId = req.params.id;


            const [users] =
                await db.promise().query(
                    `
                    SELECT
                        id,
                        name,
                        email,
                        address,
                        role
                    FROM users
                    WHERE id = ?
                    `,
                    [userId]
                );


            if (users.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }


            const user = users[0];


            // If Store Owner,
            // also fetch their stores
            if (user.role === "STORE_OWNER") {

                const [stores] =
                    await db.promise().query(
                        `
                        SELECT
                            s.id,
                            s.name,
                            s.email,
                            s.address,
                            COALESCE(
                                ROUND(
                                    AVG(r.rating),
                                    2
                                ),
                                0
                            ) AS average_rating
                        FROM stores s

                        LEFT JOIN ratings r
                            ON s.id = r.store_id

                        WHERE s.owner_id = ?

                        GROUP BY
                            s.id,
                            s.name,
                            s.email,
                            s.address
                        `,
                        [userId]
                    );


                user.stores = stores;
            }


            res.status(200).json({
                user
            });

        } catch (error) {
            console.error(
                "User details error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to load user details"
            });
        }
    }
);


module.exports = router;