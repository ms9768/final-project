
const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        contactType: {
            type: String,
            enum: ["municipality", "private"],
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        phone: {
            type: String,
            trim: true,
            default: ""
        },

        municipalityName: {
            type: String,
            trim: true,
            default: ""
        },

        city: {
            type: String,
            trim: true,
            default: ""
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["new", "read", "handled"],
            default: "new"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
