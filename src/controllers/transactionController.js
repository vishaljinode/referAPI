


const userModels = require("../models/userModel");
const User = userModels.users;
//const UserVerificationCode = userModels.userVerificationCode;
const ForgotPassVerificationCode = userModels.forgotPassVerificationCode;
const Counter = userModels.counter;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const SECRET_KEY = "myprojectapiforyou";
const sendEmail = require("../utils/sendEmail");
const studentModels = require("../models/studentModel");
const Student = studentModels.student;

