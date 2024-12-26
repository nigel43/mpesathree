const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: "Pending" },
    transactionId: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
