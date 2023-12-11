const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");


const validToken = asyncHandler(async(req,res,next)=>{
    let token;
    const access = req.headers.authorization;
    if(access && access.startsWith("Bearer")){
        token = access.split(" ")[1];
        jwt.verify(token,process.env.ACCESS_TOKEN,(err,decoded)=>{
            if(err){
                res.status(401);
                throw new Error("Error in authorization.")
            }
            req.user = decoded.user;
            next();
        })

        if(!token){
            res.status(401);
            throw new Error("Access token is not valid or not provided.")
        }
    }
    else{
        res.status(401);
        throw new Error("Access token is not valid or not provided.")
    }
})

module.exports = validToken;