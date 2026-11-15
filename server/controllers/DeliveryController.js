
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const Delivery = require("../models/Delivery");
const SystemSettings = require("../models/SystemSettings");
const { sendBrevoEmail } = require("../services/brevoEmail");

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        cb(null, uniqueName + path.extname(file.originalname).toLowerCase());
    },
});

const uploadPhoto = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
            return cb(new Error("יש להעלות תמונה מסוג JPG, PNG או WEBP בלבד"));
        }
        cb(null, true);
    },
});

const createDeliveryUpload = uploadPhoto.single("photo");
const uploadDeliveryPhoto = uploadPhoto.single("photo");

function createToken() {
    return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

function getPublicBaseUrl() {
    return process.env.CLIENT_URL || "http://localhost:5173";
}

// יצירת משלוח ושליחת קישור למשלוחן
const createDelivery = async (req, res) => {
    try {
        const settings = await SystemSettings.findOne();

        if (!settings?.deliveryEmail) {
            return res.status(400).json({
                message: "יש להגדיר כתובת מייל למשלוחן בהגדרות המערכת",
            });
        }

        const {
            recipientName,
            phone,
            city,
            address,
            deliveryDate,
            items,
            notes,
        } = req.body;

        if (
            !recipientName ||
            !phone ||
            !city ||
            !address ||
            !deliveryDate ||
            !items
        ) {
            return res.status(400).json({
                message: "יש למלא את כל שדות החובה",
            });
        }

        const token = createToken();

        const delivery = await Delivery.create({
            recipientName,
            phone,
            city,
            address,
            deliveryDate,
            items,
            notes,
            confirmationTokenHash: hashToken(token),
            tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        const link = `${getPublicBaseUrl()}/delivery/${token}`;

        try {
            await sendBrevoEmail({
                to: settings.deliveryEmail,
                subject: "בקשת משלוח חדשה",
                html: `
        <div dir="rtl" style="font-family:Arial">
            <h2>בקשת משלוח חדשה</h2>
            <p>שלום, התקבלה בקשת משלוח חדשה.</p>
            <p>
                <strong>תאריך משלוח:</strong>
                ${new Date(delivery.deliveryDate).toLocaleDateString("he-IL")}
            </p>
            <p>לצפייה בפרטי המשלוח ולאישורו:</p>
            <a href="${link}">פתיחת פרטי המשלוח</a>
            <p>הקישור בתוקף למשך 7 ימים.</p>
        </div>
    `,
            });
        } catch (emailError) {
            await Delivery.findByIdAndDelete(delivery._id);
            throw emailError;
        }

        return res.status(201).json({
            message: "המשלוח נוצר ונשלח למשלוחן בהצלחה",
            delivery,
        });
    } catch (error) {
        console.error("Create delivery failed:", error);
        return res.status(500).json({
            message: "שגיאה ביצירת המשלוח או בשליחת המייל",
        });
    }
};

// הצגת פרטי משלוח באמצעות הקישור האישי
const getDeliveryByToken = async (req, res) => {
    try {
        const tokenHash = hashToken(req.params.token);

        const delivery = await Delivery.findOne({
            confirmationTokenHash: tokenHash,
            tokenExpiresAt: { $gt: new Date() },
        });

        if (!delivery) {
            return res.status(404).json({
                message: "הקישור אינו תקף או שפג תוקפו",
            });
        }

        return res.status(200).json({
            recipientName: delivery.recipientName,
            phone: delivery.phone,
            city: delivery.city,
            address: delivery.address,
            deliveryDate: delivery.deliveryDate,
            items: delivery.items,
            notes: delivery.notes,
            status: delivery.status,
            estimatedArrival: delivery.estimatedArrival,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "שגיאה בטעינת פרטי המשלוח",
        });
    }
};

// אישור משלוח והזנת זמן הגעה
const confirmDelivery = async (req, res) => {
    try {
        const { estimatedArrival } = req.body;

        if (!estimatedArrival || Number.isNaN(Date.parse(estimatedArrival))) {
            return res.status(400).json({
                message: "יש להזין זמן הגעה משוער תקין",
            });
        }

        const delivery = await Delivery.findOne({
            confirmationTokenHash: hashToken(req.params.token),
            tokenExpiresAt: { $gt: new Date() },
        });

        if (!delivery) {
            return res.status(404).json({
                message: "הקישור אינו תקף או שפג תוקפו",
            });
        }

        if (delivery.status !== "pending") {
            return res.status(400).json({
                message: "המשלוח כבר אושר או טופל",
            });
        }

        delivery.status = "approved";
        delivery.estimatedArrival = new Date(estimatedArrival);

        await delivery.save();

        return res.status(200).json({
            message: "המשלוח אושר בהצלחה",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "שגיאה באישור המשלוח",
        });
    }
};

// עדכון סטטוס המשלוח ל"בדרך"
const markDeliveryOnTheWay = async (req, res) => {
    try {
        const delivery = await Delivery.findOne({
            confirmationTokenHash: hashToken(req.params.token),
            tokenExpiresAt: { $gt: new Date() },
        });

        if (!delivery) {
            return res.status(404).json({
                message: "הקישור אינו תקף או שפג תוקפו",
            });
        }

        if (delivery.status !== "approved") {
            return res.status(400).json({
                message: "יש לאשר את המשלוח לפני סימון שהוא בדרך",
            });
        }

        delivery.status = "on_the_way";
        await delivery.save();

        return res.status(200).json({
            message: "המשלוח סומן כיצא לדרך",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "שגיאה בעדכון סטטוס המשלוח",
        });
    }
};

// העלאת תמונת המסירה
const completeDelivery = async (req, res) => {
    try {
        const delivery = await Delivery.findOne({
            confirmationTokenHash: hashToken(req.params.token),
            tokenExpiresAt: { $gt: new Date() },
        });

        if (!delivery) {
            return res.status(404).json({
                message: "הקישור אינו תקף או שפג תוקפו",
            });
        }

       if (!["approved", "on_the_way"].includes(delivery.status)) {
    return res.status(400).json({
        message: "אפשר להשלים משלוח רק לאחר אישורו",
    });
}
        if (!req.file) {
            return res.status(400).json({
                message: "יש לצרף תמונת מסירה",
            });
        }

        delivery.deliveryPhoto = `/uploads/${req.file.filename}`;
        delivery.status = "delivered";
        delivery.deliveredAt = new Date();

        await delivery.save();

        return res.status(200).json({
            message: "המסירה עודכנה בהצלחה",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "שגיאה בהשלמת המשלוח",
        });
    }
};

// קבלת כל המשלוחים במסך הרכזת
const getAllDeliveries = async (req, res) => {
    try {
        const deliveries = await Delivery.find()
            .select("-confirmationTokenHash -tokenExpiresAt")
            .sort({ createdAt: -1 });
        return res.status(200).json(deliveries);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "שגיאה בטעינת המשלוחים",
        });
    }
};

module.exports = {
    createDelivery,
    getDeliveryByToken,
    confirmDelivery,
    markDeliveryOnTheWay,
    completeDelivery,
    getAllDeliveries,
    createDeliveryUpload,
    uploadDeliveryPhoto,
};
