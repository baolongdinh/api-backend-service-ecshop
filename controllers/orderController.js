const { Order } = require("../model/orderModel");
const helperFunc = require("./helperFunc");
const errLogger = require("./auditlog/errLogger")

const orderController = {
  getAllOrder_User: async (req, res, id) => {
    try {
      try {
        const order = await Order.findOne({
          User_ID: id,
          status: [1, 2],
        }).populate("User_ID");
        res.status(200).json(order);
      } catch (err) {
        res.status(400).json(err.message);
        lokilogs.error({message : err.message, labels: {'dateTime' : new Date(), 'method': req.method, 'endpoint': '/users' } })
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

  getAllOrder: async (req, res) => {
    try {
      try {
        const page = parseInt(req.params.page) - 1;
        const limit = parseInt(req.params.limit);
        const sort = req.params.sort;

        const skip = page * limit; // skip element to get right page

        let order
        
        if (sort == 1) {
        order = await Order.find()
            .populate("User_ID")
            .skip(skip)
            .limit(limit)
            .sort({ createAt: 1 });
        } else if (sort == 2) {
            order = await Order.find()
            .populate("User_ID")
            .skip(skip)
            .limit(limit)
            .sort({ createAt: -1 });
        }

        const orderCount = await Order.find().count();

        res.status(200).json({
          success: true,
          data: order,
          orderCount: orderCount,
        });
      } catch (err) {
        errLogger(err,req,res,()=>{
          res.status(402).json({
              "success": false,
              "message": err.message
          });
        })
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

  addOrder: async (req, res, idUser) => {
    try {
      const order = await new Order({
        User_ID: req.body.User_ID,
        status: req.body.status,
        created: req.body.created,
      });
      await order.save();
      res.status(200).json(order);
    } catch (err) {
      errLogger(err,req,res,()=>{
        res.status(402).json({
            "success": false,
            "message": err.message
        });
      })
    }
  },
  UpdateOrder: async (req, res, id, idUser) => {
    try {
      const order = await Order.findById(id);

      if (!order) {
        return res.status(500).json({
          success: false,
          message: "did not found order",
        });
      }

      order.User_ID = req.body.User_ID;
      order.status = req.body.status;
      order.created = req.body.created;
      order.totalPrice = req.body.totalPrice;
      await order.save();
      res.status(200).json(order);
    } catch (err) {
      errLogger(err,req,res,()=>{
        res.status(402).json({
            "success": false,
            "message": err.message
        });
      })
    }
  },
  deleteOrder: async (req, res, id, idUser) => {
    try {
      if (await Order.findByIdAndDelete(id)) {
        res.status(200).json("DELETE ORDER SUSCESS");
      } else {
        res.status(200).json({
          success: false,
          message: "did not found order",
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

module.exports = orderController;
