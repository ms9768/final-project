
const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

// שמירת פנייה חדשה
router.post("/", async (req, res) => {
    try {
        const {
            contactType,
            name,
            email,
            phone,
            municipalityName,
            city,
            message
        } = req.body;

        if (
            !["municipality", "private"].includes(contactType) ||
            typeof name !== "string" ||
            !name.trim() ||
            typeof email !== "string" ||
            !email.trim() ||
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                message: "יש למלא את כל שדות החובה"
            });
        }

        const newContact = await Contact.create({
            contactType,
            name: name.trim(),
            email: email.trim(),
            phone: typeof phone === "string" ? phone.trim() : "",
            municipalityName:
                typeof municipalityName === "string"
                    ? municipalityName.trim()
                    : "",
            city: typeof city === "string" ? city.trim() : "",
            message: message.trim()
        });

        return res.status(201).json({
            message: "הפנייה נשמרה בהצלחה",
            contact: {
                id: newContact._id,
                createdAt: newContact.createdAt
            }
        });
    } catch (error) {
        console.error("Save contact error:", error.message);

        return res.status(500).json({
            message: "אירעה שגיאה בשמירת הפנייה"
        });
    }
});

// הצגת הפניות — זמני לפיתוח מקומי בלבד
router.get("/", async (req, res) => {
    try {
        const contacts = await Contact.find()
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json(contacts);
    } catch (error) {
        console.error("Get contacts error:", error.message);

        return res.status(500).json({
            message: "אירעה שגיאה בטעינת הפניות"
        });
    }
});

module.exports = router;
