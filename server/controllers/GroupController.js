
const Group = require("../models/Group");

// שליפת כל הקבוצות של מרצה מסוים
const getGroupsByLecturer = async (req, res) => {
  try {
    const { lecturerId } = req.params;

    const groups = await Group.find({ lecturerId }).sort({
      name: 1,
    });

    return res.status(200).json(groups);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch groups",
    });
  }
};

// הוספת קבוצה חדשה
const createGroup = async (req, res) => {
  try {
    const { name, lecturerId } = req.body;

    if (!name || !lecturerId) {
      return res.status(400).json({
        message: "Name and lecturerId are required",
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
      message: "Failed to create group",
    });
  }
};

module.exports = {
  getGroupsByLecturer,
  createGroup,
};
