const express = require("express");
const {librarianLogin, getAllMembers, addMember, removeMember, updateMember} = require("../controller/librarianController")
const validToken = require("../errorHandlers/validationHandler");
const { newBook, removeBook, getAll ,updateBook} = require("../controller/booksController");

const router = express.Router();


router.route('/login').post(librarianLogin);
router.post('/:id/addbook',validToken,newBook);
router.delete('/:id/:bookid/deletebook',validToken,removeBook); 
router.get("/:id/books",validToken,getAll)
router.put("/:id/:bookid/updatebook",validToken,updateBook);
router.get("/:id/members",validToken,getAllMembers);
router.post("/:id/addmember",validToken,addMember);
router.delete("/:id/:userid/delmember",validToken,removeMember);
router.put("/:id/:userid/updatemember",validToken,updateMember)
// router.get('/books',validToken,libraryBooks);

module.exports = router;