const express = require('express')
const transactionRouter = express.Router()
const auth = require('../middleware/auth');

const { getAllTransaction, getTransactionById } = require('../controllers/transactionController')

transactionRouter.post('/getAllTransaction', auth, getAllTransaction)
transactionRouter.post('/getTransactionById', auth, getTransactionById)


module.exports = transactionRouter;