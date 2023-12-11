const db = require("../dbConnection/db");
const asyncHandler = require("express-async-handler");

const newBook = asyncHandler(async(req,res)=>{
    const {title,author} = req.body;
    // const {userid} = req.params;
    db.query('select * from users where userid = ?',[req.params.id],async(err,results,feilds)=>{
        if(err){
            console.log(err);
            res.status(500);
            throw new Error("Error in extracting books information.")
        }
        if(results.length > 0 && results[0].role == 'librarian'){  
            db.query('select * from books where title = ? and author = ?',[title,author],
            async(err,results,fields)=>{
                if(err){
                    console.log(err);
                    res.status(500);
                    throw new Error("Error in extracting books information.")
                }
                console.log(results);
                if(results.length>0){
                    const count = results[0].count + 1;
                    const availableCount = results[0].availableCount + 1;
                    console.log(count + ' ' + availableCount);
                    db.query('update books set count=?,availableCount =? where bookid = ?',
                        [count,availableCount,results[0].bookid]);
                    res.status(200).json({message:"Successful."});
                }
                else{
                    db.query('insert into books (title,author,count,availableCount) values (?,?,?,?)',
                        [title,author,1,1]);
                    res.status(200).json({message:"Successful."});
                }
            });
        }
        else{
            res.status(500).json({message:"Librarian with with given id does not exists."})
        }
    });
});

const removeBook = asyncHandler(async(req,res)=>{
    // const {userid} = req.params;
    db.query('select * from users where userid = ?',[req.params.id],async(err,results,feilds)=>{
        if(err){
            console.log(err);
            res.status(500);
            throw new Error("Error in extracting books information.")
        }
        if(results.length > 0 && results[0].role == 'librarian'){  
            db.query('select * from books where bookid=?',[req.params.bookid],
            async(err,results,fields)=>{
                if(err){
                    console.log(err);
                    res.status(500);
                    throw new Error("Error in extracting books information.")
                }
                console.log(results);
                if(results.length>0 && results[0].availableCount >0){
                    const count = results[0].count - 1;
                    const availableCount = results[0].availableCount - 1;
                    console.log(count + ' ' + availableCount);
                    if(count==0){
                        db.query('delete from books where bookid=?',[req.params.bookid]);
                    }
                    else{
                        db.query('update books set count=?,availableCount =? where bookid = ?',
                            [count,availableCount,results[0].bookid]);
                    }
                    res.status(200).json({message:"Successful."});
                }
                else{
                    res.status(404).json({message:"Books with given Id are not present."});
                }
            });
        }
        else{
            res.status(500).json({message:"Librarian with with given id does not exists."})
        }
    });
})

const getAll = asyncHandler(async(req,res)=>{
    const id = req.params.id;
    console.log(id);
    db.query('select * from users where userid = ?',[id],async(err,results,fields)=>{
        if(err){
            console.log(err)
            res.status(500).json('Cant fetch user details accessing url.');
        }
        if(results.length>0 && results[0].role == 'librarian'){
            db.query('Select * from books',async(err,results,feilds)=>{
                if(err){
                    console.log(err)
                    res.status(500).json('Cant fetch books data.');
                }
                if(results.length > 0){
                    res.status(200).json(results);
                }
                else{
                    res.status.json({message:"No books were present in library."})
                }
            });
        }
        else{
            res.status(404).json(`user with id ${id} doesnot exists with librarian access`);
        }
    });
})

const updateBook = asyncHandler(async(req,res)=>{
    const id = req.params.id;
    const bookid = req.params.bookid;
    console.log(id,bookid);
    db.query('select * from users where userid = ?',[id],async(err,results,fields)=>{
        // console.log("1");
        if(err){
            console.log(err)
            res.status(500).json('Cant fetch user details accessing url.');
        }
        // console.log(results);
        if(results.length>0 && results[0].role == 'librarian'){
            db.query('select * from books where bookid = ?',[bookid],async(err,results,fields)=>{
                if(err){
                    console.log(err);
                    res.status(500).json('cant fetch book details.');
                }
                // console.log(results);
                if(results.length>0){
                    var {title, author} = req.body;
                    if(title == null) title = results[0].title;
                    if(author == null) author = results[0].author;
                    db.query('update books set title = ?,author = ? where bookid = ?',[title,author,bookid],
                    async(err,results,fields)=>{
                        if(err){
                            console.log(err);
                            res.status(500).json('Cannot update the details.')
                        }
                        res.status(200).json("Updated Successfully");
                    })
                }
                else{
                    req.status(404).json(`Books with id ${bookid} is not present.`);
                }
            });
        }
        else{
            res.status(404).json(`user with id ${id} doesnot exists with librarian access`);
        }
    });
})
module.exports = {
    newBook,
    removeBook,
    getAll,
    updateBook
};