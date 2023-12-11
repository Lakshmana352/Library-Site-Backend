const constants = require("../constants");

const errorHandlers = (err,req,res,next) => {
    const statusCode = res.statusCode ? res.statusCode: 500;
    switch (statusCode) {
        case constants.VALIDATION_ERROR:
            res.json({
                title:"Validation_error",
                message:err.message,
                stackTrace:err.stack
            })
            break;
        case constants.UNAUTHPRIZED:
            res.json({
                title:"Validation_error",
                message:err.message,
                stackTrace:err.stack
            })
            break;
        case constants.FORBIDDEN:
            res.json({
                title:"Forbidden",
                message:err.message,
                stackTrace:err.stack
            })
            break;
        case constants.NOT_FOUND:
            res.json({
                title:"Not Found",
                message:err.message,
                stackTrace:err.stack
            })
            break;
        case constants.SERVER_ERROR:
            res.json({
                title:"Server_error",
                message:err.message,
                stackTrace:err.stack
            })
            break;
        default:
            console.log("Successful.");
            res.json({
                title:statusCode,
                message:err.message,
                stackTrace:err.stack
            })
            break;
    }
}

module.exports = errorHandlers;