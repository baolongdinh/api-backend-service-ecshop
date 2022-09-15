const auditLogRouter = require("express").Router();
const middlewareController = require("../../controllers/middlewareController");

const { UserAccount } = require("../../model/userModel");
const { Permission } = require("../../model/userModel");
const userController = require("../../controllers/userController");
const auditlogController = require("../../controllers/auditLogController");
const lokilogs = require("../../controllers/auditlog/lokilogs")
const endpoint = '/auditlog'

//Get All AUDITLOG (auth: ADMIN)
auditLogRouter.get("/", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

    const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });
    console.log(userToken.role._id)
    
    if (permission[0]) {
        auditlogController.GetAllAuditLog(req,res)
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});

module.exports= auditLogRouter;