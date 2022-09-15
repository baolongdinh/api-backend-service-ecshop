const jwt = require("jsonwebtoken");
const multer = require('multer');
const uuid = require('uuid').v4;
const { UserAccount } = require("../model/userModel");
const {AuditLog} = require("../model/auditLogModel")
const errLogger = require("./auditlog/errLogger")



const middlewareController = {

    verifyToken: async (req) => {
        try {
            const token = req.headers.token;
            if (token) {
                const accessToken = token.split(" ")[1];
                const user = await jwt.verify(accessToken, process.env.JWT_ACCESS_KEY);
                if (user) {
                    return user;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    },
    verifyTokenAccount: async (token) => {
        try {
            if (token) {
                const accessToken = token.split(" ")[1];
                const user = await jwt.verify(accessToken, process.env.JWT_ACCESS_KEY);
                if (user) {
                    return user;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    },
    uploadFileImage: function (req, res) {
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, "public/images/avatar")
            },
            filename: (req, file, cb) => {

                cb(null, `avt-image-${uuid()}.jpg`);
            }
        })

        const upload = multer({ storage });
        upload.single("avatar")
        return upload;
    },
    validateCheckExistedEmail: async (req, res, next) => {
       
        const user = await UserAccount.findOne({ email: req.body.email });
        console.log(req.body.email + "check US" + user);
        if (user) {
            return res.render("register", {
                mess: "Email already in use"
            })
        } else {
            next();
        }

    },

}

module.exports = middlewareController;