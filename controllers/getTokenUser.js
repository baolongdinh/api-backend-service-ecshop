const { UserAccount, AuthAccount, Userrole } = require("../model/userModel");
const jwt = require("jsonwebtoken");


const getUserToken = async function () {

    const role = await Userrole.findOne({ name: 'admin' })

    if (role) {
        const user = await UserAccount.findOne({ role: role._id }).populate("role");

        if (user) {
            //Tao Token
            const tokenAccess = jwt.sign({
                id: user._id,
                role: user.role
            }, process.env.JWT_ACCESS_KEY, {
                expiresIn: "1d"
            });

            return tokenAccess
        }
    }

    return null

}



module.exports = getUserToken