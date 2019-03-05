/*eslint no-unused-vars: 0*/

var chai = require("chai");
var chaiHttp = require("chai-http");

const port = 9000;
const should = chai.should();
chai.use(chaiHttp);

describe("Resources", () => {
  describe("loader", () => {
    it("/m2units/test-module--game-resources/loader/description.json", done => {
      chai
        .request(`http://localhost:${port}`)
        .get("/m2units/test-module--game-resources/loader/description.json")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.episode.should.be.equal("Episode IV");
          res.body.title.should.be.equal("A NEW HOPE");
          done();
        });
    });
    it("/m2units/test-module--game-resources/loader/index.html", done => {
      chai
        .request(`http://localhost:${port}`)
        .get("/m2units/test-module--game-resources/loader/index.html")
        .end((err, res) => {
          res.should.have.status(200);
          res.text.indexOf("<!DOCTYPE html>").should.be.equal(0);
          res.text.indexOf("<title>Title</title>").should.be.greaterThan(-1);
          done();
        });
    });
  });
  describe("res", () => {
    describe("css", () => {
      it("/m2units/test-module--game-resources/res/css/styles.css", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/test-module--game-resources/res/css/styles.css")
          .end((err, res) => {
            res.should.have.status(200);
            res.text.indexOf("background-color: red").should.be.greaterThan(-1);
            res.text.indexOf("color: blue").should.be.greaterThan(-1);
            done();
          });
      });
    });
    describe("images", () => {
      it("/m2units/test-module--game-resources/res/images/tile-1.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/test-module--game-resources/res/images/tile-1.svg")
          .end((err, res) => {
            res.should.have.status(200);
            res.body
              .asciiSlice()
              .indexOf("1</text>")
              .should.be.greaterThan(-1);
            done();
          });
      });
      it("/m2units/test-module--game-resources/res/images/tile-2.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/test-module--game-resources/res/images/tile-2.svg")
          .end((err, res) => {
            res.should.have.status(200);
            res.body
              .asciiSlice()
              .indexOf("2</text>")
              .should.be.greaterThan(-1);
            done();
          });
      });
      it("/m2units/test-module--game-resources/res/images/tile-10.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/test-module--game-resources/res/images/tile-10.svg")
          .end((err, res) => {
            res.should.have.status(200);
            res.body
              .asciiSlice()
              .indexOf("10</text>")
              .should.be.greaterThan(-1);
            done();
          });
      });
      it("/m2units/test-module--game-resources/res/images/tile-025.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/test-module--game-resources/res/images/tile-025.svg")
          .end((err, res) => {
            res.should.have.status(200);
            res.body
              .asciiSlice()
              .indexOf("0.25</text>")
              .should.be.greaterThan(-1);
            done();
          });
      });
      it("/m2units/test-module--game-resources/res/images/tile-25.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/test-module--game-resources/res/images/tile-25.svg")
          .end((err, res) => {
            res.should.have.status(200);
            res.body
              .asciiSlice()
              .indexOf("25</text>")
              .should.be.greaterThan(-1);
            done();
          });
      });
      it("/m2units/test-module--game-resources/res/images/tile-050.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/test-module--game-resources/res/images/tile-050.svg")
          .end((err, res) => {
            res.should.have.status(200);
            res.body
              .asciiSlice()
              .indexOf("0.50</text>")
              .should.be.greaterThan(-1);
            done();
          });
      });
      it("/m2units/test-module--game-resources/res/images/tile-50.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/test-module--game-resources/res/images/tile-50.svg")
          .end((err, res) => {
            res.should.have.status(200);
            res.body
              .asciiSlice()
              .indexOf("50</text>")
              .should.be.greaterThan(-1);
            done();
          });
      });
      it("/m2units/test-module--game-resources/res/images/tile-100.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/test-module--game-resources/res/images/tile-100.svg")
          .end((err, res) => {
            res.should.have.status(200);
            res.body
              .asciiSlice()
              .indexOf("100</text>")
              .should.be.greaterThan(-1);
            done();
          });
      });
      it("/m2units/test-module--game-resources/res/images/tile-500.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/test-module--game-resources/res/images/tile-500.svg")
          .end((err, res) => {
            res.should.have.status(200);
            res.body
              .asciiSlice()
              .indexOf("500</text>")
              .should.be.greaterThan(-1);
            done();
          });
      });
    });
    it("/m2units/test-module--game-resources/res/somewhat.json", done => {
      chai
        .request(`http://localhost:${port}`)
        .get("/m2units/test-module--game-resources/res/somewhat.json")
        .end((err, res) => {
          res.should.have.status(200);
          res.body["test-key"].should.be.equal("testix");
          res.body["droid-we-are-looking-for"].c3po.should.be.equal(true);
          res.body["droid-we-are-looking-for"]["k-2so"].should.be.equal(false);
          done();
        });
    });
  });
});
