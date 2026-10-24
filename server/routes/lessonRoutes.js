const express = require("express");
const router = express.Router();
const Lesson = require("../models/Lesson");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


//הגדרות העלאת קבצים
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        cb(null, uniqueName + path.extname(file.originalname).toLowerCase());
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = [".pdf", ".doc", ".docx"];

        const extension = path.extname(file.originalname).toLowerCase();

        if (allowedExtensions.includes(extension)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
        }
    }
});



router.get("/:id", async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({
                message: "Lesson not found"
            });
        }

        res.status(200).json(lesson);
    } catch (error) {
        res.status(400).json({
            message: "Failed to retrieve lesson",
            error: error.message
        });
    }
});



// קבלת מערכי השיעור המוצגים באתר
router.get("/", async (req, res) => {
    try {

        const search = req.query.search?.trim();
        const track = req.query.track?.trim();

        const filter = {
            isVisible: true
        };

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        if (track) {
            filter.track = track;
        }

        const lessons = await Lesson.find(filter)
            .sort({ createdAt: -1 });


        res.status(200).json(lessons);
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve lessons",
            error: error.message
        });
    }
});

// הוספת מערך שיעור חדש
router.post("/", async (req, res) => {
    try {
        const lesson = await Lesson.create(req.body);

        res.status(201).json(lesson);
    } catch (error) {
        res.status(400).json({
            message: "Failed to create lesson",
            error: error.message
        });
    }
});




/* עדכון מערך שיעור קיים */
router.put("/:id", async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!lesson) {
            return res.status(404).json({
                message: "Lesson not found"
            });
        }

        res.status(200).json(lesson);
    } catch (error) {
        res.status(400).json({
            message: "Failed to update lesson",
            error: error.message
        });
    }
});



/* הסתרת מערך שיעור */
router.patch("/:id/hide", async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndUpdate(
            req.params.id,
            { isVisible: false },
            { new: true }
        );

        if (!lesson) {
            return res.status(404).json({
                message: "Lesson not found"
            });
        }

        res.status(200).json({
            message: "Lesson hidden successfully",
            lesson
        });
    } catch (error) {
        res.status(400).json({
            message: "Failed to hide lesson",
            error: error.message
        });
    }
});




/* מחיקת מערך שיעור */
router.delete("/:id", async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndDelete(req.params.id);

        if (!lesson) {
            return res.status(404).json({
                message: "Lesson not found"
            });
        }

        res.status(200).json({
            message: "Lesson deleted successfully",
            lesson
        });
    } catch (error) {
        res.status(400).json({
            message: "Failed to delete lesson",
            error: error.message
        });
    }
});




/* העלאת קובץ למערכת */
router.post("/upload", (req, res) => {
    upload.single("file")(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                message: "File upload failed",
                error: error.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "No file was uploaded"
            });
        }

        res.status(201).json({
            message: "File uploaded successfully",
            file: {
                name: req.file.originalname,
                url: `/uploads/${req.file.filename}`
            }
        });
    });
});





module.exports = router;
