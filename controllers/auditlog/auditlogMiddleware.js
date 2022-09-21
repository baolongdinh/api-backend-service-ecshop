

const { AuditLog } = require("../../model/auditLogModel")
const { UserAccount, AuthAccount, Userrole } = require("../../model/userModel");
const {Order, OrderItems} = require("../../model/orderModel");

const {Product}  = require("../../model/productModel");
const middlewareController = require("../middlewareController");
function check_end_point_url(url, endpoint){
    if(url.includes(endpoint)){
        return endpoint
    }
    return null
}
const auditLogMiddleware = async (req, res, next) => {

    let userToken = await middlewareController.verifyToken(req, res)

    let method = req.method

    let url = req.url

    let status = res.statusCode
 
    let oldItem

    let newItem 

    let check_method = 0 

    

    if(method == "GET"){
        //do not thing
    }else if(method=="POST"){
         check_method = 1
         newItem = req.body
    }else if(method == "PUT"){
        
        check_method = 1
        let id = req.params.id
        if(check_end_point_url(url, "/users")){
            oldItem = await UserAccount.findById(id).populate("role")
        }else if(check_end_point_url(url, "/products")){
             oldItem = await Product.findById(id)
        }else if(check_end_point_url(url, "/orders")){
             oldItem = await Order.findById(id)
        }else if(check_end_point_url(url, "/orderItems")){
             oldItem = await OrderItems.findById(id)
        }
        newItem = req.body
       
        
    }else if(method=="DELETE"){
        check_method = 1
        let id = req.params.id
        if(check_end_point_url(url, "/users")){
            oldItem = await UserAccount.findById(id).populate("role")
        }else if(check_end_point_url(url, "/products")){
             oldItem = await Product.findById(id)
        }else if(check_end_point_url(url, "/orders")){
             oldItem = await Order.findById(id)
        }else if(check_end_point_url(url, "/orderItems")){
             oldItem = await OrderItems.findById(id)
        }
    }
    

    if(check_method===1){
        const auditLog = await new AuditLog({
              User_ID : userToken.id,
              url : url,
              method : method,
              statusCode : status,
              oldItem : oldItem,
              newItem : newItem
          })
      
          auditLog.save().then(console.log(auditLog))
    }

    next();
}

module.exports = auditLogMiddleware