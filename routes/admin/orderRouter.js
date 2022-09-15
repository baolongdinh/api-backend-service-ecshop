const orderRouter = require("express").Router();
const middlewareController = require("../../controllers/middlewareController");

const { UserAccount } = require("../../model/userModel");
const {  Permission } = require("../../model/userModel");
const orderController = require ( "../../controllers/orderController")
const lokilogs = require("../../controllers/auditlog/lokilogs")

const endpoint = '/orders'

//Get All ORDER (auth: ADMIN)
orderRouter.get("/:page/:limit/:sort", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

     const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

    
    if (permission[0]) {
       orderController.getAllOrder(req,res);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});

//ADD ORDER (auth: ADMIN)
orderRouter.post("/", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

      const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

    
    if (permission[0]) {
        orderController.addOrder(req,res, userToken.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});


//UPDATE ORDER (auth: ADMIN)
orderRouter.put("/:id", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

      const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

    
    if (permission[0]) {
        orderController.UpdateOrder(req,res,req.params.id, userToken.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});


//DELETE Product (auth: ADMIN)
orderRouter.delete("/:id", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

      const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

    
    if (permission[0]) {
        orderController.deleteOrder(req,res,req.params.id, userToken.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});


module.exports= orderRouter;

