
const { Order, OrderItems } = require("../model/orderModel");
const { Product } = require("../model/productModel");
const {AuditLog} = require("../model/auditLogModel")
const errLogger = require("./auditlog/errLogger")

const userActionController = {

    clickBuyProduct: async (req, res, UserID, ProductID) => {
        try {

            const order = await Order.findOne({ User_ID: UserID, status: 0 })     //status order : 0 - Don hang van chua thanh toan (con trong gio hang)  1 - Don hang da thanh toan nhung chua duoc xac nhan  2 - Don hang da duoc xac nhan         

            console.log("order" + order);

            if (order) {   // Check if order exist in cart then add orderitem to order 

                const orderItems = await OrderItems.findOne({ Order_ID: order._id, Product_ID: ProductID });


                console.log("orderItems" + orderItems)

                const product = await Product.findById(ProductID); // get product => price
                if (orderItems) { // check if orderItem exist in order and have same product id then just plus quantity in orderItem
                    orderItems.quantity = orderItems.quantity + 1
                    orderItems.save();

                    order.totalPrice = order.totalPrice + product.price; // update order price 
                    order.save();
                } else {
                    const orderItem = new OrderItems({
                        Order_ID: order.id,
                        Product_ID: ProductID,
                        quantity: 1
                    })
                    orderItem.save();

                    order.totalPrice = order.totalPrice + product.price; // update order price 
                    order.save();
                }
            } else {
                const newOrder = new Order({
                    User_ID: UserID,
                    status: 0,
                    totalPrice: 0,
                })

                await newOrder.save();

                const newOrderItem = new OrderItems({
                    Order_ID: newOrder._id,
                    Product_ID: ProductID,
                    quantity: 1
                })
                newOrderItem.save();
            }

            res.status(200).json({
                "message": "ADD PRODUCT TO CART SUCCESS, PLS CHECK YOUR CART"
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

    Cart: async (req, res, UserID) => {
        try {

            const order = await Order.findOne({ User_ID: UserID, status: 0 })     //status order : 0 - Don hang van chua thanh toan (con trong gio hang)  1 - Don hang da thanh toan nhung chua duoc xac nhan  2 - Don hang da duoc xac nhan         
            if (order) {   // Check if order exist in cart then add orderitem to order 

                const orderItems = await OrderItems.findOne({ Order_ID: order._id }).populate('Order_ID').populate('Product_ID');
                // Get all orderItems in order 

                if (orderItems) {
                    res.status(200).json(orderItems);
                } else {
                    res.status(200).json({
                        "message": "there are no product in your cart"
                    })
                }

            } else {
                res.status(200).json({
                    "message": "there are no product in your cart"
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

    DeleteProductInCart: async (req, res, OrderItems_ID) => {
        try {

            if (await OrderItems.findByIdAndDelete(OrderItems_ID)) {
                res.status(200).json({
                    "message": "DELETE ORDER ITEMS SUSSCESS"
                })
            } else {
                res.status(200).json({
                    "message": "there are no product in your cart"
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


    PaymentOrder: async (req, res, User_ID) => {
        try {

            const order = await Order.findOne({ User_ID: User_ID, status: 0 })     //status order : 0 - Don hang van chua thanh toan (con trong gio hang)  1 - Don hang da thanh toan nhung chua duoc xac nhan  2 - Don hang da duoc xac nhan         
            if (order) {

                const orderItems = await OrderItems.find({ Order_ID: order._id });  // get order items to check null and minus quantity product after user payment

                if (orderItems) {
                    order.status = 1 // set status to 1   
                    order.save();

                    console.log(orderItems[0]);
                    for(let item in orderItems){
                        const product = await Product.findById( orderItems[item].Product_ID ) 

                        console.log("*item*" + orderItems[item].Product_ID)

                        console.log(product)

                        product.total_quantity = product.total_quantity - orderItems[item].quantity;
                        product.save();
                    }


                    res.status(200).json({
                        "message": "payment order success"
                    })

                } else {
                    res.status(200).json({
                        "message": "there are no product in your cart"
                    })
                }

            } else {
                res.status(200).json({
                    "message": "there are no product in your cart"
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
}

module.exports = userActionController;