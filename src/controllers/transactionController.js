const multer = require('multer');
const ProductModel = require('../models/productsModel');
const path = require('path');
const fs = require('fs');

const Product = ProductModel.product;
const ProductImage = ProductModel.productImage;
const PurchasedProduct = ProductModel.purchasedProduct;
const TransactionModels = require('../models/transactionModel');
const Transaction = TransactionModels.purchaseTransaction
const Transactions = TransactionModels.transactions
const userModels = require("../models/userModel");
const User = userModels.users;
const studentModels = require("../models/studentModel");
const Student = studentModels.student;




const getTransactionById = async (req, res) => {
    const currentUserId = req.userId;
    if (!currentUserId) {
        return res.status(404).json({ error: 'currentUserId not found' })
    }
    const pageSize = req.body.pageSize || 10;
    const page = req.body.page || 0;

    try {


        // Fetch the product with the image details populated
        const transaction = await Transactions.find({ userId: currentUserId })
            .populate('userId', 'username email')
            .sort({ createdAt: -1 })
            .skip(page * pageSize).limit(pageSize);

        const count = await Transactions.countDocuments({ userId: currentUserId });

        if (!transaction) {
            return res.status(404).json({ error: 'transaction not found' })

        }
        res.status(200).json({ status: true, count, transaction });
    } catch (error) {
        res.status(500).send(error.message);
    }

}


const getAllTransaction = async (req, res) => {
    const currentUserId = req.userId;
    if (!currentUserId) {
        return res.status(404).json({ error: 'currentUserId not found' })
    }

    const currentUser = await User.findOne({ _id: currentUserId })

    if (!currentUser) {
        return res.status(404).json({ error: 'currentUser not found' })
    }

    if (currentUser.role != "Admin") {
        return res.status(404).json({ error: 'Only Adminn can access this' })

    }


    const pageSize = req.body.pageSize || 10;
    const page = req.body.page || 0;

    try {
        // Fetch the product with the image details populated
        const transaction = await Transactions.find()
            .populate('userId', 'username email')
            .sort({ createdAt: -1 })
            .skip(page * pageSize).limit(pageSize);

        const count = await Transactions.countDocuments();

        if (!transaction) {
            return res.status(404).json({ error: 'transaction not found' })

        }
        res.status(200).json({ status: true, count, transaction });
    } catch (error) {
        res.status(500).send(error.message);
    }

}

const HomeSummary = async (req, res) => {
    const currentUserId = req.userId;

    if (!currentUserId) {
        return res.status(404).json({ error: 'currentUserId not found' })
    }



    const currentUser = await User.findOne({ _id: currentUserId })

    if (!currentUser) {
        return res.status(404).json({ error: 'currentUser not found' })
    }

    if (currentUser.role != "Admin") {
        return res.status(404).json({ error: 'Only Adminn can access this' })

    }
    try {
        const [productCount, studentCount, transactionCount, purchasedProductCount] = await Promise.all([
            Product.countDocuments({ status: "Active" }),
            Student.countDocuments({ status: "Active" }),
            Transactions.countDocuments(),
            PurchasedProduct.countDocuments()
        ]);



        let summary = {
            productCount,
            studentCount,
            transactionCount,
            purchasedProductCount

        }
        res.status(200).json({ status: true, summary });
    } catch (error) {
        console.error("Error in fetching counts: ", error);
    }







}

module.exports = { getTransactionById, getAllTransaction, HomeSummary }