var chai = require("chai");
var chaiHttp = require("chai-http");

const port = 9000;
chai.use(chaiHttp);

describe("Resources", () => {
  describe("loader", () => {
    it("/m2units/test-module--game-resources/loader/description.json", done => {
      chai
        .request(`http://localhost:${port}`)
        .get("/m2units/test-module--game-resources/loader/description.json")
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
    it("/m2units/test-module--game-resources/loader/index.html", done => {
      chai
        .request(`http://localhost:${port}`)
        .get("/m2units/test-module--game-resources/loader/index.html")
        .end((err, res) => {
          res.should.have.status(200);
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
            done();
          });
      });
    });
    describe("images", () => {
      it("/m2units/test-module--game-resources/res/images/bt-chip-1-small.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/test-module--game-resources/res/images/bt-chip-1-small.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/test-module--game-resources/res/images/bt-chip-2-small.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/test-module--game-resources/res/images/bt-chip-2-small.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/test-module--game-resources/res/images/bt-chip-10-small.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/test-module--game-resources/res/images/bt-chip-10-small.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/test-module--game-resources/res/images/bt-chip-025-small.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/test-module--game-resources/res/images/bt-chip-025-small.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/test-module--game-resources/res/images/bt-chip-25-small.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/test-module--game-resources/res/images/bt-chip-25-small.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/test-module--game-resources/res/images/bt-chip-050-small.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/test-module--game-resources/res/images/bt-chip-050-small.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/test-module--game-resources/res/images/bt-chip-50-small.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/test-module--game-resources/res/images/bt-chip-50-small.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/test-module--game-resources/res/images/bt-chip-100-small.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/test-module--game-resources/res/images/bt-chip-100-small.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/test-module--game-resources/res/images/bt-chip-500-small.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/test-module--game-resources/res/images/bt-chip-500-small.svg")
          .end((err, res) => {
            res.should.have.status(200);
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
          done();
        });
    });
  });
});
