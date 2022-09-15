const authRouter = require("express").Router();
const passport = require('passport');
const { AuthAccount, Userrole } = require("../model/userModel")
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const userController = require("../controllers/userController");
const userAuthController = require("../controllers/userAuthController")


authRouter.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


//xử lý sau khi user cho phép xác thực với facebook

//////// FACE BOOK //////////
authRouter.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }),
    async function (req, res) {
        // Successful authentication, redirect home.
        console.log("###" + req.user)


        console.log("###user fb" + req.user.facebook);

        // create token if found user 

        const role = await Userrole.findById(req.user.facebook.role)

        const Facebook_tokenAccess = jwt.sign({
            id: req.user.id,
            role: role.name
        }, process.env.JWT_ACCESS_KEY, {
            expiresIn: "1d"
        });

        const full_Facebook_tokenAccess = `Bearer ${Facebook_tokenAccess}`

        console.log("FB_token: " + full_Facebook_tokenAccess)

        //save token to cookie

        res.cookie('facebook_access_token', full_Facebook_tokenAccess, {
            maxAge: 365 * 24 * 60 * 60 * 100, // thời gian sống 
            httpOnly: true, // chỉ có http mới đọc được token
            //secure: true; //ssl nếu có, nếu chạy localhost thì comment nó lại
        })

        res.redirect("/");

    });


////// GOOGLE /////////

authRouter.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    async function (req, res) {
        // Successful authentication, redirect home.
        console.log("###" + req.user)


        console.log("###user gg" + req.user.google);

        // create token if found user 

        const role = await Userrole.findById(req.user.google.role)

        const Google_tokenAccess = jwt.sign({
            id: req.user.id,
            role: role.name
        }, process.env.JWT_ACCESS_KEY, {
            expiresIn: "1d"
        });

        const full_Google_tokenAccess = `Bearer ${Google_tokenAccess}`

        console.log("GG_token: " + full_Google_tokenAccess)

        //save token to cookie

        res.cookie('google_access_token', full_Google_tokenAccess, {
            maxAge: 365 * 24 * 60 * 60 * 100, // thời gian sống 
            httpOnly: true, // chỉ có http mới đọc được token
            //secure: true; //ssl nếu có, nếu chạy localhost thì comment nó lại
        })

        res.redirect("/");

    });



//LOGIN USER
authRouter.post("/login", userAuthController.loginUser);



//LOG OUT
authRouter.get("/logout", async (req, res) => {

    res.clearCookie('access_token');
    res.clearCookie('facebook_access_token');
    res.clearCookie('google_access_token');
    res.redirect('/')

});

//Add User 
authRouter.post("/register", userController.addUser);


module.exports = authRouter;