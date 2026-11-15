
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const readline = require("readline");

async function resetPassword() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        await mongoose.connect(process.env.MONGO_URI);

        const user = await User.findOne({
            email: "coordinator@example.com"
        });

        if (!user) {
            console.log("User not found");
            return;
        }

        const password = await new Promise(resolve => {
            rl.question("Enter your new password: ", resolve);
        });

        if (password.length < 8) {
            console.log("Password must contain at least 8 characters.");
            return;
        }

        user.passwordHash = await bcrypt.hash(password, 12);
        await user.save();

        console.log("Password updated successfully!");

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        rl.close();
        await mongoose.disconnect();
    }
}

resetPassword();
