const express = require('express')
const app = express()

const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()


// console.log('DB Connection URL:', process.env.DB_CONNECTION_URL);

if (!process.env.DB_CONNECTION_URL) {
    console.error('DB_CONNECTION_URL is not defined in .env file');
    process.exit(1);
  }
  

mongoose.connect(process.env.DB_CONNECTION_URL)
.then(()=>{
    console.log("Database Connected Successfully");
   
})
.catch((e)=>{
    console.log("Error In Database Connection : ", e);
})

