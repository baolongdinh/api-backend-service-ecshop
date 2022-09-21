process.env.NODE_ENV = "test";

//Require the dev-dependencies
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../index");
let should = chai.should();
const getUserToken = require("../controllers/getTokenUser");

chai.use(chaiHttp);

//Our parent block
describe("Products", () => {
  beforeEach((done) => {
    //Before each test we empty the database in your case
    done();
  });

  describe("/GET products", () => {
    it("GET all products with pagination and sort params", (done) => {
      getUserToken()
        .then((result) => {
          var accessToken = "Bearer " + result;

          chai
            .request(server)
            .get("/api/admin/products/1/7/1")
            .set("token", accessToken)
            .end((err, res) => {
              console.log(res.body);
              res.should.have.status(200);
              res.body.data.should.be.a("array");
              res.body.should.have.property("success").eql(true);
              done();
            });
        })
        .catch(done);
    });
  });

  describe("/POST Products", () => {
    it("POST PRODUCT", (done) => {
      getUserToken()
        .then((result) => {
          var accessToken = "Bearer " + result;

          let product = {
            name: "Shoes N21",
            price: 129000,
            total_quantity: "100",
            brand: "Nike",
            origin: "Viet Nam",
            image: "/static/images/avatar/avt-image-079a7fb0-72e7-4187-a2ee-6db163599355.jpg",
          };

          chai
            .request(server)
            .post("/api/admin/products")
            .set("token", accessToken)
            .send(product)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a("object");
              res.body.should.have.property("success").eql(true);
              res.body.data.should.have.property("name").eql(product.name);
              res.body.data.should.have.property("price").eql(product.price);
              res.body.data.should.have.property("total_quantity").eql(product.total_quantity);
              res.body.data.should.have.property("brand").eql(product.brand);
              res.body.data.should.have.property("origin").eql(product.origin);

              done();
            });
        })
        .catch(done);
    });
  });

  describe("/PUT/:id products", () => {
    it("PUT PRODUCT", (done) => {
      getUserToken()
        .then((result) => {
          var accessToken = "Bearer " + result;

          let product = {
            name: "Shoes N219223",
          };

          chai
            .request(server)
            .put("/api/admin/products/62f38e5d9e8a4c67cead6fce")
            .set("token", accessToken)
            .send(product)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a("object");
              res.body.should.have.property("success").eql(true);
              res.body.data.should.have.property("name").eql(product.name);

              done();
            });
        })
        .catch(done);
    });
  });

  describe("/DELETE/:id product", () => {
    it("DELETE PRODUCT", (done) => {
      getUserToken().then((result) => {
        var accessToken = "Bearer " + result;
        chai
          .request(server)
          .delete("/api/admin/products/6303245762e6cff5b759d72a")
          .set("token", accessToken)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property("message").eql("DELETE PRODUCT SUCCESS");
            res.body.should.have.property("success").eql(true);
           
            done();
          });
      });
    });
  });
});
