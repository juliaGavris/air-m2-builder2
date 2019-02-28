var chai = require("chai");
var chaiHttp = require("chai-http");

const port = 9000;
const should = chai.should();
chai.use(chaiHttp);

describe("m2units", () => {
  it("/m2units/gamex-chips-irfc/index.js", done => {
    chai
      .request(`http://localhost:${port}`)
      .get("/m2units/gamex-chips-irfc/index.js")
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it("/m2units/gamex-drawing-irfc/index.js", done => {
    chai
      .request(`http://localhost:${port}`)
      .get("/m2units/gamex-drawing-irfc/index.js")
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it("/m2units/gamex-input/index.js", done => {
    chai
      .request(`http://localhost:${port}`)
      .get("/m2units/gamex-input/index.js")
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it("/m2units/gamex-master/index.js", done => {
    chai
      .request(`http://localhost:${port}`)
      .get("/m2units/gamex-master/index.js")
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it("/m2units/gamex-server/index.js", done => {
    chai
      .request(`http://localhost:${port}`)
      .get("/m2units/gamex-server/index.js")
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it("/m2units/gamex-states-irfc/index.js", done => {
    chai
      .request(`http://localhost:${port}`)
      .get("/m2units/gamex-states-irfc/index.js")
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it("/m2units/gamex-statistics-irfc/index.js", done => {
    chai
      .request(`http://localhost:${port}`)
      .get("/m2units/gamex-statistics-irfc/index.js")
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it("/m2units/gamex-web-roulette/index.js", done => {
    chai
      .request(`http://localhost:${port}`)
      .get("/m2units/gamex-web-roulette/index.js")
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});
