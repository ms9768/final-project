
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        lesson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lesson",
            required: true
        },

        author: {
            type: String,
            required: true,
            trim: true
        },

        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },

        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null
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

module.exports = mongoose.model("Comment", commentSchema);
