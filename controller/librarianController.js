const asyncHandler = require("express-async-handler");
const db = require("../dbConnection/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

const librarianLogin = asyncHandler(async (req,res) => {
    const {username, password} = req.body;
    if(!username || !password){
        res.status(400).json({message:"Fill the mandatory fields."});
    }
    db.query(`select * from users where username = ?`,[username],async(err,results,fields)=>{
        if(err){
            console.log(err);
            res.status(500).json({message:"Internal Server Error."})
            return;
        }
        if(!results){
            res.status(404).json({message:"Username does not exits."});
        }
        else{
            if(results[0].role!="librarian"){
                res.status(400)
                    .json({message:"Member account cannot login into librarian account."});
            }
            else if(await bcrypt.compare(password,results[0].password)){
                const accessToken = jwt.sign({
                    user:{
                        username: results[0].username,
                        email:results[0].email,
                        userid:results[0].userid
                    },
                },process.env.ACCESS_TOKEN,{expiresIn:"15m"})
        
                res.status(200).json({accessToken});
            }
            else{
                res.status(401);
                throw new Error("Email or Password is invalid. Re-enter Correctly.")
            }
        }
    });
    // const 
});

const getAllMembers = asyncHandler(async(req,res)=>{
    const id = req.params.id;
    console.log(id);
    db.query('select * from users where userid = ?',[id],async(err,results,fields)=>{
        if(err){
            console.log(err)
            res.status(500).json('Cant fetch user details accessing url.');
        }
        if(results.length>0 && results[0].role == 'librarian'){
            db.query('Select * from users where role = ?',['member'],async(err,results,feilds)=>{
                if(err){
                    console.log(err)
                    res.status(500).json('Cant fetch books data.');
                }
                if(results.length > 0){
                    res.status(200).json(results);
                }
                else{
                    res.status.json({message:"No members were present in library."})
                }
            });
        }
        else{
            res.status(404).json(`user with id ${id} doesnot exists with librarian access`);
        }
    });
})

const addMember = asyncHandler(async(req,res)=>{
    const {name,username,email,password} = req.body;
    const role = "member";
    if(!name || !username || !email || !password){
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
});

const removeMember = asyncHandler(async(req,res)=>{
    // const {userid} = req.params;
    db.query('select * from users where userid = ?',[req.params.id],
    async(err,results,feilds)=>{
        if(err){
            console.log(err);
            res.status(500);
            throw new Error("Error in extracting librarian information.")
        }
        if(results.length > 0 && results[0].role == 'librarian'){  
            db.query('select * from users where userid=?',[req.params.userid],
            async(err,results,fields)=>{
                if(err){
                    console.log(err);
                    res.status(500);
                    throw new Error("Error in extracting member information.")
                }
                if(results.length>0){
                    db.query('delete from users where userid=?',[req.params.userid]);
                    res.status(200).json({message:"Successful."});
                }
                else{
                    res.status(404).json({message:"Member with given Id are not present."});
                }
            });
        }
        else{
            res.status(500).json({message:"Librarian with with given id does not exists."})
        }
    });
})

const updateMember = asyncHandler(async(req,res)=>{
    const id = req.params.id;
    const userid = req.params.userid;
    console.log(id,userid);
    db.query('select * from users where userid = ?',[id],async(err,results,fields)=>{
        // console.log("1");
        if(err){
            console.log(err)
            res.status(500).json('Cant fetch user details accessing url.');
        }
        // console.log(results);
        if(results.length>0 && results[0].role == 'librarian'){
            db.query('select * from users where userid = ?',[userid],async(err,results,fields)=>{
                if(err){
                    console.log(err);
                    res.status(500).json('cant fetch user details.');
                }
                // console.log(results);
                if(results.length>0 && results[0].role != 'librarian'){
                    var {name, username, email, password} = req.body;
                    if(name == null) name = results[0].name;
                    if(username == null) username = results[0].username;
                    else{
                        db.query('select * from users where username = ?',[username],
                        async(err,results,fields)=>{
                            if(err){
                                res.status(500).json({message:"Server error."})
                            }
                            if(results.length>0){
                                res.status(400).json({message:"Username already exists."});
                            }
                        })
                    }
                    console.log("done 1");
                    // console.log(username);
                    if(email == null) email = results[0].email;
                    else{
                        db.query('select * from users where email = ?',[email],
                        async(err,results,fields)=>{
                            if(err){
                                res.status(500).json({message:"Server error."})
                            }
                            if(results.length>0){
                                res.status(400).json({message:"Email already exists."});
                            }
                        })
                    }
                    console.log("done 3");
                    // console.log(username);
                    if(password == null) password = results[0].password;
                    else{
                        password = await bcrypt.hash(password,10);
                    }
                    console.log("done 2");
                    db.query("update users set name = ?,username=? , email = ?, password =? where userid = ?",
                    [name,username,email,password,userid],
                    async(err,results,fields) => {
                        if(err){
                            res.status(500).json("Internal Error.")
                        }
                        else{
                            res.status(200).json("Updated Successfully");
                        }
                    });
                }
                else{
                    res.status(404).json(`Member with id ${userid} is not present.`);
                }
            });
        }
        else{
            res.status(404).json(`user with id ${id} doesnot exists with librarian access`);
        }
    });
})
module.exports = {
    librarianLogin,
    getAllMembers,
    addMember,
    removeMember,
    updateMember
};