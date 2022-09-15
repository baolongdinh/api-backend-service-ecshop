const { Permission } = require("../model/userModel");
const {AuditLog} = require("../model/auditLogModel");
const helperFunc = require("./helperFunc");
const { findById } = require("../model/tokenModel");
const errLogger = require("./auditlog/errLogger")

const permissionController = {

    addPermission: async (req, res, idUser) => {
        try {
            const permission = await new Permission({
                Role_ID: req.body.Role_ID,
                endpoint: req.body.endpoint,
                method: req.body.method
            });
             //CREATE AUDIT LOG
            const auditLog = new AuditLog(); 
            
             // SAVE OLD ITEM
             var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
             auditLog.User_ID = idUser
             auditLog.newItem = permission
             auditLog.url = fullUrl
             auditLog.method = req.method
 
            await permission.save().then(auditLog.save());
            res.status(200).json(permission);
        } catch (err) {
            errLogger(err,req,res,()=>{
                res.status(402).json({
                    "success": false,
                    "message": err.message
                });
              })
        }
    },




    UpdatePermissionByID: async (req, res, id, idUser) => {
        try {
            const permission = await Permission.findById(id);
            if (!permission) {
                return res.status(500).json({
                    "success": false,
                    "message": "did not found permission"
                });
            }

            //CREATE AUDIT LOG
           const auditLog = new AuditLog();
            auditLog.method = req.method
            const oldPermission = await Permission.findById(id);
            console.log("#old"+oldPermission)
            // SAVE OLD ITEM
            var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            auditLog.User_ID = idUser
            auditLog.oldItem = oldPermission
            auditLog.url = fullUrl

            if(req.body.Role_ID){
            permission.Role_ID = req.body.Role_ID
            }
            if(req.body.endpoint){
            permission.endpoint = req.body.endpoint
            }
            if(req.body.method){
            permission.method = req.body.method
            }

            await permission.save().then(()=> {

                auditLog.newItem = permission
                auditLog.save();
                console.log(auditLog);

            })




            res.status(500).json({
                "success": true,
                "data": permission
            });
        } catch (err) {
            errLogger(err,req,res,()=>{
                res.status(402).json({
                    "success": false,
                    "message": err.message
                });
              })
        }
    },
    getAllPermission: async (req, res) => {
        try {
            const permission = await Permission.find();
            if (!permission) {
                return res.status(500).json({
                    "success": false,
                    "message": "did not found role"
                });
            }

            // Update InforUserID for user
            res.status(200).json({
                "success": true,
                "data": permission
            });
        } catch (err) {
            errLogger(err,req,res,()=>{
                res.status(402).json({
                    "success": false,
                    "message": err.message
                });
              })

        }
    },
    deletePermissionByID: async (req,res, id, idUser) => {
        try {

            const permission = await Permission.findById(id);
              //CREATE AUDIT LOG
             const auditLog = new AuditLog();
              auditLog.method = req.method
              const oldPermission = await Permission.findById(id);
              console.log("#old"+oldPermission)
              
                  
            if (permission) {
                 // SAVE OLD ITEM
                var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
                auditLog.User_ID = idUser
                auditLog.oldItem = permission
                auditLog.url = fullUrl
                Permission.findByIdAndDelete(id).then(()=>{
                    auditLog.save();
                    console.log(auditLog)
                }) 
                res.status(200).json("DELETE PERMISSION SUSCESS");
            } else {
                res.status(200).json({
                    "success": false,
                    "message": "did not found permission"
                });
            }
        } catch (err) {
            errLogger(err,req,res,()=>{
                res.status(402).json({
                    "success": false,
                    "message": err.message
                });
              })

        }
    },

    deletePermissionInRoleByID: async (req, res, idUser) => {
        try {
            
            const permission_del = req.body.data_del
            const permission_add = req.body.data_add
           
            console.log("body", req.body)
        
            for(let i = 0; i < permission_del.length; i++){
                const check_per = await Permission.findById(permission_del[i]._id)
                if(check_per){
                    
                    Permission.findByIdAndDelete(permission_del[i]._id).then(console.log(`delete success`))
                }
            }


            for(let i = 0; i < permission_add.length; i++){ 
                
                const permission = new Permission();
                permission.endpoint = permission_add[i].endpoint
                permission.method = permission_add[i].method
                permission.Role_ID = req.body.id_role
                

                permission.save().then(()=>{
                    console.log("update permission ", permission)
                
                })
            }
            
          helperFunc.status(res,true,null,"update successfully")


        } catch (err) {
            errLogger(err,req,res,()=>{
                res.status(402).json({
                    "success": false,
                    "message": err.message
                });
              })

        }
    },
    getPermissionByRoleID: async (req, res, id) => {
        try {
            const permission = await Permission.find({ Role_ID: id });
            if (!permission) {
                return res.status(500).json({
                    "success": false,
                    "message": "did not found permission"
                });
            }

            helperFunc.status(res,true,permission,null)
        } catch (err) {
            errLogger(err,req,res,()=>{
                res.status(402).json({
                    "success": false,
                    "message": err.message
                });
              })

        }
    },



};

module.exports = permissionController;