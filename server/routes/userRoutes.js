
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const User = require("../models/User");
// בדיקת אסימון התחברות
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "נדרשת התחברות למערכת"
        });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(403).json({
            message: "אסימון התחברות לא תקין"
        });
    }
};

// בדיקה שהמשתמשת היא רכזת
const requireCoordinator = (req, res, next) => {
    if (req.user.role !== "coordinator") {
        return res.status(403).json({
            message: "אין הרשאה לבצע פעולה זו"
        });
    }

    next();
};
// הרשמת משתמשת חדשה
router.post("/register", async (req, res) => {
    try {
         const { fullName, email, password, coordinatorCode } = req.body;  
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

        
        if (!coordinatorCode || !coordinatorCode.trim()) {
    return res.status(400).json({
        message: "יש להזין קוד רכזת"
    });
}
        
        
        const coordinator = await User.findOne({
    coordinatorCode: coordinatorCode.trim().toUpperCase(),
    role: "coordinator",
    isActive: true
});

if (!coordinator) {
    return res.status(400).json({
        message: "קוד רכזת לא תקין"
    });
}

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
    coordinatorId: coordinator._id,
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

// התחברות משתמשת
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "יש למלא מייל וסיסמה"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                message: "מייל או סיסמה שגויים"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "מייל או סיסמה שגויים"
            });
        }

        if (user.approvalStatus !== "approved") {
            return res.status(403).json({
                message: "החשבון עדיין ממתין לאישור רכזת"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: "החשבון אינו פעיל"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "ההתחברות הצליחה",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            message: "אירעה שגיאה במהלך ההתחברות"
        });
    }
});

// קבלת משתמשות שממתינות לאישור - לרכזת בלבד
router.get("/pending", authenticateToken, requireCoordinator, async (req, res) => {
   
   
    try {
        const users = await User.find({
    approvalStatus: "pending",
    coordinatorId: req.user.userId
}).select("-passwordHash");

        res.json(users);
    } catch (error) {
        console.error("Pending users error:", error.message);

        res.status(500).json({
            message: "שגיאה בשליפת המשתמשות הממתינות לאישור"
        });
    }
});


// אישור משתמשת - לרכזת בלבד
router.patch("/:id/approve", authenticateToken, requireCoordinator, async (req, res) => {
    try {
const user = await User.findOne({
    _id: req.params.id,
    coordinatorId: req.user.userId
});
        if (!user) {
            return res.status(404).json({
                message: "המשתמשת לא נמצאה או אינה משויכת לרכזת זו"            });
        }

        if (user.approvalStatus !== "pending") {
            return res.status(400).json({
                message: "המשתמשת אינה ממתינה לאישור"
            });
        }

        user.approvalStatus = "approved";

        await user.save();

        res.json({
            message: "המשתמשת אושרה בהצלחה",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                approvalStatus: user.approvalStatus
            }
        });

    } catch (error) {
        console.error("Approve user error:", error.message);

        res.status(500).json({
            message: "שגיאה באישור המשתמשת"
        });
    }
});

// קבלת רשימת המשתמשים הפעילים
router.get("/", authenticateToken, requireCoordinator, async (req, res) => {
    try {
        const users = await User.find({
            isActive: true,
            role: "facilitator",
            coordinatorId: req.user.userId
        }).select("-passwordHash -coordinatorCode");

        res.json(users);
    } catch (error) {
        res.status(500).json({
            message: "שגיאה בשליפת המשתמשות"
        });
    }
});
module.exports = router;
