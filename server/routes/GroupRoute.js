
const express = require("express");

const {
  getGroupsByLecturer,
  createGroup,
} = require("../controllers/GroupController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

// כל הנתיבים מחייבים משתמשת מחוברת
router.use(authenticateToken);

router.get("/lecturer/:lecturerId", getGroupsByLecturer);
router.post("/", createGroup);

module.exports = router;
