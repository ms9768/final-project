
const express = require("express");
const router = express.Router();
const Lesson = require("../models/Lesson");
const User = require("../models/User");
const { authenticateToken, requireCoordinator } = require("./userRoutes");
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
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ message: "המערך לא נמצא" });
        }

        // לרכזת יש גישה לכל המערכים
        if (req.user.role === "coordinator") {
            return res.json(lesson);
        }

        // מנחה יכולה לפתוח רק מערך שפתוח עבורה
        const hasAccess =
            lesson.isVisible &&
            lesson.allowedUsers.some(
                id => id.toString() === req.user.userId
            );

        if (!hasAccess) {
            return res.status(403).json({
                message: "אין לך הרשאה לצפות במערך זה"
            });
        }

        res.json(lesson);
    } catch (error) {
        res.status(500).json({
            message: "שגיאה בטעינת המערך",
            error: error.message
        });
    }
});



// מסנן חיפוש ומסלול - משותף למסך הניהול ולמסך המנחה
function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildLessonFilter(query) {
    const filter = {};
    const search = query.search?.trim();
    const track = query.track?.trim();

    if (search) {
        const searchRegex = new RegExp(escapeRegex(search), "i");
        filter.$or = [
            { title: searchRegex },
            { description: searchRegex }
        ];
    }

    // התאמה לפי מילת המסלול, כך ש"ארוך" ימצא גם "ארוך" וגם "מסלול ארוך"
    if (track) {
        filter.track = new RegExp(escapeRegex(track), "i");
    }

    return filter;
}

// קבלת כל מערכי השיעור למסך הניהול (רכזת בלבד), כולל חיפוש וסינון
router.get("/admin/all", authenticateToken, requireCoordinator, async (req, res) => {
    try {
        const lessons = await Lesson.find(buildLessonFilter(req.query))
            .sort({ createdAt: -1 });

        res.status(200).json(lessons);
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve all lessons",
            error: error.message
        });
    }
});


// קבלת מערכי השיעור הפתוחים למשתמש המחובר
router.get("/", authenticateToken, async (req, res) => {
    try {
        const filter = buildLessonFilter(req.query);

        // מנחה רואה רק מערכים גלויים שפתוחים עבורה
        if (req.user.role === "facilitator") {
            filter.isVisible = true;
            filter.allowedUsers = req.user.userId;
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



// החזרת מערך שיעור למצב גלוי
router.patch("/:id/show", async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndUpdate(
            req.params.id,
            { isVisible: true },
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

        res.status(200).json({
            message: "Lesson is visible again",
            lesson
        });
    } catch (error) {
        res.status(400).json({
            message: "Failed to show lesson",
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

// פתיחת גישה למערך עבור מנחה
router.patch(
    "/:id/access/:userId",
    authenticateToken,
    requireCoordinator,
    async (req, res) => {
        try {
            const lesson = await Lesson.findById(req.params.id);

            if (!lesson) {
                return res.status(404).json({
                    message: "המערך לא נמצא"
                });
            }

            const facilitator = await User.findOne({
                _id: req.params.userId,
                coordinatorId: req.user.userId,
                role: "facilitator",
                approvalStatus: "approved",
                isActive: true
            });

            if (!facilitator) {
                return res.status(404).json({
                    message: "המנחה לא נמצאה או אינה משויכת לרכזת זו"
                });
            }

            if (!lesson.allowedUsers.some(
                id => id.toString() === facilitator._id.toString()
            )) {
                lesson.allowedUsers.push(facilitator._id);
                await lesson.save();
            }

            res.json({
                message: "הגישה למערך נפתחה בהצלחה"
            });
        } catch (error) {
            res.status(500).json({
                message: "שגיאה בפתיחת הגישה",
                error: error.message
            });
        }
    }
);

// סגירת גישה למערך עבור מנחה
router.patch(
    "/:id/access/:userId/close",
    authenticateToken,
    requireCoordinator,
    async (req, res) => {
        try {
            const lesson = await Lesson.findById(req.params.id);

            if (!lesson) {
                return res.status(404).json({
                    message: "המערך לא נמצא"
                });
            }

            const facilitator = await User.findOne({
                _id: req.params.userId,
                coordinatorId: req.user.userId,
                role: "facilitator"
            });

            if (!facilitator) {
                return res.status(404).json({
                    message: "המנחה לא נמצאה או אינה משויכת לרכזת זו"
                });
            }

            lesson.allowedUsers = lesson.allowedUsers.filter(
                id => id.toString() !== facilitator._id.toString()
            );

            await lesson.save();

            res.json({
                message: "הגישה למערך נסגרה בהצלחה"
            });
        } catch (error) {
            res.status(500).json({
                message: "שגיאה בסגירת הגישה",
                error: error.message
            });
        }
    }
);
module.exports = router;
