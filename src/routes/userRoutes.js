const express = require('express')
const userRouter = express.Router()
const auth = require('../middleware/auth');

const {signUp,
    verifyUserOtp,
    signIn,forgotPass,
    verifyForgotPassOtp,
    resetPassword,
    changePassword,
    deleteUser} = require('../controllers/userControllers')



userRouter.get('/',(req,res)=>{
    res.send("hello")
})

userRouter.post('/signup',signUp)
userRouter.post('/verifyUserOtp',verifyUserOtp)
userRouter.post('/signin',signIn)
userRouter.post('/forgotPassOTP',forgotPass)
userRouter.post('/verifyForgotPass',verifyForgotPassOtp)
userRouter.put('/resetPassword',auth,resetPassword)
userRouter.post('/changepassword',auth,changePassword)
userRouter.post('/deleteuser',auth,deleteUser)


module.exports = userRouter;