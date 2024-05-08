const express = require('express')
const studentRouter = express.Router()
const auth = require('../middleware/auth');

const {signUpStudent,editStudentProfile,
    getStudentProfile,getAllStudentProfile,
    deleteStudent} = require('../controllers/studentController')


studentRouter.get('/',(req,res)=>{
    res.send("hello")
})

studentRouter.post('/signupstudent',signUpStudent)
studentRouter.post('/editstudentprofile',editStudentProfile)
studentRouter.get('/getstudentprofile/:studentId',getStudentProfile)
studentRouter.get('/getallstudentprofile',auth,getAllStudentProfile)
studentRouter.post('/deletestudent',auth,deleteStudent)


module.exports = studentRouter;