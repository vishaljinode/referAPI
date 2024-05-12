const userModels = require("../models/userModel");
const User = userModels.users;
//const UserVerificationCode = userModels.userVerificationCode;
const ForgotPassVerificationCode = userModels.forgotPassVerificationCode;
const Counter = userModels.counter
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const SECRET_KEY = "myprojectapiforyou";
const sendEmail = require('../utils/sendEmail');
const studentModels = require("../models/studentModel");
const  Student = studentModels.student



//UserId Counter
async function getNextSequence(name) {
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}



//Generate 6 Digit ReferId
function generateReferId() {
  return crypto.randomInt(100000, 1000000).toString();
}

async function checkReferIdUnique(referId) {
  // Here you would actually query your database to check uniqueness
  const result = await User.findOne({ referId });
  return !result;  
}

async function checkUserIdUnique(userId) {
  // Here you would actually query your database to check uniqueness
  const result = await User.findOne({ userId });
  return !result;  
}


//SingUp
const signUp = async (req, res) => {
  const { email, password, username, referId } = req.body;

  // Validate required fields
  const requiredFields = { username, email, password, referId };
  for (let field in requiredFields) {
    if (!requiredFields[field]) {
      return res.status(400).json({ error: `${field} is missing` });
    }
  }


  let otp = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('');


  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.status === "Active") {
        return res.status(400).json({ message: "User Already Exists" });
      }   
     
      
      const referredPerson = await User.findOne({ referId: referId });

      if(!referredPerson){
        return res.status(400).json({ error: "Invalid ReferId" });
      }
   
      const updatedUser = await User.findOneAndUpdate(
        { email: email },
        { username,password: password, otp, referrPersonId: referredPerson?.userId },
        { new: true }
      );

      console.log(updatedUser);
    } else {     

      const referredPerson = await User.findOne({ referId: referId });
  

      if(!referredPerson){
        return res.status(400).json({ error: "Invalid ReferId" });
      }


      const userId = `A${await getNextSequence('userId')}`;
      
      // Generate unique ReferId
      let newUserReferId;
      do {
        newUserReferId = generateReferId();
      } while (!(await checkReferIdUnique(newUserReferId)));



      // For new users
      await User.create({ username, password: password,role : "Admin", email, otp ,userId,referId : newUserReferId, referrPersonId: referredPerson?.userId });
    }

    const newUser = await User.findOne({ email }).select('_id email status role');
    const sendEmailPromise = sendEmail({
      email: newUser.email,
      subject: "Please verify OTP for signup",
      message: `Your OTP is ${otp}`
    });

    await Promise.all([sendEmailPromise]);
    const signUpToken = await jwt.sign({ email: newUser.email, id: newUser._id }, SECRET_KEY);

    res.status(201).json({ status: true, user: newUser, token: signUpToken, message: `OTP sent on ${newUser.email}` })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

//Verify User OTP
const verifyUserOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find the OTP entry for the given email
    const verificationEntry = await User.findOne({ email});

    if (!verificationEntry) {
      return res.status(404).json({ error: "No OTP found." });
    }
    if (verificationEntry.status == "active") {
      return res.status(404).json({ error: "User Already Active" });
    }

    // Check if the OTP matches
    if (verificationEntry.otp === otp) {
     const verifiedUser = await User.findOneAndUpdate({ email: email }, { $set: { status: "Active" } })  
     
      if(verifiedUser.role=="Student"){
        await Student.findOneAndUpdate({ email: email }, { $set: { status: "Active" } })    
      }

      const signInuser = await User.findOne({ email: email }).select('_id email username role');
      const token = await jwt.sign({ email: signInuser.email, id: signInuser._id }, SECRET_KEY);
      return res.status(200).json({ status : true, User: signInuser, Token: token, message: "OTP verified successfully!" });
    } else {
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "An error occurred during verification. Please try again later." });
  }
};


//signIn
const signIn = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: "email is missing" });
  }
  if (!password) {
    return res.status(400).json({ error: "password is missing" });
  }

  try {
    //Check User Exist or not
    const existingUser = await User.findOne({ email: email, status: "Active" });

    if (!existingUser) {
      return res.status(404).json({ error: "User Not Found" })
    }

    //password match
    // const matchPassword=await bcrypt.compare(password,existingUser.password);
    if (password != existingUser.password) {
      return res.status(400).json({ error: "email or password not match" })
    }

    const signInuser = await User.findOne({ _id: existingUser._id }).select('email username role');
    //token generation
    const token = await jwt.sign({ email: existingUser.email, id: existingUser._id }, SECRET_KEY);

    res.status(200).json({status:true, User: signInuser, Token: token })

  } catch (error) {
    console.log(error);
    console.log("Something went wrong");
  }



}


//Forgot Password OTP
const forgotPass = async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ error: "email is missing" });
  }
  try {
    const existingUser = await User.findOne({ email: email, status: "Active" })
      .select('_id username email status')

    if (!existingUser) {
      return res.status(400).json({ error: "User not found" })
    }

    let otp = '';
    for (let i = 0; i < 4; i++) {
      otp += Math.floor((Math.random() * 10))
    }
    const forgotPassVerificationCode = ForgotPassVerificationCode.findOneAndUpdate(
      { email: existingUser.email },
      { userId: existingUser._id, otp: otp },
      { upsert: true, new: true }
    );

    const sendEmailPromise = sendEmail({
      email: existingUser.email,
      subject: "Please verify forgot password OTP",
      message: `Your forgot password OTP is ${otp}`
    });
    await Promise.all([forgotPassVerificationCode, sendEmailPromise]);
    res.status(201).json({ status: true, User: existingUser, message: `Forgot password OTP sent on ${existingUser.email}` })
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }

}


const verifyForgotPassOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is missing" });
  }

  if (!otp) {
    return res.status(400).json({ error: "OTP is missing" });
  }

  try {
    // Find the OTP entry for the given email
    const verificationEntry = await ForgotPassVerificationCode.findOne({ email :email });
    if (!verificationEntry) {
      return res.status(404).json({ error: "No OTP found. Please request a new one." });
    }

    // Check if the OTP matches
    if (verificationEntry.otp === otp) {
      await ForgotPassVerificationCode.deleteOne({ _id: verificationEntry._id })
      const signInuser = await User.findOne({ email: email }).select('_id email username role');
      const token = jwt.sign({ email: signInuser.email, id: signInuser._id }, SECRET_KEY);
      return res.status(200).json({ status: true , forgetPassUser: signInuser, Token: token, message: "OTP verified successfully!" });
    } else {
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "An error occurred during verification. Please try again later." });
  }
};


const resetPassword =async(req,res)=>{
  const userId = req.userId; 
  const { password1, password2} = req.body ;
  if (!password1) {
    return res.status(400).json({ error: "password1 is missing" });
  }
  if (!password2) {
    return res.status(400).json({ error: "Password2 is missing" });
  }

 if (password1 !== password2) {
    return res.status(400).json({ error: "Password1 and Password2 are not same" });
  }

  try {
    let updatedUser = await User.findOneAndUpdate({_id : userId},{$set :{ password : password1}},{upsert : false , new:true})
  .select('_id username email role')
  let token = jwt.sign({email : updatedUser.email , _id : updatedUser._id }, SECRET_KEY)
  return res.status(200).json({status : true, User : updatedUser , Token : token})

    
  } catch (error) {
    return res.status(500).json({message : "Error occur in reset password"})
  }
  }

//change Pasword
const changePassword = async (req, res) => {
  const userId = req.userId; // This should ideally come from a session or token verification
  const { oldPassword, newPassword1, newPassword2 } = req.body;

  if (!oldPassword) {
    return res.status(400).json({ error: "Old password is missing" });
  }
  if (!newPassword1 || !newPassword2) {
    return res.status(400).json({ error: "New password is missing" });
  }
  if (newPassword1 !== newPassword2) {
    return res.status(400).json({ error: "New passwords do not match" });
  }

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare old password
    //const isMatch = await bcrypt.compare(oldPassword, user.password);
   
    if (oldPassword!=user.password) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }


    // Update the user's password
    user.password = newPassword1;
    const updatedUser = await user.save();

    // Optionally, regenerate the token or invalidate the old one
    const token = jwt.sign({ email: updatedUser.email, _id: updatedUser._id }, SECRET_KEY);
    return res.status(200).json({ status: true, message: "Password updated successfully", user: { id: updatedUser._id, username: updatedUser.username, email: updatedUser.email }, token });

  } catch (error) {
    return res.status(500).json({ message: "Error occur in changing password" });
  }
};


//delete user
const deleteUser = async (req, res) => {
  const currentUserId = req.userId;
  const { userId } = req.body; 

  try {
    const currentUser = await User.findOne({_id : currentUserId })
    if(!currentUser){
      return res.status(404).json({ error: "User not found" });

    }

    if(currentUser.role != "Admin"){
      return res.status(404).json({ error: "Only admin can delete user" });

    }

      // Update user status to 'deleted'
      const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $set: { status: 'deleted' } },
          { new: true, upsert : false } // Returns the updated document
      );

      if (!updatedUser) {
          return res.status(404).json({ error: "User not found" });
      }

      // Respond with success message
      return res.status(200).json({
          status: true,
          message: "User has been marked as deleted",
          user: { id: updatedUser._id, username: updatedUser.username, email: updatedUser.email, status: updatedUser.status }
      });
  } catch (error) {
      return res.status(500).json({ message: "An error occurred during the delete operation" });
  }
};


const updateUser = async (req, res) => {
  const { email, username } = req.body;
  const currentUserId = req.userId;

  console.log("currentUserId",currentUserId)

  try {

    const currentUser = await User.findOne({ _id: currentUserId });
    console.log ("currentUser in auth",currentUser)



    // Find the user by email
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.role != "Admin" || existingUser._id != currentUserId) {
      return res.status(404).json({ error: "Only admin or current user can edit user detail" });
    }


    if (username) {
      existingUser.username = username;
    }


    // Save the updated user
    await existingUser.save();


    const updatedUser = await User.findOne({ email }).select('_id email username role');

    const token = await jwt.sign(
      { email: updatedUser.email, id: updatedUser._id },
      SECRET_KEY
    );

    res
      .status(200)
      .json({
        status: true,
        Token: token,
        User: updatedUser,
        message: "Profile updated successfully",
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};



//get user
const getUserById = async (req, res) => {
  const currentUserId = req.params.id


  try {
    const currentUser = await User.findOne({_id : currentUserId })
    if(!currentUser){
      return res.status(404).json({ error: "User not found" });
    }

      // Respond with success message
      return res.status(200).json({
          status: true,
          message: "User detail getting successfully",
          user: { id: currentUser._id, username: currentUser.username, email: currentUser.email, status: currentUser.status , balance : currentUser.balance, role : currentUser.role }
      });
  } catch (error) {
      return res.status(500).json({ message: "An error occurred during the delete operation" });
  }
};






module.exports = {
    signUp,
    verifyUserOtp,
    signIn,
    forgotPass,
    verifyForgotPassOtp,
    resetPassword,
    changePassword,
    deleteUser,
    updateUser,
    getUserById
}

