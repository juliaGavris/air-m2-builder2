/*eslint no-unused-vars: 0*/

var chai = require("chai");
var chaiHttp = require("chai-http");

const port = 9000;
const should = chai.should();
chai.use(chaiHttp);

describe("Units", () => {
  it("/m2units/test-module--game-unit/index.js", done => {
    chai
      .request(`http://localhost:${port}`)
      .get("/m2units/test-module--game-unit/index.js")
      .end((err, res) => {
        res.should.have.status(200);
        Number(res.header["content-length"]).should.be.greaterThan(0);
        done();
      });
  });
  it("/m2units/test-module--game-resources/index.html", done => {
    chai
      .request(`http://localhost:${port}`)
      .get("/m2units/test-module--game-resources/index.html")
      .end((err, res) => {
        res.should.have.status(200);
        res.text.indexOf("<!DOCTYPE html>").should.be.equal(0);
        res.text.indexOf("<title>Build HTML Scripts with webpack</title>").should.be.greaterThan(-1);
        res.text.indexOf("__webpack_require__").should.be.greaterThan(-1);
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
