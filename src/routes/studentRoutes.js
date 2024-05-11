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
studentRouter.post('/editstudentprofile',auth,editStudentProfile)
studentRouter.get('/getstudentprofile/:studentId',auth,getStudentProfile)
studentRouter.post('/getallstudentprofile',auth,getAllStudentProfile)
studentRouter.post('/deletestudent',auth,deleteStudent)



module.exports = studentRouter;