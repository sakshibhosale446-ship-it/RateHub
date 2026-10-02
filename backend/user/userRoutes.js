const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const bcrypt = require("bcrypt");
const router = express.Router();
router.get(
    "/stores",
    authMiddleware,
    roleMiddleware("USER"),
    async (req, res) => {
        try {
            const {
                search,
                sortBy = "name",
                order = "asc"
            } = req.query;

            const userId = req.user.id;

            const allowedSortColumns = {
                name: "s.name",
                address: "s.address",
                rating: "average_rating",
                myRating: "my_rating"
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
                    s.address,

                    COALESCE(
                        ROUND(AVG(all_ratings.rating), 2),
                        0
                    ) AS average_rating,

                    my_rating.rating AS my_rating

                FROM stores s

                LEFT JOIN ratings all_ratings
                    ON s.id = all_ratings.store_id

                LEFT JOIN ratings my_rating
                    ON s.id = my_rating.store_id
                    AND my_rating.user_id = ?

                WHERE 1 = 1
            `;

            const params = [userId];

            // Search by store name OR address
            if (search && search.trim() !== "") {
                query += `
                    AND (
                        s.name LIKE ?
                        OR s.address LIKE ?
                    )
                `;

                const searchValue = `%${search.trim()}%`;

                params.push(searchValue);
                params.push(searchValue);
            }

            query += `
                GROUP BY
                    s.id,
                    s.name,
                    s.address,
                    my_rating.rating

                ORDER BY
                    ${sortColumn}
                    ${sortOrder}
            `;

            const [stores] = await db.promise().query(
                query,
                params
            );

            res.status(200).json({
                stores
            });

        } catch (error) {
            console.error(
                "User store list error:",
                error
            );

            res.status(500).json({
                message: "Failed to load stores"
            });
        }
    }
);
router.post(
    "/ratings",
    authMiddleware,
    roleMiddleware("USER"),
    async (req, res) => {
        try {
            const { store_id, rating } = req.body;
            const userId = req.user.id;

            // Check required fields
            if (!store_id || rating === undefined) {
                return res.status(400).json({
                    message: "Store ID and rating are required"
                });
            }

            // Validate rating
            if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
                return res.status(400).json({
                    message: "Rating must be an integer between 1 and 5"
                });
            }

            // Check if store exists
            const [stores] = await db.promise().query(
                "SELECT id FROM stores WHERE id = ?",
                [store_id]
            );

            if (stores.length === 0) {
                return res.status(404).json({
                    message: "Store not found"
                });
            }

            // Check if user has already rated this store
            const [existingRating] = await db.promise().query(
                `SELECT id
                 FROM ratings
                 WHERE user_id = ? AND store_id = ?`,
                [userId, store_id]
            );

            if (existingRating.length > 0) {
                return res.status(409).json({
                    message: "You have already rated this store"
                });
            }

            // Insert rating
            const [result] = await db.promise().query(
                `INSERT INTO ratings
                (user_id, store_id, rating)
                VALUES (?, ?, ?)`,
                [userId, store_id, rating]
            );

            res.status(201).json({
                message: "Rating submitted successfully",
                ratingId: result.insertId
            });

        } catch (error) {
            console.error("Submit rating error:", error);

            res.status(500).json({
                message: "Failed to submit rating"
            });
        }
    }
);
router.put(
    "/ratings/:store_id",
    authMiddleware,
    roleMiddleware("USER"),
    async (req, res) => {
        try {
            const storeId = req.params.store_id;
            const { rating } = req.body;
            const userId = req.user.id;

            // Validate rating
            if (rating === undefined) {
                return res.status(400).json({
                    message: "Rating is required"
                });
            }

            if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
                return res.status(400).json({
                    message: "Rating must be an integer between 1 and 5"
                });
            }

            // Check whether the user has already rated this store
            const [existingRating] = await db.promise().query(
                `SELECT id
                 FROM ratings
                 WHERE user_id = ? AND store_id = ?`,
                [userId, storeId]
            );

            if (existingRating.length === 0) {
                return res.status(404).json({
                    message: "You have not rated this store yet"
                });
            }

            // Update rating
            await db.promise().query(
                `UPDATE ratings
                 SET rating = ?
                 WHERE user_id = ? AND store_id = ?`,
                [rating, userId, storeId]
            );

            res.status(200).json({
                message: "Rating updated successfully"
            });

        } catch (error) {
            console.error("Update rating error:", error);

            res.status(500).json({
                message: "Failed to update rating"
            });
        }
    }
);
router.put(
    "/change-password",
    authMiddleware,
    roleMiddleware("USER"),
    async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    message: "Current password and new password are required"
                });
            }

            const passwordRegex =
                /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

            if (!passwordRegex.test(newPassword)) {
                return res.status(400).json({
                    message:
                        "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
                });
            }

            const userId = req.user.id;

            const [users] = await db.promise().query(
                "SELECT password FROM users WHERE id = ?",
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const isCurrentPasswordValid = await bcrypt.compare(
                currentPassword,
                users[0].password
            );

            if (!isCurrentPasswordValid) {
                return res.status(401).json({
                    message: "Current password is incorrect"
                });
            }

            const hashedPassword = await bcrypt.hash(
                newPassword,
                10
            );

            await db.promise().query(
                "UPDATE users SET password = ? WHERE id = ?",
                [hashedPassword, userId]
            );

            res.status(200).json({
                message: "Password changed successfully"
            });

        } catch (error) {
            console.error("Change password error:", error);

            res.status(500).json({
                message: "Failed to change password"
            });
        }
    }
);
module.exports = router;