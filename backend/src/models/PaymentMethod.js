const mongoose = require("mongoose");

const PaymentMethodSchema = new mongoose.Schema({
    payment_name: { 
        type: String, 
        enum: ["cash", "momo"],
        required: true 
    },

    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PaymentMethod", PaymentMethodSchema);
