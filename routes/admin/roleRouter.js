const roleRouter = require("express").Router();
const middlewareController = require("../../controllers/middlewareController");
const { UserAccount } = require("../../model/userModel");
const { Permission } = require("../../model/userModel");
const roleController = require ( "../../controllers/roleController");
const lokilogs = require("../../controllers/auditlog/lokilogs")


const endpoint = '/roles'

//Get All ROLE (auth: ADMIN)
roleRouter.get("/" ,  async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

      const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

   

    if (permission[0]) {
        roleController.getAllRole(req,res);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});


//Get ROLE BY ID(auth: ADMIN)
roleRouter.get("/:id" ,  async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

      const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

   

    if (permission[0]) {
        roleController.getRoleByID(req,res,req.params.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});

//ADD ROLE (auth: ADMIN)
roleRouter.post("/", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }


     const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });
     console.log("****" + permission)
    console.log(permission[0])
    if (permission[0]) {
        roleController.addRole(req,res, userToken.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});


//UPDATE ROLE(auth: ADMIN)
roleRouter.put("/:id", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

      const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

    
    if (permission[0]) {
        roleController.UpdateRoleByID(req,res, req.params.id, userToken.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});


//DELETE ROLE (auth: ADMIN)
roleRouter.delete("/:id", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

      const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

    
    if (permission[0]) {
        roleController.deleteRoleByID(req, res,req.params.id, userToken.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});


module.exports= roleRouter;

