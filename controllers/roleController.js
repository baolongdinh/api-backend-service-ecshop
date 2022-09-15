const { Userrole } = require("../model/userModel");
const { AuditLog } = require("../model/auditLogModel");
const helperFunc = require("../controllers/helperFunc")
const errLogger = require("./auditlog/errLogger")

const RoleController = {
  addRole: async (req, res, idUser) => {
    try {
      const Role = await new Userrole({
        name: req.body.name,
        description: req.body.description,
      });
      await Role.save().then(() => {
        const auditLog = new AuditLog();
        auditLog.method = req.method;
        // SAVE OLD ITEM
        var fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
        //CREATE AUDIT LOG
        auditLog.User_ID = idUser;
        auditLog.newItem = Role;
        auditLog.url = fullUrl;
        auditLog.save();

        helperFunc.status(res,true,Role,null)
        
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
  getAllRole: async (req, res) => {
    try {
      const userrole = await Userrole.find();
      if (!userrole) {
        helperFunc.status(res,false,null,"did not found any role");
      } else {
        helperFunc.status(res,true,userrole,null);
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

  getRoleByID: async (req, res, id) => {
    try {
      const userrole = await Userrole.findById(id);
      if (!userrole) {
        helperFunc.status(res,false,null,"did not found any role");
      } else {
        helperFunc.status(res,true,userrole,null);
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


  UpdateRoleByID: async (req, res, id, idUser) => {
    try {
      const role = await Userrole.findById(id);
      const oldRole = await Userrole.findById(id);
      if (!role) {
        return res.status(500).json({
          success: false,
          message: "did not found role",
        });
      }

      if (req.body.name) role.name = req.body.name;
      if (req.body.description) role.description = req.body.description;

      await role.save().then(() => {
        const auditLog = new AuditLog();
        auditLog.method = req.method;
        // SAVE OLD ITEM
        var fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
        //CREATE AUDIT LOG
        auditLog.User_ID = idUser;
        auditLog.oldItem = oldRole;
        auditLog.newItem = role;
        auditLog.url = fullUrl;
        auditLog.save();
      });

      helperFunc.status(res,true,role,"update success")
    } catch (err) {
      errLogger(err,req,res,()=>{
        res.status(402).json({
            "success": false,
            "message": err.message
        });
      })
    }
  },

  deleteRoleByID: async (req, res, id, idUser) => {
    try {
      const role = await Userrole.findById(id);

      if (role) {
        Userrole.findByIdAndDelete(id).then(() => {
          const auditLog = new AuditLog();
          auditLog.method = req.method;
          // SAVE OLD ITEM
          var fullUrl =
            req.protocol + "://" + req.get("host") + req.originalUrl;
          //CREATE AUDIT LOG
          auditLog.User_ID = idUser;
          auditLog.oldItem = role;
          auditLog.url = fullUrl;
          auditLog.save();
        });

        res.status(200).json("DELETE ROLE SUSCESS");
      } else {
        res.status(200).json({
          success: false,
          message: "did not found role",
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
};

module.exports = RoleController;
