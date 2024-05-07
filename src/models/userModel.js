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
    userId :{
      type : String,    
      index: true
    },
    otp :{
        type : String,
        
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
        index: true
    },
    referrPersonId :{
        type : String,
        ref: 'User',
        index: true
    },
    status: {
        type:String,
        default:"Inactive"
    },

},{timestamps : true})



// const userVerificationCodeSchema = new mongoose.Schema({
//     userId: { 
//       type: mongoose.Schema.Types.ObjectId, 
//       ref: "User", 
//       index: true 
//     },
//     email: { 
//       type: String, 
//       required: true
//     },
//     otp: { 
//       type: String 
//     }
//   }, { timestamps: true });
  
  
  
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

  const counterSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    seq: {type: Number, default: 0}
  });




//module.exports = mongoose.model("User",userSchema);
module.exports.users = mongoose.model("User", userSchema);
module.exports.forgotPassVerificationCode = mongoose.model("ForgotPasswordVerificationCode", forgotPassVerificationCodeSchema);
//module.exports.userVerificationCode = mongoose.model("UserVerificationCode", userVerificationCodeSchema);
module.exports.counter = mongoose.model('Counter', counterSchema);
