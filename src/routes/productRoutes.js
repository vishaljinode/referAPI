const express = require('express')
const productRouter = express.Router()
const auth = require('../middleware/auth');
const {upload,purchaseProduct, createProduct,getProduct,editProduct,deleteProduct,getAllProduct} = require('../controllers/productController')




productRouter.get('/',(req,res)=>{
    res.send("hello products")
})




productRouter.post('/createproduct',auth,createProduct);
productRouter.get('/getProduct/:productId',auth,getProduct);
productRouter.patch('/editproduct/:productId',auth,editProduct);
productRouter.get('/deleteProduct/:productId',auth,deleteProduct);

productRouter.post('/getallproduct/',auth,getAllProduct);

productRouter.post('/purchaseProduct/',auth,purchaseProduct);

module.exports = productRouter;