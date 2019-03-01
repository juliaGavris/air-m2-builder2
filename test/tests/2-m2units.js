var chai = require("chai");
var chaiHttp = require("chai-http");

const port = 9000;
chai.use(chaiHttp);

describe("m2units", () => {
  it("/m2units/test-module--game-unit/index.js", done => {
    chai
      .request(`http://localhost:${port}`)
      .get("/m2units/test-module--game-unit/index.js")
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it("/m2units/test-module--game-resources/index.html", done => {
    chai
      .request(`http://localhost:${port}`)
      .get("/m2units/test-module--game-resources/index.html")
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});
