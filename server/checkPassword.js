
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const readline = require("readline");

async function checkPassword() {
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

        rl.stdoutMuted = true;

        const password = await new Promise(resolve => {
            rl.question("Enter your password: ", resolve);
        });

        const valid = await bcrypt.compare(
            password,
            user.passwordHash
        );

        console.log(
            valid
                ? "\nPassword matches!"
                : "\nPassword does not match."
        );

    } catch (error) {
        console.error(error.message);
    } finally {
        rl.close();
        await mongoose.disconnect();
    }
}

checkPassword();
