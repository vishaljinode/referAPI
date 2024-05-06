const userModels = require("../models/userModel");
const User = userModels.users;
const UserVerificationCode = userModels.userVerificationCode;
const ForgotPassVerificationCode = userModels.forgotPassVerificationCode;

// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECTRET_KEY = "myprojectapiforyou";
const sendEmail = require('../utils/sendEmail');


//SingUp
const signUp = async (req, res) => {
  const { email, password, username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "username is missing" });
  }

  if (!email) {
    return res.status(400).json({ error: "email is missing" });
  }
  if (!password) {
    return res.status(400).json({ error: "password is missing" });
  }
  

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.status === "Active") {
        return res.status(400).json({ message: "User Already Exists" });
      } 

      const updatedUser = await User.findOneAndUpdate(
        { email: email },
        { email: email, password: password, username: username , },
        { new: true }
      );
      console.log(updatedUser);
    } else {
      
        
      await User.create({ username, password, email });
    }

    const newUser = await User.findOne({ email }).select('_id email status');

    let otp = '';
    for (let i = 0; i < 6; i++) {
      otp += Math.floor(Math.random() * 10); 
    }

    const updateUserVerificationCodePromise = UserVerificationCode.findOneAndUpdate(
      { email: newUser.email },
      { userId: newUser._id, otp: otp },
      { upsert: true, new: true }
    );

    const sendEmailPromise = sendEmail({
      email: newUser.email,
      subject: "Please verify OTP",
      message: `Your OTP is ${otp}`
    });

    await Promise.all([updateUserVerificationCodePromise, sendEmailPromise]);
    const signUptoken = await jwt.sign({ email: newUser.email, id: newUser._id }, SECTRET_KEY);

    res.status(201).json({ status: true, User: newUser, Token :signUptoken, message: `OTP sent on ${newUser.email}` })
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}



module.exports = {
    signUp,

}

