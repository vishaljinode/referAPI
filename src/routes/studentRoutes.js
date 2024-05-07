const express = require('express')
const studentRouter = express.Router()
const auth = require('../middleware/auth');




studentRouter.get('/',(req,res)=>{
    res.send("hello")
})

studentRouter.post('/signup',signUp)


module.exports = studentRouter;