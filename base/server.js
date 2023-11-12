const indexHtml = require("./home.js");
const querystring = require("querystring");
const error = console.error;
const log = console.log;

class Server {
  constructor() {
    this.app = require("http");
    this.url = require("url");
    this.fs = require("fs");
    this.PORT = 4000;
    this.queryString = require("querystring");
  }

  start() {
    const server = this.Router();
    server.listen(this.PORT, () => console.log(`connection ${this.PORT}`));
    // 서버 시작 프로토타입 메소드(인스턴스 메소드)
  }

  Router() {
    // express 경우 라우터를 나눠주는 메소드가 있었는데 쌩 nodeJs는 조건문으로 일일이 처리해야하는 단점이 있었다.
    return this.app.createServer((req, res) => {
      const { _url, queryData, pathName } = this.getUrl(req, res);
      let title = queryData.id ? queryData.id : "welcome";
      let form = this.getForm();
      if (pathName === "/" || pathName === "/index.html") {
        indexHtml(title)
          .then((html) => {
            res.writeHead(200);
            res.end(html);
          })
          .catch((err) => {
            res.writeHead(404);
            error(err);
            res.end("Error: 404 not Found");
          });
      } else if (pathName === "/create") {
        indexHtml(title, form)
          .then((html) => {
            res.writeHead(200);
            res.end(html);
          })
          .catch((err) => {
            res.writeHead(404);
            error(err);
            res.end("Error: 404 not Found");
          });
      } else if (pathName === "/process/create") {
        this.reqForm(req, res);
      } else if (pathName === "/update") {
        this.getUpdate(title, res);
      } else if (pathName === "/update_process") {
        this.reqForm(req, res);
      } else if (pathName === "/delete_process") {
        this.getDelete(req, res);
      } else {
        this.send404(res);
      }
    });
    // 라우터 담당
  }

  getUrl(req, res) {
    const _url = req.url;
    const queryData = this.url.parse(_url, true).query;
    const pathName = this.url.parse(_url).pathname;
    return {
      _url,
      queryData,
      pathName,
    };
    // url를 모아놓는 메소드  url을 파싱한 데이터들 모은 메소드
  }

  send404(res) {
    this.fs.readFile("./base/error.html", "utf-8", (err, data) => {
      if (err) {
        error(err);
        res.writeHead(500);
        res.end("Error: 500 Internal Serve" + "r Error");
        return;
      }
      res.writeHead(404);
      res.end(data);
    });
    // 에러처리 메소드
  }
  getForm(title, data, getDelete) {
    // 클래스 내부에서만 사용시 정적 메소드로 만들어도 상관없다. 인스턴스를 생성하지 않고도 사용가능하다.
    // 인스턴스 변수를 사용하지 않는 경우 정적 메소드로 만드는 것이 메모리 사용을 줄일 수 있는 좋은방법.
    let form;
    if (!title && !data) {
      // create 상태
      form = `<form style="display: flex; flex-direction: column; width: 300px" action="/process/create" method="POST">
            <input type="text" name="title" placeholder="제목"/>
            <textarea name="des" id="" cols="10" rows="10" placeholder="설명"></textarea>
            <button type="submit">create</button>
              </form>`;
    } else {
      // update상태
      form = `<form style="display: flex; flex-direction: column; width: 300px" action="/update_process" method="POST">
      <input type="text" name="title" placeholder="제목" value="${title}"/>
      <input  type="hidden" name="id" value="${title}"/>
      <textarea name="des" id="" cols="10" rows="10" placeholder="설명">${data}</textarea>
      <button type="submit">update</button>
    </form>`;
    }
    return form;
  }
  reqForm(req, res) {
    // 전달받은 폼 데이터를 자바스크립트가 이해할수있는 언어로 파싱한 후 데이터를 저장.
    let body = "";
    req.on("data", (data) => {
      // form을 전송받으면 처리로직 //...
      body += data;
    });
    req.on("end", () => {
      // 응답이 끝나면 처리로직 //...
      const post = this.queryString.parse(body);
      // 객체 형식으로 넘어오는 queryString.parse();
      const { title, des, id } = post;
      log(id);
      if (!id || id === "" || id === undefined) {
        this.fs.writeFile(`../data/${title}`, des, "utf-8", (err) => {
          // 내 디렉토리에 만든 파일 저장
          if (err) {
            error(err);
            res.writeHead(500);
          }
          res.writeHead(302, { Location: `/?id=${encodeURIComponent(title)}` });
          res.end();
        });
      } else if (id) {
        log("update 실행!");
        this.fs.rename(`../data/${id}`, `../data/${title}`, (err) => {
          this.fs.writeFile(`../data/${title}`, des, "utf-8", (err) => {
            // 내 디렉토리에 만든 파일 저장
            if (err) {
              error(err);
              res.writeHead(500);
            }
            res.writeHead(302, {
              Location: `/?id=${encodeURIComponent(title)}`,
            });
            res.end();
          });
        });
      }
    });
  }
  getUpdate(title, res) {
    this.fs.readdir("./data", (err, list) => {
      this.fs.readFile(`../data/${title}`, "utf-8", (err, data) => {
        indexHtml(title, this.getForm(title, data))
          .then((html) => {
            res.writeHead(200);
            res.end(html);
          })
          .catch((err) => {
            res.writeHead(404);
            error(err);
            res.end("Error: 404 not Found");
          });
      });
    });
  }
  getDelete(req, res) {
    let body = "";
    req.on("data", (data) => {
      body += data;
    });
    req.on("end", () => {
      const post = this.queryString.parse(body);
      const { id } = post;
      log(id);
      this.fs.unlink(`../data/${id}`, (error) => {
        res.writeHead(302, {
          Location: `/`,
        });
        res.end();
      });
    });
  }
}

const server = new Server();
server.start();
