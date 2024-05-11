const multer = require('multer');
const ProductModel = require('../models/productsModel');
const path = require('path');
const fs = require('fs');

const Product = ProductModel.product;
const ProductImage = ProductModel.productImage;

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadPath = path.resolve(__dirname, '../uploads/');  // Absolute path
        cb(null, uploadPath);
    },
    filename: function(req, file, cb) {
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
                productUploadedBy : userId,
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
        const product = await Product.findById({_id : productId, status: "Active"}).populate('productImage');

        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.status(200).json({status: true,product});
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
        const product = await Product.find({status: "Active"})
        .populate('productImage')
        .skip(page*pageSize).limit(pageSize);

        const count = await Product.countDocuments({ status: 'Active' });

        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.status(200).json({status : true, count,product});
    } catch (error) {
        res.status(500).send(error.message);
    }
};
module.exports = { createProduct ,getProduct,editProduct,deleteProduct,getAllProduct };
