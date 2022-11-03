const { UserAccount} = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const EmailSender = require("../controllers/email/emailSender");
const {AuditLog} = require("../model/auditLogModel")
const helperFunc = require("./helperFunc")
const errLogger = require("./auditlog/errLogger")



function isImage(url) {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
}

function validateURL(link) {
    if (link.indexOf("http://") == 0 || link.indexOf("https://") == 0) {
        return true;
    }
    else {
        return false;
    }
}

function checkPass(req){
    if (req.body.password !== req.body.rePassword) {
        return false;
    }
    return true;
}

const userAuthController = { 
    loginUser: async (req, res) => {
        try {
            const user = await UserAccount.findOne({ email: req.body.email }).populate("role");
            
            if (!user) {
                
                helperFunc.status_error(res,'did not found any user')

            } else {
                const checkPass = await bcrypt.compare(req.body.password, user.password);
                console.log("passCheck", checkPass)
                if (!checkPass) {

                    helperFunc.status_error(res, 'user or password does not match')
                } else {
                    if (!user.active) {

                        helperFunc.status_error(res, 'your account does not activate or got blocked')
                       
                    } else {

                        //Tao Token
                        const tokenAccess = jwt.sign({
                            id: user._id,
                            role: user.role
                        }, process.env.JWT_ACCESS_KEY, {
                            expiresIn: "365d"
                        });

                        const { password, ...others } = user._doc;

                        console.log(user)

                        res.status(200).json({
                            "success" : true,
                            "data" : {...others},
                            "userToken" : tokenAccess
                        })

                    }
                }
            }

        } catch (err) {

            errLogger(err,req,res,()=>{
                res.status(400).json({
                    "success": false,
                    "message": err.message
                });
              })

           
            

        }
    },


    forgotPassword: async (req, res) => {
        try {
            const user = await UserAccount.findOne({ "email": req.body.email });
            if (!user) {
                return res.render("forgotPassword", {
                    mess: "Invalid Email"
                })
            } else {
                console.log("userID: " + user._id);

                const tokenActivate = jwt.sign({
                    id: user._id
                }, process.env.JWT_ACCESS_KEY, {
                    expiresIn: "30m"
                });

                fullTokenActivate = "Bearer " + tokenActivate;

                const URL = "http://localhost:8000/api/verify/reset-password/" + fullTokenActivate;
                console.log('URL', URL)
                const content = `Click <a href = "${URL}" > here  </a> to reset your password`;

                await EmailSender(res, req.body.email, "Reset your password", content);
                res.render("forgotPasswordV1");

            }
        } catch (err) {
            
            errLogger(err,req,res,()=>{
                res.status(400).json({
                    "success": false,
                    "message": err.message
                });
              })


        }
    },




    resetPassword: async (req, res, id) => {
        try {
            const user = await UserAccount.findById(id);

            if (!user) {
                return res.status(403).json({
                    "success": false,
                    "message": "Invalid token"
                })
            } else {

                if (!req.body.NewPassword || !req.body.reNewPassword) {
                    return res.status(403).json({
                        "success": false,
                        "message": "you need to fill in require text box"
                    })
                }

                if (req.body.NewPassword == req.body.reNewPassword) {
                    const salt = await bcrypt.genSalt(10);
                    const newPassword = await bcrypt.hash(req.body.NewPassword, salt);
                    user.password = newPassword;
                    await user.save();
                    res.render("resetPasswordCompleted");
                } else {
                    return res.status(403).json({
                        "success": false,
                        "message": "New Password and Comfirm Password does not match"
                    })
                }
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

module.exports = userAuthController;

