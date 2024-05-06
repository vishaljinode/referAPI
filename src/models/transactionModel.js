const mongoose = require("mongoose")

const transactionHistoryShema = mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    transactionAmount: {
        type: Number,
        required: true,
    },
    transactionType: {
        type: String,
        required: true,
        enum: ['credit', 'debit']
    },
    transactionDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })



module.exports = mongoose.model("TransactionHistories",transactionHistoryShema)