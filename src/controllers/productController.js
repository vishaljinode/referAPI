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


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.resolve(__dirname, '../uploads/');  // Absolute path
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }).single('file');

//create products
const createProduct = async (req, res, next) => {
    upload(req, res, async (err) => {

        if (err instanceof multer.MulterError) {
            return res.status(500).send(err.message);
        } else if (err) {
            return res.status(500).send(err.message);
        } else if (!req.file) {
            return res.status(400).send('Please select a file to upload');
        }

        const { productName, details, price, stock } = req.body;
        const userId = req.userId;

        try {
            const newImage = new ProductImage({
                mediaUrl: req.file.path,
                mediaType: req.file.mimetype
            });
            const savedImage = await newImage.save();

            const newProduct = new Product({
                productName,
                details,
                price,
                stock,
                productUploadedBy: userId,
                productImage: savedImage._id
            });
            const savedProduct = await newProduct.save();

            res.status(201).json(savedProduct);
        } catch (error) {
            res.status(500).send(error.message);
        }
    });
};


const getProduct = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        // Fetch the product with the image details populated
        const product = await Product.findById({ _id: productId, status: "Active" }).populate('productImage');

        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.status(200).json({ status: true, product });
    } catch (error) {
        res.status(500).send(error.message);
    }
};


const editProduct = async (req, res) => {
    upload(req, res, async (err) => {
        const { productId } = req.params;
        const { productName, details, price, stock } = req.body;

        if (err instanceof multer.MulterError) {
            return res.status(500).send(err.message);
        } else if (err) {
            return res.status(500).send(err.message);
        }

        try {
            const product = await Product.findById(productId).populate('productImage');

            if (!product) {
                return res.status(404).send('Product not found');
            }

            if (productName) product.productName = productName;
            if (details) product.details = details;
            if (price) product.price = price;
            if (stock) product.stock = stock;

            if (req.file) {
                // If there is an existing image, delete it from storage
                if (product.productImage) {
                    const oldImagePath = product.productImage.mediaUrl;
                    fs.unlink(oldImagePath, err => {
                        if (err) console.log(`Failed to delete old image: ${err}`);
                        else console.log('Old image deleted successfully');
                    });
                }

                // Create and save the new image
                const newImage = new ProductImage({
                    mediaUrl: req.file.path,
                    mediaType: req.file.mimetype
                });
                const savedImage = await newImage.save();
                product.productImage = savedImage._id;
            }

            const updatedProduct = await product.save();
            const currentProduct = await Product.findById(productId).populate('productImage');
            res.status(200).json(currentProduct);
        } catch (error) {
            res.status(500).send(error.message);
        }
    });
};

const deleteProduct = async (req, res) => {
    const { productId } = req.params;
    if (!productId) {
        return res.status(404).send('productId is missing');
    }

    try {
        // Find the product and update its status to 'deleted'
        const updatedProduct = await Product.findByIdAndUpdate(productId, { status: 'Deleted' }, { new: true }).populate('productImage');

        if (!updatedProduct) {
            return res.status(404).send('Product not found');
        }

        res.status(200).json({
            status: true,
            message: 'Product successfully marked as deleted',
            product: updatedProduct
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// get All products
const getAllProduct = async (req, res) => {

    const pageSize = req.body.pageSize || 10;
    const page = req.body.page || 0;
    try {

        // Fetch the product with the image details populated
        const product = await Product.find({ status: "Active" })
            .populate('productImage')
            .sort({ createdAt: -1 })
            .skip(page * pageSize).limit(pageSize);

        const count = await Product.countDocuments({ status: 'Active' });

        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.status(200).json({ status: true, count, product });
    } catch (error) {
        res.status(500).send(error.message);
    }
};


const purchaseProduct = async (req, res) => {
    const { productId, purchasedBy, transactionAmount, cardNo, expiryDate, cvv } = req.body;
    // Check if all required fields are present
    if (!productId || !purchasedBy || !transactionAmount || !cardNo || !expiryDate || !cvv) {
        return res.status(400).json({ error: 'Required fields are missing' });
    }

    try {
        // Check if product exists and is in stock
        const currentProduct = await Product.findOne({ _id: productId });
        if (!currentProduct || currentProduct.stock === 0) {
            return res.status(404).json({ error: 'Product not found or out of stock' });
        }



        // Create transaction record
        const newTransaction = new Transaction({
            productId,
            userId: purchasedBy,
            transactionAmount,
            cardNo,
            expiryDate,
            cvv
        });
        await newTransaction.save();

        // Update User Balance
        const currentUser = await User.findOne({ _id: purchasedBy });
        const currentBalance = currentUser.balance;
        const newBalance = currentBalance - transactionAmount;
        const updatedUser = await User.findOneAndUpdate(
            { _id: purchasedBy },
            { $set: { balance: newBalance } },
            { new: true }
        );

        // Create transaction record for user's balance update
        const newTrans = new Transactions({
            userId: purchasedBy,
            transactionAmount,
            transactionType: "debit",
            note: `Amount debited for purchase product ${currentProduct.productName}`
        });
        await newTrans.save();

        // Update Product Stock
        const newStock = currentProduct.stock - 1;
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: productId },
            { $set: { stock: newStock } },
            { new: true }
        );

        // Update Refer User Balance if exists

        const additionalAmount = transactionAmount * 0.05;

        const referUser = await User.findOneAndUpdate(
            { userId: currentUser.referrPersonId },
            { $inc: { balance: additionalAmount } },
            { new: true }
        );

        const referUserId2 = await User.findOne({ userId: currentUser.referrPersonId });
        const newTrans2 = new Transactions({
            userId: referUserId2._id,
            transactionAmount: additionalAmount,
            transactionType: "credit",
            note: `Amount credited for purchase product ${currentUser.username}`
        });
        await newTrans2.save();

        // Create purchased product record
        const newPurchased = new PurchasedProduct({ productId, purchasedBy });
        const savedPurchased = await newPurchased.save();


        // Return success response
        res.status(201).json({ status: true, PurchasedProduct: savedPurchased });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const getAllPurchases = async (req, res) => {
    const currentUserId = req.userId;
    if (!currentUserId) {
        return res.status(404).json({ error: 'currentUserId not found' })
    }
    const currentUser = await User.findOne({ _id: currentUserId });

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
        const product = await PurchasedProduct.find({ status: "Active" })
            .populate({
                path: 'productId',
                populate: {
                    path: 'productImage'
                }
            })
            .populate('purchasedBy')
            .sort({ createdAt: -1 })
            .skip(page * pageSize).limit(pageSize);
        const count = await PurchasedProduct.countDocuments({ purchasedBy: currentUserId, status: 'Active' });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' })

        }
        res.status(200).json({ status: true, count, product });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getPurchaseByid = async (req, res) => {
    const currentUserId = req.userId;
    if (!currentUserId) {
        return res.status(404).json({ error: 'currentUserId not found' })

    }
    const pageSize = req.body.pageSize || 10;
    const page = req.body.page || 0;


    try {
        // Fetch the product with the image details populated
        const product = await PurchasedProduct.find({ status: "Active" })
            .populate({
                path: 'productId',
                populate: {
                    path: 'productImage'
                }
            })
            .populate('purchasedBy')
            .sort({ createdAt: -1 })
            .skip(page * pageSize).limit(pageSize);
        const count = await PurchasedProduct.countDocuments({ purchasedBy: currentUserId, status: 'Active' });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' })
        }
        res.status(200).json({ status: true, count, product });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

module.exports = { getAllPurchases, getPurchaseByid, purchaseProduct, createProduct, getProduct, editProduct, deleteProduct, getAllProduct };
