
const Group = require("../models/Group");
const User = require("../models/User");

// שליפת קבוצות לפי הרשאות המשתמשת המחוברת
const getGroupsByLecturer = async (req, res) => {
  try {
    const { lecturerId } = req.params;

    if (req.user.role === "facilitator") {
      if (lecturerId !== req.user.userId) {
        return res.status(403).json({
          message: "אין הרשאה לצפות בקבוצות של מנחה אחרת",
        });
      }
    } else if (req.user.role === "coordinator") {
      const lecturer = await User.findOne({
        _id: lecturerId,
        role: "facilitator",
        coordinatorId: req.user.userId,
      });

      if (!lecturer) {
        return res.status(403).json({
          message: "המנחה אינה משויכת לרכזת זו",
        });
      }
    } else {
      return res.status(403).json({
        message: "אין הרשאה לבצע פעולה זו",
      });
    }

    const groups = await Group.find({ lecturerId }).sort({
      name: 1,
    });

    return res.status(200).json(groups);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "שגיאה בשליפת הקבוצות",
    });
  }
};

// הוספת קבוצה חדשה – רכזת בלבד
const createGroup = async (req, res) => {
  try {
    if (req.user.role !== "coordinator") {
      return res.status(403).json({
        message: "רק רכזת יכולה ליצור קבוצה",
      });
    }

    const { name, lecturerId } = req.body;

    if (!name || !lecturerId) {
      return res.status(400).json({
        message: "Name and lecturerId are required",
      });
    }

    const lecturer = await User.findOne({
      _id: lecturerId,
      role: "facilitator",
      coordinatorId: req.user.userId,
    });

    if (!lecturer) {
      return res.status(403).json({
        message: "לא ניתן ליצור קבוצה עבור מנחה שאינה משויכת לרכזת זו",
      });
    }

    const group = await Group.create({
      name,
      lecturerId,
    });

    return res.status(201).json(group);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "שגיאה ביצירת הקבוצה",
    });
  }
};

module.exports = {
  getGroupsByLecturer,
  createGroup,
};
