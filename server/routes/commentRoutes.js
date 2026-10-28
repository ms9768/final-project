
const express = require("express");
const router = express.Router();

const Comment = require("../models/Comment");
const Lesson = require("../models/Lesson");

// הצגת התגובות הגלויות של שיעור מסוים

router.get("/lesson/:lessonId", async (req, res) => {
    try {
        const filter = {
            lesson: req.params.lessonId
        };

        // במצב ניהול אפשר לבקש גם תגובות מוסתרות
        if (req.query.includeHidden !== "true") {
            filter.isVisible = true;
        }

        const comments = await Comment.find(filter)
            .sort({ createdAt: 1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({
            message: "שגיאה בטעינת התגובות",
            error: error.message
        });
    }
});


// הוספת תגובה או תשובה לתגובה קיימת
router.post("/", async (req, res) => {
    try {
        const { lessonId, author, text, parentComment } = req.body;

        if (!lessonId || !author?.trim() || !text?.trim()) {
            return res.status(400).json({
                message: "יש למלא שיעור, שם כותב ותוכן תגובה"
            });
        }

        const lesson = await Lesson.findById(lessonId);

        if (!lesson) {
            return res.status(404).json({
                message: "השיעור לא נמצא"
            });
        }

        if (parentComment) {
            const parent = await Comment.findOne({
                _id: parentComment,
                lesson: lessonId,
                isVisible: true
            });

            if (!parent) {
                return res.status(404).json({
                    message: "התגובה שאליה מנסים להשיב לא נמצאה"
                });
            }
        }

        const comment = await Comment.create({
            lesson: lessonId,
            author: author.trim(),
            text: text.trim(),
            parentComment: parentComment || null
        });

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({
            message: "שגיאה בשמירת התגובה",
            error: error.message
        });
    }
});

// הסתרת תגובה
router.patch("/:id/hide", async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { isVisible: false },
            { new: true, runValidators: true }
        );

        if (!comment) {
            return res.status(404).json({
                message: "התגובה לא נמצאה"
            });
        }

        res.json(comment);
    } catch (error) {
        res.status(500).json({
            message: "שגיאה בהסתרת התגובה",
            error: error.message
        });
    }
});

// הצגת תגובה שהוסתרה
router.patch("/:id/show", async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { isVisible: true },
            { new: true, runValidators: true }
        );

        if (!comment) {
            return res.status(404).json({
                message: "התגובה לא נמצאה"
            });
        }

        res.json(comment);
    } catch (error) {
        res.status(500).json({
            message: "שגיאה בהצגת התגובה",
            error: error.message
        });
    }
});

module.exports = router;
