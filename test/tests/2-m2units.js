var chai = require("chai");
var chaiHttp = require("chai-http");

const port = 9000;
const should = chai.should();
chai.use(chaiHttp);

describe("m2units", () => {
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
        res.text.length.should.be.equal(138);
        res.text.indexOf("<!DOCTYPE html>").should.be.equal(0);
        res.text.indexOf("<title>Title</title>").should.be.greaterThan(-1);
        done();
      });
  });
});
