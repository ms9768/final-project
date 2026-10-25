
const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        track: {
            type: String,
            required: true,
            trim: true
        },

        // תוכן השיעור בטקסט, אם נבחרה כתיבה ישירה
        content: {
            type: String,
            default: ""
        },

        // מסמך המשמש כתוכן השיעור, אם הועלה קובץ
        contentFile: {
            name: {
                type: String,
                default: ""
            },
            url: {
                type: String,
                default: ""
            }
        },

        // קבצים נוספים המצורפים למערך
        files: [
            {
                name: String,
                url: String
            }
        ],

        notes: {
            type: String,
            default: ""
        },

        isVisible: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Lesson", lessonSchema);
