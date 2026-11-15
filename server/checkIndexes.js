require("dotenv").config();
const mongoose = require("mongoose");

async function checkIndexes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const indexes = await mongoose.connection
            .collection("users")
            .indexes();

        console.log("USER COLLECTION INDEXES:");
        console.log(JSON.stringify(indexes, null, 2));

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkIndexes();