const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const db = require("./dbConnection/db");
const errorHandlers = require("./errorHandlers/errorHandler");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use('/member',require('./routes/memberRoutes'));
app.use('/librarian',require('./routes/librarianRoutes'));
app.use('/',require('./routes/registerRoute'));
app.use(errorHandlers);



app.listen(PORT, ()=> {
    console.log(`Server is listening from the port ${PORT}`);
}); 