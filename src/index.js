const express = require('express')
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')
const userRouter = require('./routes/userRoutes')
const PORT = process.env.PORT || 5000

require('./databaseConnection/db')
const User = require('./models/userModel')
const Product = require('./models/productsModel')
const Student = require('./models/studentModel')
const TransactionHistory = require('./models/transactionModel')

dotenv.config()
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cors())

app.use('/users',userRouter)

app.get('/',(req,res)=>{
    res.send("hello")
})


app.listen(PORT,()=>{
    console.log("Server Running On Port Number: ", PORT);
})

