const userModels = require("../models/userModel");
const User = userModels.users;
//const UserVerificationCode = userModels.userVerificationCode;
const ForgotPassVerificationCode = userModels.forgotPassVerificationCode;
const Counter = userModels.counter;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dotenv = require('dotenv')
dotenv.config()
const SECRET_KEY = process.env.SECRET_KEY
const sendEmail = require("../utils/sendEmail");
const studentModels = require("../models/studentModel");
const Student = studentModels.student;



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
const signUpStudent = async (req, res) => {
  const { email, password, username, referId, name, standard, rolno, marks } =
    req.body;

  // Validate required fields
  const requiredFields = {
    email,
    password,
    username,
    referId,
    name,
    standard,
    rolno,
    marks,
  };
  for (let field in requiredFields) {
    if (!requiredFields[field]) {
      return res.status(400).json({ error: `${field} is missing` });
    }
  }

  let otp = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.status === "Active") {
        return res.status(400).json({ error: "User Already Exists" });
      }

      const referredPerson = await User.findOne({ referId: referId });

      if (!referredPerson) {
        return res.status(400).json({ error: "Invalid ReferId" });
      }

      const updatedUser = await User.findOneAndUpdate(
        { email: email },
        {
          username,
          password: password,
          otp,
          referrPersonId: referredPerson?.userId,
        },
        { new: true }
      );


    } else {
      const referredPerson = await User.findOne({ referId: referId });

      if (!referredPerson) {
        return res.status(400).json({ error: "Invalid ReferId" });
      }

      const userId = `A${await getNextSequence("userId")}`;

      // Generate unique ReferId
      let newUserReferId;
      do {
        newUserReferId = generateReferId();
      } while (!(await checkReferIdUnique(newUserReferId)));

      // For new users
      const createdUser = await User.create({
        username,
        password: password,
        email,
        otp,
        userId,
        referId: newUserReferId,
        referrPersonId: referredPerson?.userId,
      });
      await Student.create({
        name,
        email,
        standard,
        rolno,
        marks,
        userId: createdUser._id,
      });
    }

    const newUser = await User.findOne({ email }).select("_id email status");

    const sendEmailPromise = sendEmail({
      email: newUser.email,
      subject: "Please verify OTP for signup",
      message: `Your OTP is ${otp}`,
    });

    await Promise.all([sendEmailPromise]);
    const signUpToken = await jwt.sign(
      { email: newUser.email, id: newUser._id },
      SECRET_KEY
    );

    res
      .status(201)
      .json({
        status: true,
        user: newUser,
        token: signUpToken,
        message: `OTP sent on ${newUser.email}`,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//edit student
const editStudentProfile = async (req, res) => {
  const { email, password, username, name, standard, rolno, marks } = req.body;

  const currentUserId = req.userId;

  try {

    const currentUser = await User.findOne({ _id: currentUserId });

    // Find the user by email
    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }


    if (currentUser.role != "Admin" && !currentUser._id.equals(existingUser._id)) {
      return res.status(404).json({ error: "Only admin or current user can edit student detail" });
    }


    if (username) {
      existingUser.username = username;
    }


    // Save the updated user
    await existingUser.save();

    // Find and update student profile
    const studentProfile = await Student.findOne({ userId: existingUser._id });
    if (!studentProfile) {
      return res.status(404).json({ message: "Student profile not found" });
    }
    if (name) {
      studentProfile.name = name;
    }
    if (standard) {
      studentProfile.standard = standard;
    }
    if (rolno) {
      studentProfile.rolno = rolno;
    }
    if (marks) {
      studentProfile.marks = marks;
    }

    // Save the updated student profile
    await studentProfile.save();

    const existingStudent = await Student.findOne({ email });
    // const token = await jwt.sign(
    //   { email: existingStudent.email, id: existingStudent._id },
    //   SECRET_KEY
    // );

    res
      .status(200)
      .json({
        status: true,
        User: existingStudent,
        message: "Profile updated successfully",
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getStudentProfile = async (req, res) => {
  const studentId = req.params.studentId;

  try {
    // Find the student profile associated with the user
    const studentProfile = await Student.findOne({
      _id: studentId,
      status: "Active",
    });
    if (!studentProfile) {
      return res.status(404).json({ message: "Student profile not found" });
    }
    // Find the user by email
    const existingUser = await User.findOne({
      email: studentProfile.email,
      status: "Active",
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Construct response object with user and student profile details
    const response = {
      user: {
        id: existingUser._id,
        email: existingUser.email,
        username: existingUser.username,
        // Add other user fields here if needed
      },
      studentProfile: {
        name: studentProfile.name,
        standard: studentProfile.standard,
        rolno: studentProfile.rolno,
        marks: studentProfile.marks,
        // Add other student profile fields here if needed
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getAllStudentProfile = async (req, res) => {
  const currentUserId = req.userId;
  const pageSize = req.body.pageSize || 10;
  const page = req.body.page || 0;

  try {
    const currentUser = await User.findOne({ _id: currentUserId });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }



    if (currentUser.role != "Admin") {
      return res.status(404).json({ error: "Only admin can access all user" });
    }

    // Find all active student profiles
    const studentProfiles = await Student.find({ status: "Active" }).sort({ createdAt: -1 });


    if (!studentProfiles || studentProfiles.length === 0) {
      return res
        .status(404)
        .json({ error: "No active student profiles found" });
    }

    // Array to store response objects for each student
    const responseArray = [];

    // Loop through each student profile to get associated user details
    for (const studentProfile of studentProfiles) {
      // Find the user by student's userId
      const existingUser = await User.findById(studentProfile.userId);

      if (!existingUser) {
        console.error(
          `User not found for student with userId: ${studentProfile.userId}`
        );
        continue;
      }


      const response = {
        user: {
          id: existingUser._id,
          email: existingUser.email,
          username: existingUser.username,
          // Add other user fields here if needed
        },
        studentProfile: {
          name: studentProfile.name,
          standard: studentProfile.standard,
          rolno: studentProfile.rolno,
          marks: studentProfile.marks,
          id: studentProfile._id

        },
      };

      responseArray.push(response);
    }

    const count = responseArray.length
    const paginationData = responseArray.slice((pageSize * page), ((pageSize * page) + pageSize))

    res.status(200).json({ status: true, users: paginationData, count: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const deleteStudent = async (req, res) => {
  const { email } = req.body;
  const currentUserId = req.userId;

  try {
    const currentUser = await User.findOne({ _id: currentUserId });

    if (!currentUser) {
      return res.status(404).json({ error: "User token not found" });
    }
    if (currentUser.role != "Admin") {
      return res.status(401).json({ error: "Only admin can delete user" });
    }

    // Find the user by email
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's status to "Deleted"
    existingUser.status = "Deleted";
    await existingUser.save();

    // Find and update the student profile associated with the user
    const studentProfile = await Student.findOne({ userId: existingUser._id });
    if (!studentProfile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Update the student profile's status to "Deleted"
    studentProfile.status = "Deleted";
    await studentProfile.save();

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};



//get student profile by userId
const getStudentProfileByuserId = async (req, res) => {
  const currentUserId = req.userId;

  try {
    // Find the student profile associated with the user
    const studentProfile = await Student.findOne({
      userId: currentUserId,
      status: "Active",
    });

    if (!studentProfile) {
      return res.status(404).json({ message: "Student profile not found" });
    }
    // Find the user by email
    const existingUser = await User.findOne({
      email: studentProfile.email,
      status: "Active",
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Construct response object with user and student profile details
    const response = {
      user: {
        id: existingUser._id,
        email: existingUser.email,
        username: existingUser.username,
        // Add other user fields here if needed
      },
      studentProfile: {
        name: studentProfile.name,
        standard: studentProfile.standard,
        rolno: studentProfile.rolno,
        marks: studentProfile.marks,
        // Add other student profile fields here if needed
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};




module.exports = {
  deleteStudent,
  signUpStudent,
  editStudentProfile,
  getStudentProfile,
  getAllStudentProfile,
  getStudentProfileByuserId

};
