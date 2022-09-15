const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const errLogger = require("./auditlog/errLogger")

// load  user model
const { AuthAccount, Userrole } = require("../model/userModel");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

module.exports = function (passport) {
  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function (id, done) {
    AuthAccount.findById(id, function (err, user) {
      done(err, user);
    });
  });

  // =========================================================================
  // FACEBOOK ================================================================
  // =========================================================================
  passport.use(
    new FacebookStrategy(
      {
        // điền thông tin để xác thực với Facebook.
        // những thông tin này đã được điền ở file auth.js
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: "http://localhost:8000/api/auth/facebook/callback",
        profileFields: [
          "id",
          "displayName",
          "email",
          "first_name",
          "last_name",
          "middle_name",
          "picture.type(large)",
        ],
      },

      // Facebook sẽ gửi lại chuối token và thông tin profile của user
      async function (token, refreshToken, profile, done) {
        console.log("profile user FB :" + profile);

        try {
          // tìm trong db xem có user nào đã sử dụng facebook id này chưa
          const user = await AuthAccount.findOne({ "facebook.id": profile.id });

          // Nếu tìm thấy user, cho họ đăng nhập
          if (user) {
            console.log("da tim thay user");

            return done(null, user);
          } else {
            // nếu chưa có, tạo mới user
            const authAccount = new AuthAccount();

            Iuser = await Userrole.findOne({
              name: new RegExp("^" + "user" + "$", "i"),
            });

            // lưu các thông tin cho user
            authAccount.facebook.id = profile.id;
            authAccount.facebook.name =
              profile.name.givenName + " " + profile.name.familyName; // bạn có thể log đối tượng profile để xem cấu trúc
            authAccount.facebook.email = profile.emails[0].value; // fb có thể trả lại nhiều email, chúng ta lấy cái đầu tiền
            authAccount.facebook.avatar = profile.photos[0].value;
            authAccount.facebook.role = Iuser._id;
            // lưu vào db
            //    await authAccount.save(function (err) {
            //         if (err)
            //             throw err;
            //         // nếu thành công, trả lại user
            //         return done(null,user);
            //     });

            await authAccount.save(() => {
              console.log("save user completed");
              return done(null, authAccount);
            });
          }
        } catch (err) {
          console.log(err.message);
        }
      }
    )
  );

  // =========================================================================
  // GOOGLE ================================================================
  // =========================================================================

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:8000/api/auth/google/callback",
        // profileFields: ['id','displayName','email','first_name','last_name','middle_name', 'picture.type(large)']
      },
      // Google sẽ gửi lại chuối token và thông tin profile của user
      async function (token, refreshToken, profile, done) {
        console.log("profile user GG :" + profile);

        try {
          // tìm trong db xem có user nào đã sử dụng google id này chưa
          const user = await AuthAccount.findOne({ "google.id": profile.id });

          console.log(user);

          // Nếu tìm thấy user, cho họ đăng nhập
          if (user) {
            console.log("da tim thay user");

            return done(null, user);
          } else {
            // nếu chưa có, tạo mới user
            const authAccount = new AuthAccount();

            Iuser = await Userrole.findOne({
              name: new RegExp("^" + "user" + "$", "i"),
            });

            // lưu các thông tin cho user
            authAccount.google.id = profile.id;
            authAccount.google.name =
              profile.name.givenName + " " + profile.name.familyName; // bạn có thể log đối tượng profile để xem cấu trúc
            authAccount.google.email = profile.emails[0].value; // gg có thể trả lại nhiều email, chúng ta lấy cái đầu tiền
            authAccount.google.role = Iuser._id;
            // lưu vào db
            await authAccount.save();
            return done(null, authAccount);
          }
        } catch (err) {
          console.log(err.message);
        }
      }
    )
  );
};
