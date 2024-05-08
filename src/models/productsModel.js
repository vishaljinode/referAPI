const mongoose = require('mongoose')
const productSchema = mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    stock: {
        type: String,
        required: true
    },
    productImage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductImage',
    },
    status: {
        type:String,
        default:"Active"
    },
   productUploadedBy : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
}, { timestamps: true })





const productImageSchema = mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" , index: true},
    mediaUrl: String,
    mediaType: String,
    status: {type:String, default:"Active"},
    createdAt: { type: Date, default: Date.now }
})


const purchasedProductSchema = mongoose.Schema({
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product" , 
        index: true},
    purchasedBy : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    status: {
        type:String,
        default:"Active"
    },
    purchasedDate :{
        type : Date,
        default : Date.now
    }
},{timestamps : true})



module.exports.product = mongoose.model("Product", productSchema);
module.exports.productImage = mongoose.model("ProductImage", productImageSchema);
module.exports.purchasedProduct = mongoose.model("PurchasedProduct",purchasedProductSchema)