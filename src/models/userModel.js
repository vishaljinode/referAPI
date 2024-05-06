const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
    username :{
        type : String,
        required : true
    },
    email :{
        type : String,
        required : true,
        index: true
    },
    password :{
        type : String,
        required : true
    },
    otp :{
        type : String,
        required : true
    },
    role :{
        type : String,
        default : "Student",
        required : true
    },
    balance :{
        type : Number,
        required : true,
        default : 500
    },
    referId :{
        type : String,
        default : 500,
        index: true
    },
    referBy :{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    status: {
        type:String,
        default:"Active"
    },

},{timestamps : true})



module.exports = mongoose.model("User",userSchema);