
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// בדיקת אסימון התחברות
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "נדרשת התחברות למערכת",
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(403).json({
      message: "אסימון התחברות לא תקין",
    });
  }
};

// בדיקה שהמשתמשת היא רכזת
const requireCoordinator = (req, res, next) => {
  if (req.user.role !== "coordinator") {
    return res.status(403).json({
      message: "אין הרשאה לבצע פעולה זו",
    });
  }

  next();
};

// בדיקה שהמשתמשת היא מנחה
const requireFacilitator = (req, res, next) => {
  if (req.user.role !== "facilitator") {
    return res.status(403).json({
      message: "אין הרשאה לבצע פעולה זו",
    });
  }

  next();
};

const requirePaymentManager = async (req, res, next) => {
  if (
    req.user.role !== "payment_manager" ||
    !req.user.userId
  ) {
    return res.status(403).json({
      message: "אין הרשאה לבצע פעולה זו",
    });
  }

  try {
    const user = await User.findOne({
      _id: req.user.userId,
      role: "payment_manager",
      approvalStatus: "approved",
      isActive: true,
    }).select("_id");

    if (!user) {
      return res.status(403).json({
        message: "אין הרשאה לבצע פעולה זו",
      });
    }

    return next();
  } catch {
    return res.status(500).json({
      message: "לא ניתן לאמת את ההרשאות כעת",
    });
  }
};

module.exports = {
  authenticateToken,
  requireCoordinator,
  requireFacilitator,
  requirePaymentManager,
};
