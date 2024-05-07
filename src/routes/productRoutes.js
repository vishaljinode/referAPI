const express = require('express')
const productRouter = express.Router()
const auth = require('../middleware/auth');




productRouter.get('/',(req,res)=>{
    res.send("hello")
})

productRouter.post('/signup',signUp)


module.exports = productRouter;