const mongoose = require('mongoose')
const studentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    standard: {
        type: String,
        required: true,
        index: true
    },
    rolno: {
        type: String,
        required: true
    },
    marks: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    status: {
        type: String,
        default: "Inactive"
    },
    email: {
        type: String,
        required: true,
        index: true
    },
}, { timestamps: true })



module.exports.student = mongoose.model("Student", studentSchema);