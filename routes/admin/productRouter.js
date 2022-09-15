const productRouter = require("express").Router();
const middlewareController = require("../../controllers/middlewareController");

const { UserAccount } = require("../../model/userModel");
const {  Permission } = require("../../model/userModel");
const productController = require ( "../../controllers/productController")
const lokilogs = require("../../controllers/auditlog/lokilogs")

const endpoint = '/products'

//Get All Product (auth: ADMIN)
productRouter.get("/:page/:limit/:sort", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

      const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

    
    if (permission[0]) {
        productController.getAllProduct(req,res);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});

//Get Product by ID (auth: ADMIN)
productRouter.get("/:id", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

      const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

    
    if (permission[0]) {
        productController.getProductById(req,res,req.params.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});


//ADD Product (auth: ADMIN)
productRouter.post("/", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

      const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

    
    if (permission[0]) {
        productController.addProduct(req,res, userToken.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});

//UPDATE Product (auth: ADMIN)
productRouter.put("/:id", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

      const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

    
    if (permission[0]) {
        productController.updateProduct(req,res,req.params.id, userToken.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});


//DELETE Product (auth: ADMIN)
productRouter.delete("/:id", async (req, res) => {

    const userToken = await middlewareController.verifyToken(req, res)
    
    if (!userToken) {
        return res.status(401).json({
            "success": false,
            "message": "authentication fail"
        });
    }

      const permission = await Permission.find({ Role_ID : userToken.role._id, endpoint : endpoint, method : req.method });

    
    if (permission[0]) {
        productController.deleteProduct(req,res,req.params.id, userToken.id);
    } else {
        res.status(403).json({
            "success": false,
            "message": "permission deny"
        })
    }
});



module.exports= productRouter;

