
const express = require("express");
const router = express.Router();
const Lesson = require("../models/Lesson");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mammoth = require("mammoth");
const sanitizeHtml = require("sanitize-html");
const { execFile } = require("child_process");
const { promisify } = require("util");
const os = require("os");

const runCommand = promisify(execFile);

// הגדרות העלאת קבצים
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

        cb(
            null,
            uniqueName + path.extname(file.originalname).toLowerCase()
        );
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

// תצוגה מקדימה של PDF, DOCX ו-DOC
router.get("/preview/:filename", async (req, res) => {
    let tempDir;

    try {
        const filename = req.params.filename;

        // בדיקה שהשם מתאים לקובץ שנוצר בהעלאה
        if (!/^\d+-\d+\.(pdf|doc|docx)$/i.test(filename)) {
            return res.status(400).json({
                message: "Invalid file name"
            });
        }

        const filePath = path.join(uploadDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        const extension = path.extname(filename).toLowerCase();

        // PDF: שליחת הקובץ המקורי לדפדפן
        if (extension === ".pdf") {
            return res.type("application/pdf").sendFile(filePath);
        }

        // DOCX: המרה ל-HTML
        if (extension === ".docx") {
            const result = await mammoth.convertToHtml({
                path: filePath
            });

            const safeHtml = sanitizeHtml(result.value, {
                allowedTags: [
                    "p", "br", "strong", "em", "u",
                    "h1", "h2", "h3", "ul", "ol", "li",
                    "table", "thead", "tbody", "tr", "th", "td"
                ],
                allowedAttributes: {}
            });

            return res.status(200).json({
                filename,
                type: "html",
                html: safeHtml
            });
        }

        // DOC: המרה ל-PDF באמצעות LibreOffice
        tempDir = fs.mkdtempSync(
            path.join(os.tmpdir(), "lesson-preview-")
        );

        const sofficePath =
            "C:\\Program Files\\LibreOffice\\program\\soffice.com";

        await runCommand(sofficePath, [
            "--headless",
            "--convert-to",
            "pdf",
            "--outdir",
            tempDir,
            filePath
        ]);

        const pdfPath = path.join(
            tempDir,
            path.parse(filename).name + ".pdf"
        );

        if (!fs.existsSync(pdfPath)) {
            throw new Error("PDF conversion failed");
        }

        // שליחת ה-PDF לדפדפן ולאחר מכן ניקוי התיקייה הזמנית
        res.type("application/pdf");

        res.sendFile(pdfPath, (error) => {
            if (tempDir && fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, {
                    recursive: true,
                    force: true
                });
            }

            if (error && !res.headersSent) {
                res.status(500).json({
                    message: "Failed to send preview"
                });
            }
        });
    } catch (error) {
        if (tempDir && fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, {
                recursive: true,
                force: true
            });
        }

        console.error("Preview failed:", error.message);

        if (!res.headersSent) {
            res.status(500).json({
                message: "Failed to preview document",
                error: error.message
            });
        }
    }
});

// קבלת מערך שיעור לפי מזהה
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

// עדכון מערך שיעור קיים
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

// הסתרת מערך שיעור
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

// מחיקת מערך שיעור
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

// העלאת קובץ למערכת
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
