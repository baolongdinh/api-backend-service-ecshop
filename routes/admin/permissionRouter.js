const permissionRouter = require("express").Router();
const middlewareController = require("../../controllers/middlewareController");
const { UserAccount } = require("../../model/userModel");
const { Permission } = require("../../model/userModel");
const permissionController = require ( "../../controllers/permissionController");
const { ObjectId } = require("mongodb");



const endpoint = '/permissions'

//Get All PERMISSION (auth: ADMIN)
permissionRouter.get("/", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    console.log(userToken)
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }


    const permission = await Permission.find({ Role_ID : userToken.role._id  , endpoint : endpoint, method : req.method });



    console.log(userToken.role._id);
    console.log(permission)
    if (permission[0]) {
        permissionController.getAllPermission(req,res);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});

//ADD PERMISSION (auth: ADMIN)
permissionRouter.post("/", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    console.log(userToken)
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

    console.log(userToken.role._id);

      const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

    console.log(permission)

    console.log(endpoint)


    if (permission[0]) {
        permissionController.addPermission(req,res, userToken.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});


//UPDATE PERMISSION(auth: ADMIN)
permissionRouter.put("/:id", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    console.log(userToken)
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

      const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

      console.log(userToken.role._id)

      console.log(endpoint)


      const permissionCheck = await Permission.find({ Role_ID : userToken.role._id})

      console.log(permissionCheck)

    console.log(permission[0])
    if (permission[0]) {
        permissionController.UpdatePermissionByID(req,res,req.params.id, userToken.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});


//DELETE PERMISSION (auth: ADMIN)
permissionRouter.delete("/:id", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    console.log(userToken)
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

      const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

    console.log(userToken.role._id);
    console.log(permission)
    if (permission[0]) {
        permissionController.deletePermissionByID(req,res,req.params.id, userToken.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});


module.exports= permissionRouter;

