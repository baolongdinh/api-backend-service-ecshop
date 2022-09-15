const { AuditLog } = require("../model/auditLogModel")
const errLogger = require("./auditlog/errLogger")

const auditLogController = {
    GetAllAuditLog : async(req,res) =>{
       
        try {
            const auditlog = await AuditLog.find().populate('User_ID')
            res.status(200).json(auditlog);
        } catch (err) {
            errLogger(err,req,res,()=>{
                res.status(402).json({
                    "success": false,
                    "message": err.message
                });
              })

        }
    }
}

module.exports = auditLogController;