const express = require("express");

const {
  getGroupsByLecturer,
  createGroup,
} = require("../controllers/GroupController");

const router = express.Router();

router.get("/lecturer/:lecturerId", getGroupsByLecturer);
router.post("/", createGroup);

module.exports = router;