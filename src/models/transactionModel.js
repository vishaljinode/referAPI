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
    transactionDate: {
        type: Date,
        default: Date.now
    },
    cardNo: {
        type: String,
        required: true,
    },
    expiryDate: {
        type: String,
        required: true,
    },
    cvv: {
        type: String,
        required: true,
    },
}, { timestamps: true })


const transactionsSchema = mongoose.Schema({
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
    },
    note: {
        type: String,
    }

}, { timestamps: true })


module.exports.purchaseTransaction = mongoose.model("TransactionHistories", transactionHistoryShema)
module.exports.transactions = mongoose.model("Transactions", transactionsSchema)