
const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const User = require("../models/User");

// הרשמת משתמשת חדשה
router.post("/register", async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                message: "יש למלא שם מלא, מייל וסיסמה"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "הסיסמה חייבת להכיל לפחות 8 תווים"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "כתובת המייל כבר רשומה במערכת"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            fullName: fullName.trim(),
            email: normalizedEmail,
            passwordHash,
            role: "facilitator",
            approvalStatus: "pending",
            isActive: true
        });

        res.status(201).json({
            message: "ההרשמה התקבלה וממתינה לאישור רכזת",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                approvalStatus: user.approvalStatus
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "כתובת המייל כבר רשומה במערכת"
            });
        }

        console.error("Registration error:", error.message);

        res.status(500).json({
            message: "אירעה שגיאה במהלך ההרשמה"
        });
    }
});

// קבלת רשימת המשתמשים הפעילים
router.get("/", async (req, res) => {
    try {
        const users = await User.find({ isActive: true })
            .select("-passwordHash");

        res.json(users);
    } catch (error) {
        res.status(500).json({
            message: "שגיאה בשליפת המשתמשים"
        });
    }
});

module.exports = router;
