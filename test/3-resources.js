var chai = require("chai");
var chaiHttp = require("chai-http");

const port = 9000;
const should = chai.should();
chai.use(chaiHttp);

describe("Resources", () => {
  describe("gamex-master-view", () => {
    describe("res", () => {
      describe("css", () => {
        it("/m2units/gamex-master-view/res/css/style_cover.css", done => {
          chai
            .request(`http://localhost:${port}`)
            .get("/m2units/gamex-master-view/res/css/style_cover.css")
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
      });
      describe("images", () => {
        it("/m2units/gamex-master-view/res/images/cover.mp4", done => {
          chai
            .request(`http://localhost:${port}`)
            .get("/m2units/gamex-master-view/res/images/cover.mp4")
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
        it("/m2units/gamex-master-view/res/images/logo2.svg", done => {
          chai
            .request(`http://localhost:${port}`)
            .get("/m2units/gamex-master-view/res/images/logo2.svg")
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
        it("/m2units/gamex-master-view/res/images/video-background-pattern-1px.png", done => {
          chai
            .request(`http://localhost:${port}`)
            .get("/m2units/gamex-master-view/res/images/video-background-pattern-1px.png")
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
      });
      it("/m2units/gamex-master-view/res/formatters.json", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-master-view/res/formatters.json")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
    });
    describe("loader", () => {
      it("/m2units/gamex-master-view/loader/index.html", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-master-view/loader/index.html")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-master-view/loader/description.json", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-master-view/loader/description.json")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
    });
    it("/m2units/gamex-master-view/index.html", done => {
      chai
        .request(`http://localhost:${port}`)
        .get("/m2units/gamex-master-view/index.html")
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
  describe("gamex-web-roulette", () => {
    describe("css", () => {
      it("/m2units/gamex-web-roulette/res/css/advanced.css", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/css/advanced.css")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/css/style.css", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/css/style.css")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/css/style_menu.css", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/css/style_menu.css")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
    });
    describe("fonts", () => {
      it("/m2units/gamex-web-roulette/res/fonts/Roboto_Condensed/bold/RobotoCondensed-Bold.ttf", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/fonts/Roboto_Condensed/bold/RobotoCondensed-Bold.ttf")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/fonts/RobotoBold.ttf", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/fonts/RobotoBold.ttf")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/fonts/RobotoCondensed-Regular.ttf", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/fonts/RobotoCondensed-Regular.ttf")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/fonts/RobotoLight.ttf", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/fonts/RobotoLight.ttf")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/fonts/RobotoMedium.ttf", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/fonts/RobotoMedium.ttf")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/fonts/RobotoRegular.ttf", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/fonts/RobotoRegular.ttf")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/fonts/roboto-thin-webfont.ttf", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/fonts/roboto-thin-webfont.ttf")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
    });
    describe("images", () => {
      describe("rules", () => {
        it("/m2units/gamex-web-roulette/res/images/rules/rules1.png", done => {
          chai
            .request(`http://localhost:${port}`)
            .get("/m2units/gamex-web-roulette/res/images/rules/rules1.png")
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
        it("/m2units/gamex-web-roulette/res/images/rules/rules10.png", done => {
          chai
            .request(`http://localhost:${port}`)
            .get("/m2units/gamex-web-roulette/res/images/rules/rules10.png")
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
        it("/m2units/gamex-web-roulette/res/images/rules/rules11.png", done => {
          chai
            .request(`http://localhost:${port}`)
            .get("/m2units/gamex-web-roulette/res/images/rules/rules11.png")
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
        it("/m2units/gamex-web-roulette/res/images/rules/rules2.png", done => {
          chai
            .request(`http://localhost:${port}`)
            .get("/m2units/gamex-web-roulette/res/images/rules/rules2.png")
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
        it("/m2units/gamex-web-roulette/res/images/rules/rules3.png", done => {
          chai
            .request(`http://localhost:${port}`)
            .get("/m2units/gamex-web-roulette/res/images/rules/rules3.png")
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
        it("/m2units/gamex-web-roulette/res/images/rules/rules4.png", done => {
          chai
            .request(`http://localhost:${port}`)
            .get("/m2units/gamex-web-roulette/res/images/rules/rules4.png")
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
        it("/m2units/gamex-web-roulette/res/images/rules/rules5.png", done => {
          chai
            .request(`http://localhost:${port}`)
            .get("/m2units/gamex-web-roulette/res/images/rules/rules5.png")
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
        it("/m2units/gamex-web-roulette/res/images/rules/rules6.png", done => {
          chai
            .request(`http://localhost:${port}`)
            .get("/m2units/gamex-web-roulette/res/images/rules/rules6.png")
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
        it("/m2units/gamex-web-roulette/res/images/rules/rules7.png", done => {
          chai
            .request(`http://localhost:${port}`)
            .get("/m2units/gamex-web-roulette/res/images/rules/rules7.png")
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
        it("/m2units/gamex-web-roulette/res/images/rules/rules8.png", done => {
          chai
            .request(`http://localhost:${port}`)
            .get("/m2units/gamex-web-roulette/res/images/rules/rules8.png")
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
        it("/m2units/gamex-web-roulette/res/images/rules/rules9.png", done => {
          chai
            .request(`http://localhost:${port}`)
            .get("/m2units/gamex-web-roulette/res/images/rules/rules9.png")
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
      });
      it("/m2units/gamex-web-roulette/res/images/bt-chip-025.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/bt-chip-025.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/bt-chip-050.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/bt-chip-050.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/bt-chip-1.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/bt-chip-1.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/bt-chip-10.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/bt-chip-10.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/bt-chip-100.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/bt-chip-100.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/bt-chip-2.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/bt-chip-2.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/bt-chip-25.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/bt-chip-25.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/bt-chip-5.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/bt-chip-5.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/bt-chip-50.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/bt-chip-50.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/bt-chip-500.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/bt-chip-500.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/gradient-conic.png", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/gradient-conic.png")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/icon-send-32.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/icon-send-32.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/label-hd.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/label-hd.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/logo2.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/logo2.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/message-win-chip-black-1.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/message-win-chip-black-1.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/message-win-chip-blue-1.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/message-win-chip-blue-1.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/message-win-chip-blue-2.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/message-win-chip-blue-2.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/message-win-chip-green-1.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/message-win-chip-green-1.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/message-win-chip-green-2.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/message-win-chip-green-2.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/message-win-chip-red-1.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/message-win-chip-red-1.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/message-win-chip-red-2.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/message-win-chip-red-2.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/panel-reality_check-1280-body.svg", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/panel-reality_check-1280-body.svg")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/shadow-fade.png", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/shadow-fade.png")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/shadow-fade_r.png", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/shadow-fade_r.png")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("/m2units/gamex-web-roulette/res/images/video-background-pattern-1px.png", done => {
        chai
          .request(`http://localhost:${port}`)
          .get("/m2units/gamex-web-roulette/res/images/video-background-pattern-1px.png")
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
    });
  });
});
