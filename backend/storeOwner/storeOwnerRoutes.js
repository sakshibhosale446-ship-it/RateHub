const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const bcrypt = require("bcrypt");
const router = express.Router();
router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware("STORE_OWNER"),
    async (req, res) => {
        try {
            const ownerId = req.user.id;

            // Get stores owned by the logged-in Store Owner
            const [stores] = await db.promise().query(
                `SELECT
                    s.id,
                    s.name,
                    s.address,
                    COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating
                 FROM stores s
                 LEFT JOIN ratings r
                    ON s.id = r.store_id
                 WHERE s.owner_id = ?
                 GROUP BY s.id, s.name, s.address`,
                [ownerId]
            );

            if (stores.length === 0) {
                return res.status(404).json({
                    message: "No store found for this Store Owner"
                });
            }

            // Get users who rated the owner's stores
            const [ratings] = await db.promise().query(
                `SELECT
                    r.id AS rating_id,
                    s.id AS store_id,
                    s.name AS store_name,
                    u.id AS user_id,
                    u.name AS user_name,
                    u.email AS user_email,
                    r.rating,
                    r.created_at
                 FROM ratings r
                 INNER JOIN stores s
                    ON r.store_id = s.id
                 INNER JOIN users u
                    ON r.user_id = u.id
                 WHERE s.owner_id = ?
                 ORDER BY r.created_at DESC`,
                [ownerId]
            );

            res.status(200).json({
                stores,
                ratings
            });

        } catch (error) {
            console.error("Store owner dashboard error:", error);

            res.status(500).json({
                message: "Failed to load dashboard"
            });
        }
    }
);
router.put(
    "/change-password",
    authMiddleware,
    roleMiddleware("STORE_OWNER"),
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

            const ownerId = req.user.id;

            const [users] = await db.promise().query(
                "SELECT password FROM users WHERE id = ?",
                [ownerId]
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
                [hashedPassword, ownerId]
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