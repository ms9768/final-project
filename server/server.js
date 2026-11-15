
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const lessonRoutes = require("./routes/lessonRoutes");
const commentRoutes = require("./routes/commentRoutes");
const contactRoutes = require("./routes/contactRoutes");
const userRoutes = require("./routes/userRoutes");
const meetingReportRoutes = require("./routes/MeetingReportRoute");
const groupRoutes = require("./routes/GroupRoute");
const systemSettingsRoutes = require("./routes/SystemSettingsRoute");
const deliveryRoutes = require("./routes/DeliveryRoute");
const bankDetailsRoutes = require("./routes/bankDetailsRoutes");
const paymentManagementRoutes = require("./routes/paymentManagementRoutes");

const app = express();
const PORT = process.env.PORT || 7001;

app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/lessons", lessonRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/meeting-reports", meetingReportRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/systemsettings", systemSettingsRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/bank-details", bankDetailsRoutes);
app.use("/api/payment-management", paymentManagementRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Hello from Server!" });
});

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
}

startServer();
