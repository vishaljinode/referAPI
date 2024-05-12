const express = require('express')
const productRouter = express.Router()
const auth = require('../middleware/auth');
const {upload,purchaseProduct, 
    createProduct,getProduct,
    editProduct,deleteProduct,
    getAllProduct,getPurchaseByid,
    getAllPurchases} = require('../controllers/productController')




productRouter.get('/',(req,res)=>{
    res.send("hello products")
})




productRouter.post('/createproduct',auth,createProduct);
productRouter.get('/getProduct/:productId',auth,getProduct);
productRouter.patch('/editproduct/:productId',auth,editProduct);
productRouter.get('/deleteProduct/:productId',auth,deleteProduct);

productRouter.post('/getallproduct/',auth,getAllProduct);

productRouter.post('/purchaseProduct/',auth,purchaseProduct);
productRouter.post('/getPurchaseByid/',auth,getPurchaseByid);
productRouter.post('/getAllPurchases/',auth,getAllPurchases);

module.exports = productRouter;