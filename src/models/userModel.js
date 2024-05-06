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
        default:"Inactive"
    },

},{timestamps : true})



const userVerificationCodeSchema = new mongoose.Schema({
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      index: true 
    },
    email: { 
      type: String, 
      required: true
    },
    otp: { 
      type: String 
    }
  }, { timestamps: true });
  
  
  
  const forgotPassVerificationCodeSchema = new mongoose.Schema({
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      index: true 
    },
    email: { 
      type: String, 
      required: true
    },
    otp: { 
      type: String 
    }
  }, { timestamps: true });


//module.exports = mongoose.model("User",userSchema);
module.exports.users = mongoose.model("User", userSchema);
module.exports.forgotPassVerificationCode = mongoose.model("ForgotPasswordVerificationCode", forgotPassVerificationCodeSchema);
module.exports.userVerificationCode = mongoose.model("UserVerificationCode", userVerificationCodeSchema);