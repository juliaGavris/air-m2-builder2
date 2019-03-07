/*eslint no-unused-vars: 0*/

var chai = require("chai");
var chaiHttp = require("chai-http");

const port = 9000;
const should = chai.should();
chai.use(chaiHttp);

describe("Root", () => {
  it("/", done => {
    chai
      .request(`http://localhost:${port}`)
      .get("/")
      .end((err, res) => {
        res.should.have.status(200);
        res.text.indexOf("<!DOCTYPE html>").should.be.equal(0);
        res.text.indexOf("<title>Title</title>").should.be.greaterThan(-1);
        done();
      });
  });
  it("/m2.js", done => {
    chai
      .request(`http://localhost:${port}`)
      .get("/m2.js")
      .end((err, res) => {
        res.should.have.status(200);
        Number(res.header["content-length"]).should.be.greaterThan(0);
        done();
      });
  });
});
