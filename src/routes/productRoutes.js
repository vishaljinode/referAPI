const express = require('express')
const productRouter = express.Router()
const auth = require('../middleware/auth');
const {upload, createProduct,getProduct,editProduct,deleteProduct} = require('../controllers/productController')




productRouter.get('/',(req,res)=>{
    res.send("hello products")
})




productRouter.post('/createproduct',auth,createProduct);
productRouter.get('/getProduct/:productId',auth,getProduct);
productRouter.patch('/editproduct/:productId',auth,editProduct);
productRouter.get('/deleteProduct/:productId',auth,deleteProduct);

module.exports = productRouter;