const userRouter = require("express").Router();
const middlewareController = require("../../controllers/middlewareController");

const { UserAccount } = require("../../model/userModel");
const { Permission } = require("../../model/userModel");
const userController = require("../../controllers/userController");


const endpoint = '/users'

//Get All USER (auth: ADMIN)
userRouter.get("/", async (req, res) => {

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
    console.log(permission)
    if (permission[0]) {
        userController.getAllUser(req,res);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});


//ADD USER (auth: ADMIN)
userRouter.post("/", async (req, res) => {

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
    console.log(permission)
    if (permission[0]) {
        userController.addUserByAdmin(req,res);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});





//UPDATE USER(auth: ADMIN)
userRouter.put("/:id", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    console.log(userToken)
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

      const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

    console.log(permission)
    if (permission[0]) {
       userController.UpdateUserByID(req,res,req.params.id, userToken.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});


//DELETE USER (auth: ADMIN)
userRouter.delete("/:id", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    console.log(userToken)
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

    const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

     
    console.log(userToken.role)
    console.log(permission)
    if (permission[0]) {
        userController.deleteUserByID(req,res,req.params.id, userToken.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});


module.exports= userRouter;

