const express = require("express");
const {memberLogin,libraryBooks, borrowBook, returnBook} = require("../controller/memberController");
const validToken = require("../errorHandlers/validationHandler")

const router = express.Router();

router.route('/login').post(memberLogin);
router.get('/:id/avaibooks',validToken,libraryBooks);
router.post('/:id/:bookid/borrowbook',validToken,borrowBook);
router.delete('/:id/:bookid/returnbook',validToken,returnBook);

module.exports = router;