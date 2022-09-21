const { UserAccount, AuthAccount, Userrole } = require("../model/userModel");
const jwt = require("jsonwebtoken");


const getUserToken = async function(){
    const user = await UserAccount.findOne({ role: '62c69c41f589d69a99b636da' }).populate("role");
    //Tao Token
    const tokenAccess = jwt.sign({
        id: user._id,
        role: user.role
    }, process.env.JWT_ACCESS_KEY, {
        expiresIn: "1d"
    });

    return tokenAccess
}



module.exports = getUserToken