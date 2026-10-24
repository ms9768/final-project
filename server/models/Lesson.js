
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

        content: {
            type: String,
            required: true
        },

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
