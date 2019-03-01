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
        done();
      });
  });
  // it("/m2.js", done => {
  //   chai
  //     .request(`http://localhost:${port}`)
  //     .get("/m2.js")
  //     .end((err, res) => {
  //       res.should.have.status(200);
  //       done();
  //     });
  // });
  // it("/index.html", done => {
  //   chai
  //     .request(`http://localhost:${port}`)
  //     .get("/index.html")
  //     .end((err, res) => {
  //       res.should.have.status(200);
  //       done();
  //     });
  // });
});
