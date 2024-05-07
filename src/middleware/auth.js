const jwt=require('jsonwebtoken');
const SECRET_KEY ="myprojectapiforyou";
const mongoose=require('mongoose')

const auth=(req,res,next)=>{
  try {
    let token=req.headers.authorization;
    if(token){
      token=token.split(" ")[1];
      let user=jwt.verify(token,SECRET_KEY);
      // console.log("User ID : ",user.id);
      req.userId = user.id;
    }else{
      return res.status(401).json({message:"Unauthorized User"})
    }
    next();

  } catch (error) {
    console.log(error);
    res.status(401).json({message:"Unauthorized User"})
  }

}

module.exports=auth;