const express = require('express')
const transactionRouter = express.Router()
const auth = require('../middleware/auth');




transactionRouter.get('/',(req,res)=>{
    res.send("hello")
})

transactionRouter.post('/signup',signUp)


module.exports = transactionRouter;