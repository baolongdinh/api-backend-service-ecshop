process.env.NODE_ENV = "test";

//Require the dev-dependencies
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../index");
let should = chai.should();
const getUserToken = require("../controllers/getTokenUser");

chai.use(chaiHttp);

//Our parent block
describe("Users", () => {
  beforeEach((done) => {
    //Before each test we empty the database in your case
    done();
  });

  describe("/GET users", () => {
    it("GET all user with pagination and sort params", (done) => {
      getUserToken().then((result) => {
        var accessToken = "Bearer " + result;

        chai
          .request(server)
          .get("/api/admin/users/1/7/1")
          .set("token", accessToken)
          .end((err, res) => {
            //console.log(res.body)
            res.should.have.status(200);
            res.body.data.should.be.a('array')
            res.body.should.have.property('success').eql(true);
            done();
          });
      }).catch(done);
    });
  });


describe("/POST users", () => {
    it("POST USER", (done) => {

      getUserToken().then((result) => {
        var accessToken = "Bearer " + result;

        let user = {
            email: 'user424123343@email.com',
            name: 'User',
            password: '123',
            rePassword: '123',
            role: '62c69c38f589d69a99b636d9',
            active: true,
            avatar: '/static/images/avatar/avt-image-edabcaf2-8af3-441b-83e0-a02dc1522232.jpg',
        };
        chai
          .request(server)
          .post("/api/admin/users")
          .set("token", accessToken)
          .send(user)
          .end((err, res) => {

            res.should.have.status(200);    
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.data.should.have.property('name').eql(user.name);
            res.body.data.should.have.property('email').eql(user.email);
            res.body.data.should.have.property('role').eql(user.role);
            res.body.data.should.have.property('active').eql(user.active);

            done();
          });
      }).catch(done);
    });
  });

  describe("/PUT/:id users", () => {
    it("PUT USER", (done) => {

      getUserToken().then((result) => {
        var accessToken = "Bearer " + result;

        let user = {
            email: 'user999999@email.com', 
        };

        chai
          .request(server)
          .put("/api/admin/users/6303245062e6cff5b759d6fd")
          .set("token", accessToken)
          .send(user)
          .end((err, res) => {
    
            if(!res.body.success){
                console.error(res.body.message)
            }
            
            res.should.have.status(200);    
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.data.should.have.property('email').eql(user.email);


            done();
           
          })
      }).then(done,done);
    });
  });


  describe("/DELETE/:id users", () => {
    it("DELETE USER", (done) => {

      getUserToken().then((result) => {
        var accessToken = "Bearer " + result;
        chai
          .request(server)
          .delete("/api/admin/users/632aca37e4b76925c31360fa")
          .set("token", accessToken)
          .end((err, res) => {
    
            res.should.have.status(200);    
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            console.log(res.body)
            done();
          })
      })
    });
  });

});
