const { UserAccount, AuthAccount, Userrole } = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const e = require("express");

const EmailSender = require("../controllers/email/emailSender");
const middlewareController = require("./middlewareController");
const fs = require("fs");

const { uploadAvatar } = require("./helpers");
const errLogger = require("./auditlog/errLogger")
const { AuditLog } = require("../model/auditLogModel");
const helperFunc = require("./helperFunc");
const messageQueue = require("../services/messagingQueue")

function isImage(url) {
  return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
}

function validateURL(link) {
  if (link.indexOf("http://") == 0 || link.indexOf("https://") == 0) {
    return true;
  } else {
    return false;
  }
}

function checkPass(req) {
  if (req.body.password !== req.body.rePassword) {
    return false;
  }
  return true;
}



const userController = {
  getAllUser: async (req, res) => {
    try {
    
      const page =  parseInt(req.params.page) - 1
      const limit = parseInt(req.params.limit)
      const sort = req.params.sort


      const skip = page*limit  // skip element to get right page
    
      let user
      
      if(sort == 1){
        user = await UserAccount.find().populate("role").skip(skip).limit(limit).sort({createAt : -1});
      }else if(sort == 2){ 
        user = await UserAccount.find().populate("role").skip(skip).limit(limit).sort({createAt :  1});
      }
      
      const userCount = await UserAccount.find().count();
    

      res.status(200).json({
        "success" : true,
        "data" : user,
        "userCount" : userCount
      })

    } catch (err) {
      errLogger(err,req,res,()=>{
        res.status(401).json({
          success: false,
          message: err.message,
        });
      })

    }
  },

  getUserById: async (req, res, id) => {
    try {
      const user = await UserAccount.findById(id).populate("role");

      const { password, ...others } = user._doc;
      res.status(200).json({
        success: true,
        data: { ...others },
      });

      
    } catch (err) {

      errLogger(err,req,res,()=>{
        res.status(500).json({
          success: false,
          message: "did not found any user",
        });
      })

      
    }
  },

  deleteUserByID: async (req, res, id) => {
    try {
      
      const user = await UserAccount.findById(id)
      
      if(user){
        await UserAccount.findByIdAndDelete(id)
        const message = `delete user ${user.name} successfully`
        messageQueue('admin_notify', message)

        res.status(200).json({
              "success" : true,
              "message" : "delete success"
            })
      }else{
        res.status(404).json({
              success: false,
              message: "did not found user",
            });
      }



      // if (await UserAccount.findByIdAndDelete(id)) {
      //   res.status(200).json({
      //     "success" : true,
      //     "message" : "delete success"
      //   });
      // } else {
      //   res.status(404).json({
      //     success: false,
      //     message: "did not found user",
      //   });
      // }
    } catch (err) {

      errLogger(err,req,res,()=>{
        res.status(500).json({
          success: false,
          message: err.message,
        });
      })
    }
  },
  UpdateUserByID: async (req, res, id) => {
    try {
      uploadAvatar(req, res, async (err) => {
        const user = await UserAccount.findById(id);
        if (err) {
          helperFunc.status(res, false, null, "can not upload image");
        }else if (!user) {
          return res.status(402).json({
            success: false,
            message: "did not found user",
          });
        }
         else if (!checkPass(req)) {
          helperFunc.status(res, false,null,"password and re-enter password did not match" );
        }else{

        user.name = req.body.name;
        user.phone = req.body.phone;
        user.dob = req.body.dob;
        user.email = req.body.email


        if(req.body.password !== ""){
        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(req.body.password, salt);
        user.password= hashPass
        }

        user.role = req.body.role
        user.active = req.body.active

        if (req.file) {
          user.avatar = `/static/images/avatar/${req.file.filename}`;
        }
        
        const message = `update user ${user.name} successfully`
        messageQueue('admin_notify', message)

        await user.save().then(console.log(user));

        res.status(200).json({
          success: true,
          data: user,
        });
      }
        
      })
    
    } catch (err) {

      errLogger(err,req,res,()=>{
        res.status(404).json({
          success: false,
          message: "update user failed",
          error: err.message,
        });
      })
      
    }
  },

  addUserByAdmin: async (req, res) => {
    try {
      uploadAvatar(req, res, async (err) => {
        const user = await UserAccount.findOne({ email: req.body.email });

        if (err) {
          helperFunc.status(res, false, null, "can not upload image");
        } else if (user) {
          helperFunc.status(res, false, null, "email already in use");
        } else if (!checkPass(req)) {
          helperFunc.status(res, false,null,"password and re-enter password did not match" );
        }else if (!req.body.email) {
          helperFunc.status(res, false, null, "email is require" );
        }
         else {
          const salt = await bcrypt.genSalt(10);
          const hashPass = await bcrypt.hash(req.body.password, salt);

          const newUser = await new UserAccount({
            email: req.body.email,
            name: req.body.name,
            password: hashPass,
            phone: req.body.phone,
            dob: req.body.dob,
            role: req.body.role,
            active : true
          });

          if (req.file) {
            newUser.avatar = `/static/images/avatar/${req.file.filename}`;
          }
          else {
              if(req.body.url){
                  if (isImage(req.body.url)) {
                      newUser.avatar = req.body.url
                  }
              }
          }

          await newUser.save().then((user) => {
            helperFunc.status(res, true, newUser, "add user success");

            const message = `add user ${user.name} successfully`
            messageQueue('admin_notify', message)

          });
        }
      });
    } catch (err) {



      errLogger(err,req,res,()=>{
        res.status(404).json({
          success: false,
          message: "update user failed",
          error: err.message,
        });
      })

     
    }
  },

  addUser: async (req, res) => {
    try {
      uploadAvatar(req, res, async (err) => {
        const user = await UserAccount.findOne({ email: req.body.email });
        if (err) {
          helperFunc.status(res, false, null, "can not upload image");
        } else if (user) {

          helperFunc.status(res, false, null, "email already in use");

        } else if (!checkPass(req)) {
          helperFunc.status(res, false,null,"password and re-enter password did not match" );
        } else {
   
          const salt = await bcrypt.genSalt(10);
          const hashPass = await bcrypt.hash(req.body.password, salt);

       

          const newUser = await new UserAccount({
            email: req.body.email,
            name: req.body.name,
            password: hashPass,
            phone: req.body.phone,
            dob: req.body.dob,
            role: req.body.role,
          });
         

          if (req.file) {
            newUser.avatar = `/static/images/avatar/${req.file.filename}`;
          } else {
            if (isImage(req.body.url)) {
              newUser.avatar = req.body.url;
            }
          }

          

          const tokenActivate = jwt.sign(
            {
              id: newUser._id,
            },
            process.env.JWT_ACCESS_KEY,
            {
              expiresIn: "30m",
            }
          );

          fullTokenActivate = "Bearer " + tokenActivate;

          const URL =
            "http://localhost:8000/api/verify/account/" + fullTokenActivate;
          console.log("URL", URL);
          const content = `Click <a href = "${URL}" > here  </a> to activate your account`;
            let Iuser
          if (!newUser.role) {
            Iuser = await Userrole.findOne({
              name: "user"
            });
            if(!Iuser){
              Iuser = await new Userrole({
                name: "user"
              })
            }
            newUser.role = Iuser._id;
            console.log(newUser);
          }

          //   EmailSender(res, newUser.email, "Active Your Account", content);
          await newUser.save();
          res.status(200).json({
            newUser,
            tokenActivate,
          });
          // res.render("registrationComplete");
        }
      });
    } catch (err) {

      errLogger(err,req,res,()=>{
        res.status(404).json({
          success: false,
          message: "add user failed",
          error: err.message,
        });
      })

      
    }
  },

  activeUserAccountByToken: async (req, res, id) => {
    try {
      const user = await UserAccount.findById(id).populate("role");

      if (!user) {
        return res.status(403).json({
          success: false,
          message: "Invalid token",
        });
      } else {
        user.active = true;
        console.log("activate: " + user.active);
        await user.save();
        // res.status(200).json({
        //     "success": true,
        //     "message": "Verify account success",
        //     "data": user
        // });

        res.render("verifyAccountCompleted");
      }
    } catch (err) {

      errLogger(err,req,res,()=>{
        res.status(404).json({
          success: false,
          message: "active user failed",
          error: err.message,
        });
      })

      
    }
  },

  UpdateUserByToken: async (req, res, id, checkAuth) => {
    try {
      if (checkAuth == 0) {
        const user = await UserAccount.findById(id);

        if (!user) {
          return res.status(500).json({
            success: false,
            message: "did not found user",
          });
        }
        user.name = req.body.name;
        user.phone = req.body.phone;
        user.dob = req.body.dob;

        if (!user.avatar) {
          user.avatar = "default";
        }

        if (req.file) {
          if (!validateURL(user.avatar) && user.avatar != "default") {
            var oldPath = "." + user.avatar;
            var getPath = oldPath.replace("static", "public");
            await fs.unlinkSync(getPath);
            console.log("unlink path" + getPath);
          }
          user.avatar = `/static/images/avatar/${req.file.filename}`;
        } else {
          if (isImage(req.body.url)) {
            if (!validateURL(user.avatar) && user.avatar != "default") {
              var oldPath = "." + user.avatar;
              var getPath = oldPath.replace("static", "public");
              await fs.unlinkSync(getPath);
              console.log("unlink path" + getPath);
            }

            user.avatar = req.body.url;
          }
        }

        await user.save();
      } else if (checkAuth == 1) {
        const user_FB = await AuthAccount.findById(id);

        if (!user_FB) {
          return res.status(500).json({
            success: false,
            message: "did not found user",
          });
        }
        user_FB.facebook.name = req.body.name;
        user_FB.facebook.phone = req.body.phone;
        user_FB.facebook.dob = req.body.dob;

        if (!user_FB.facebook.avatar) {
          user_FB.facebook.avatar = "default";
        }

        if (req.file) {
          if (
            !validateURL(user_FB.facebook.avatar) &&
            user_FB.facebook.avatar != "default"
          ) {
            var oldPath = "." + user_FB.facebook.avatar;
            var getPath = oldPath.replace("static", "public");
            await fs.unlinkSync(getPath);
            console.log("unlink path" + getPath);
          }
          user_FB.facebook.avatar = `/static/images/avatar/${req.file.filename}`;
        } else {
          if (isImage(req.body.url)) {
            if (
              !validateURL(user_FB.facebook.avatar) &&
              user_FB.facebook.avatar != "default"
            ) {
              var oldPath = "." + user_FB.facebook.avatar;
              var getPath = oldPath.replace("static", "public");
              await fs.unlinkSync(getPath);
              console.log("unlink path" + getPath);
            }

            user_FB.facebook.avatar = req.body.url;
          }
        }

        await user_FB.save();
      } else if (checkAuth == 2) {
        const user_GG = await AuthAccount.findById(id);

        if (!user_GG) {
          return res.status(500).json({
            success: false,
            message: "did not found user",
          });
        }
        user_GG.google.name = req.body.name;
        user_GG.google.phone = req.body.phone;
        user_GG.google.dob = req.body.dob;

        if (!user_GG.google.avatar) {
          user_GG.google.avatar = "default";
        }

        if (req.file) {
          if (
            !validateURL(user_GG.google.avatar) &&
            user_GG.google.avatar != "default"
          ) {
            var oldPath = "." + user_GG.google.avatar;
            var getPath = oldPath.replace("static", "public");
            await fs.unlinkSync(getPath);
            console.log("unlink path" + getPath);
          }
          user_GG.google.avatar = `/static/images/avatar/${req.file.filename}`;
        } else {
          if (isImage(req.body.url)) {
            if (
              !validateURL(user_GG.google.avatar) &&
              user_GG.google.avatar != "default"
            ) {
              var oldPath = "." + user_GG.google.avatar;
              var getPath = oldPath.replace("static", "public");
              await fs.unlinkSync(getPath);
              console.log("unlink path" + getPath);
            }

            user_GG.google.avatar = req.body.url;
          }
        }

        await user_GG.save();
      }

      res.redirect("/");
    } catch (err) {

      errLogger(err,req,res,()=>{
        res.status(404).json({
          success: false,
          message: "update user by token failed",
          error: err.message,
        });
      })

     
    }
  },
  ChangeUserPassword: async (req, res, id) => {
    try {
      const user = await UserAccount.findById(id);
      if (!user) {
        return res.status(500).json({
          success: false,
          message: "did not found user",
        });
      } else {
        const checkPass = await bcrypt.compare(
          req.body.OldPassword,
          user.password
        );
        if (!checkPass) {
          return res.status(400).json({
            success: false,
            message: "wrong password",
          });
        } else {
          const salt = await bcrypt.genSalt(10);
          const newPassword = await bcrypt.hash(req.body.newPassword, salt);
          user.password = newPassword;
          user.save();
          res.status(500).json({
            success: true,
            data: user,
          });
        }
      }
    } catch (err) {
      errLogger(err,req,res,()=>{
        res.status(404).json({
          success: false,
          message: "update user password failed",
          error: err.message,
        });
      })
    }
  },
  activeOrBlockUserAccountByID: async (res, id) => {
    try {
      const user = await UserAccount.findById(id);

      if (!user) {
        return res.status(403).json({
          success: false,
          message: "did not found user",
        });
      }

      if (!user.active) {
        user.active = true;
      } else {
        user.active = false;
      }
      user.save();
      // Update InforUserID for user
      res.status(500).json({
        success: true,
        data: user,
      });
    } catch (err) {

      errLogger(err,req,res,()=>{
        res.status(404).json({
          success: false,
          message: "block or unblock user failed",
          error: err.message,
        });
      })
      
    }
  },
};

module.exports = userController;
