const asyncHandler = require("express-async-handler");
const db = require("../dbConnection/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

const memberLogin = asyncHandler(async (req,res) => {
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
            if(results[0].role!="member"){
                res.status(400)
                    .json({message:"Librarian account cannot login into member account."});
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

const libraryBooks = asyncHandler(async(req,res)=>{
    const id = req.params.id;
    db.query('select * from users where userid = ?',[id],async(err,results,fields)=>{
        if(err){
            console.log(err);
            res.status(500).json("Cant retrieve user details.")
        }
        if(results.length>0){
            db.query('select * from books where availableCount>0',(err,results,feilds)=>{
                if(err){
                    console.log(err);
                    res.status(500);
                    throw new Error("Server error while taking books information.");
                }
                res.status(200).json(results);
            })
        }
        else{
            res.status(400).json("Member with given id doesnot exists.")
        }
    })
})

const borrowBook = asyncHandler(async(req,res)=>{
    const id = req.params.id;
    const bookid = req.params.bookid;
    db.query('select userid from users where userid = ?',[id],async(err,results,feilds)=>{
        if(err){
            res.status(500).json("Cannot fetch user details.")
        }
        if(results.length>0){
            db.query('select * from books where bookid = ?',[bookid],
            async(err,results,fields)=>{
                if(err){
                    res.status(500).json("Cannot fetch book details.");
                    return;
                }
                if(results.length>0 && results[0].availableCount>0){
                    const availableCount = results[0].availableCount;
                    db.query('Insert Into userbooks (userid,bookid) values (?,?)',[id,bookid]);
                    res.status(200).json('Success....')
                }
                else{
                    res.status(404).json(`Book with id ${bookid} does not found.`);
                }
            });
        }
        else{
            res.status(404).json(`User with id ${id} does not found.`);
        }
    })
});

const returnBook = asyncHandler(async(req,res)=>{
    const id = req.params.id;
    const bookid = req.params.userid;
    db.query('select * from userbooks where userid = ? and bookid = ?',[id,bookid],async(err,results,feilds)=>{
        if(err){
            res.status(500).json("Cannot fetch user details.")
        }
        if(results.length>0){
            db.query(`delete from userbooks where userid = ? and bookid = ?`,[id,bookid],
            async(err,results,fields)=>{
                if(err){
                    res.status(500).json("Cannot add the book to library try again.")
                }
                db.query('select * from books where bookid = ?',[bookid],
                async(err,results,fields)=>{
                    if(err) res.status(500).json("cannot fetch book details.");
                    db.query('update books set availableCount = ? where bookid = ?',
                    [results[0].availableCount+1,bookid]);
                })
                res.status(200).json("Successfully returned.")
            })
        }
        else{
            res.status(404).json(`Error in book or user details.`);
        }
    })
})

module.exports = {
    memberLogin,
    libraryBooks,
    borrowBook,
    returnBook
};