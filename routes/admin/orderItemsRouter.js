const orderItemsRouter = require("express").Router();
const middlewareController = require("../../controllers/middlewareController");

const { UserAccount } = require("../../model/userModel");
const {  Permission } = require("../../model/userModel");
const orderController = require ( "../../controllers/orderController")
const orderItemsController = require ( "../../controllers/orderItemsController")
const lokilogs = require("../../controllers/auditlog/lokilogs")
const endpoint = '/orderItems'

//Get All ORDER ITEMS BY ORDER ID (auth: ADMIN)
orderItemsRouter.get("/:id", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }


     const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

    
    if (permission[0]) {
        orderItemsController.getOrderItems_ByOrderID(req,res,req.params.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});

//Get All ORDER ITEMS 
orderItemsRouter.get("/", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }


     const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

    
    if (permission[0]) {
        orderItemsController.getAllOrderItems(req,res);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});



//ADD ORDER ITEM (auth: ADMIN)
orderItemsRouter.post("/", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

      const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

    
    if (permission[0]) {
       orderItemsController.addOrderItems(req,res, userToken.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});

//UPDATE ORDER ITEM (auth: ADMIN)
orderItemsRouter.put("/:id", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

      const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

    
    if (permission[0]) {
        orderItemsController.UpdateOrderItemsByID(req,res,req.params.id, userToken.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});

//UPDATE ORDER ITEM BY ORDERID (auth: ADMIN)
orderItemsRouter.post("/updateOrder", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

      const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

    
    if (permission[0]) {
        orderItemsController.UpdateOrderItemsByOrderID(req,res,req.params.id, userToken.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});


//DELETE Product (auth: ADMIN)
orderItemsRouter.delete("/:id", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

      const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

    
    if (permission[0]) {
        orderItemsController.DeleteOrderItemsByID(req,res,req.params.id, userToken.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});


module.exports= orderItemsRouter;

