const { Product } = require("../model/productModel");
const { AuditLog } = require("../model/auditLogModel");
const { uploadAvatar } = require("./helpers");
const helperFunc = require("./helperFunc");
const errLogger = require("./auditlog/errLogger")

const productController = {
  addProduct: async (req, res, idUser) => {
    try {
      uploadAvatar(req, res, async (err) => {
        if (err) {
          console.log(err);
        } else {
          const product = await new Product({
            name: req.body.name,
            price: req.body.price,
            total_quantity: req.body.total_quantity,
            brand: req.body.brand,
            origin: req.body.origin,
            description: req.body.description,
          });

          if (req.file) {
            product.image = `/static/images/avatar/${req.file.filename}`;
          }


          await product.save().then(() => {
            const auditLog = new AuditLog();
            auditLog.method = req.method;
            // SAVE OLD ITEM
            var fullUrl =
              req.protocol + "://" + req.get("host") + req.originalUrl;
            //CREATE AUDIT LOG
            auditLog.User_ID = idUser;
            auditLog.newItem = product;
            auditLog.url = fullUrl;
            auditLog.save();
            helperFunc.status(res, true, product, null);
          });
        }
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
  getAllProduct: async (req, res) => {
    try {

      const page =  parseInt(req.params.page) - 1
      const limit = parseInt(req.params.limit)
      const sort = req.params.sort       //sort: 1 = newest, 2 = oldest, 3 = price up, 4 = price down 
      const skip = page*limit  // skip element to get right page

      
      let product
      
      if(sort == 1){
        product = await Product.find().skip(skip).limit(limit).sort({createAt : 1});
      }else if( sort == 2){
        product = await Product.find().skip(skip).limit(limit).sort({createAt : -1});
      }else if( sort == 3){
        product = await Product.find().skip(skip).limit(limit).sort({price : 1});
      }else if( sort == 4){
        product = await Product.find().skip(skip).limit(limit).sort({price : -1});
      }

      const productCount = await Product.find().count();

      res.status(200).json({
        "success" : true,
        "data" : product,
        "productCount" : productCount
      })

      
    } catch (err) {
      errLogger(err,req,res,()=>{
        res.status(402).json({
            "success": false,
            "message": err.message
        });
      })
    }
  },

  getProductById: async (req, res, id) => {
    try {
      const product = await Product.findById(id);
      helperFunc.status(res, true, product, null);
    } catch (err) {
      errLogger(err,req,res,()=>{
        res.status(402).json({
            "success": false,
            "message": err.message
        });
      })
    }
  },

  GetAllProductsExits: async (req, res) => {
    try {
      const products = await Product.find({ total_quantity: { $gt: 0 } });

      if (products) {
        res.status(200).json(products);
      } else {
        res.status(401).json({
          message: "no product found",
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
  updateProduct: async (req, res, id, idUser) => {
    try {
      uploadAvatar(req, res, async (err) => {
        if (err) {
          console.log(err);
        }
        const product = await Product.findById(id);
        const oldProduct = await Product.findById(id);
        if (!product) {
          return res.status(403).json({
            success: false,
            message: "did not found product",
          });
        }
        if (req.body.name) product.name = req.body.name;
        if (req.body.price) product.price = req.body.price;
        if (req.file) product.image = `/static/images/avatar/${req.file.filename}`;
        if (req.body.brand) product.brand = req.body.brand;
        if (req.body.total_quantity){
          product.total_quantity = req.body.total_quantity;
        }
        if (req.body.origin) product.origin = req.body.origin;
        if (req.body.description) product.description = req.body.description;

        await product.save().then(() => {
          const auditLog = new AuditLog();
          auditLog.method = req.method;
          // SAVE OLD ITEM
          var fullUrl =
            req.protocol + "://" + req.get("host") + req.originalUrl;
          //CREATE AUDIT LOG
          auditLog.User_ID = idUser;
          auditLog.oldItem = oldProduct;
          auditLog.newItem = product;
          auditLog.url = fullUrl;
          auditLog.save();

          console.log("update product successfully");
        });
        helperFunc.status(res,true,product,null)
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
  deleteProduct: async (req, res, id, idUser) => {
    try {
      const product = await Product.findById(id);

      if (product) {
        Product.findByIdAndDelete(id).then(() => {
          const auditLog = new AuditLog();
          auditLog.method = req.method;
          // SAVE OLD ITEM
          var fullUrl =
            req.protocol + "://" + req.get("host") + req.originalUrl;
          //CREATE AUDIT LOG
          auditLog.User_ID = idUser;
          auditLog.oldItem = product;
          auditLog.url = fullUrl;
          auditLog.save();
        });
        res.status(200).json({
          "success": false,
          "message":  "DELETE PRODUCT SUCCESS"
        });
      } else {
        res.status(200).json({
          success: false,
          message: "did not found product",
        });
      }
    } catch (err) {
      errLogger(err,req,res,()=>{
        res.status(402).json({
            success : false,
            message : err.message
        });
      })
    }
  },
};

module.exports = productController;
