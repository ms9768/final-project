
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

async function checkCoordinator() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const user = await User.findOne({
            email: "coordinator@example.com"
        }).select("fullName email role approvalStatus isActive coordinatorCode");

        if (!user) {
            console.log("User not found");
            return;
        }

        console.log("User details:");
        console.log(user.toObject());

    } catch (error) {
        console.error(error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkCoordinator();
