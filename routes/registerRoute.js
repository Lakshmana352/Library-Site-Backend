const express = require("express");
const asyncHandler = require("express-async-handler")
const db = require("../dbConnection/db")
const bcrypt = require("bcrypt");

const router = express.Router();

router.route('/register').post(asyncHandler(async(req,res)=>{
    const {name,username,email,password,role} = req.body;
    if(!name || !username || !email || !password || !role){
        res.status(400).json({message:"Fill all the neccessary fields."})
    }
    db.query(`select * from users where username = ? or email = ?`,[username,email],async (err,results,fields)=>{
        if (err) {
            console.error(err);
            res.status(500).json({ message: "Internal Server Error" });
            return;
        }
    
        if (results.length > 0) {
            console.log(results);
            res.status(400).json({ message: "Username or Email already exists." });
            return;
        } 
        else{
            const hashedPw = await bcrypt.hash(password,10);
            db.query(`insert into users (name,username,email,password,role) values (?,?,?,?,?)`,[name,username,email,hashedPw,role],(err,results,fields)=>{
                if(err){
                    console.error(err);
                    res.status(500).json({ message: "Internal Server Error" });
                    return;
                }
                res.status(200).json({ message: "User successfully created"});
            })
        }
    });
}))

module.exports = router;