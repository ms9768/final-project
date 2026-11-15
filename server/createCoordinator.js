
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("./models/User");

async function createCoordinator() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = "coordinator@example.com";
        const fullName = process.env.COORDINATOR_NAME;
        const password = process.env.INITIAL_PASSWORD;

        if (!fullName || !password) {
            throw new Error("Missing name or password");
        }

        if (password.length < 8) {
            throw new Error("Password must contain at least 8 characters");
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log("A user with this email already exists.");
            return;
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const coordinatorCode =
            "COORD-" + crypto.randomBytes(4).toString("hex").toUpperCase();

        const user = await User.create({
            fullName,
            email,
            passwordHash,
            role: "coordinator",
            coordinatorCode,
            approvalStatus: "approved",
            isActive: true
        });

        console.log("Coordinator created successfully!");
        console.log("Email:", user.email);
        console.log("Role:", user.role);
        console.log("Coordinator code:", user.coordinatorCode);

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
}

createCoordinator();
