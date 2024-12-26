const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const mongoose = require("./transactionModel");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/mpesa.pesa", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Safaricom Daraja API credentials
const credentials = {
    consumerKey: "kawfXeAFIzD253hPnX1bAFuPPjz4enHwDCc3tkJ0okN7chc2",
    consumerSecret: "imZD6Pb8sNc52wkvwyUoGeDTGEGOaehPRyGq5HvI6NW8Ovv4LgZdB4HbXeGB16Cm",
    shortCode: "3122608",
    passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
};

async function getAccessToken() {
    const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
        auth: {
            username: credentials.consumerKey,
            password: credentials.consumerSecret
        }
    });
    return response.data.access_token;
}

app.post("/api/payment", async (req, res) => {
    const { phoneNumber, amount } = req.body;
    try {
        const accessToken = await getAccessToken();
        const timestamp = new Date().toISOString().replace(/[-:TZ]/g, "").slice(0, 14);
        const password = Buffer.from(`${credentials.shortCode}${credentials.passkey}${timestamp}`).toString("base64");

        const response = await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
            BusinessShortCode: credentials.shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: credentials.shortCode,
            PhoneNumber: phoneNumber,
            CallBackURL: "https://nigel43.github.io/mpesathree//callback",
            AccountReference: "Ecommerce",
            TransactionDesc: "Payment for product"
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        // Log transaction to MongoDB
        const transaction = new Transaction({
            phoneNumber,
            amount,
            status: "Pending",
            transactionId: response.data.CheckoutRequestID
        });
        await transaction.save();

        res.status(200).json({ message: "STK Push sent successfully." });
    } catch (error) {
        console.error("Payment error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to initiate payment." });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
