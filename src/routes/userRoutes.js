const express = require('express')
const userRouter = express.Router()
const auth = require('../middleware/auth');

const { signUp,
    verifyUserOtp,
    signIn, forgotPass,
    verifyForgotPassOtp,
    resetPassword,
    changePassword,
    deleteUser, getUserById,
    updateUser } = require('../controllers/userControllers')

const { HomeSummary } = require('../controllers/transactionController')

userRouter.post('/signup', signUp)
userRouter.post('/verifyUserOtp', verifyUserOtp)
userRouter.post('/signin', signIn)
userRouter.post('/forgotPassOTP', forgotPass)
userRouter.post('/verifyForgotPass', verifyForgotPassOtp)
userRouter.put('/resetPassword', auth, resetPassword)
userRouter.post('/changepassword', auth, changePassword)
userRouter.post('/deleteuser', auth, deleteUser)
userRouter.post('/updateuser', auth, updateUser)
userRouter.get('/getuserbyid/:id', auth, getUserById)

userRouter.get('/summary', auth, HomeSummary)


module.exports = userRouter;