const fs = require("fs");
const path = require("path");
const indexHtml = (qureyDataId, form) => {
  return new Promise((resolve, reject) => {
    const title = path.parse(qureyDataId).base;
    fs.readFile(`../data/${title}`, "utf-8", (err, data) => {
      // readFile 파일을 읽어오는 함수
      fs.readdir("../data", (err, list) => {
        // 내 파일 리스트를 불러온는 fs모듈의 메소드
        if (err) {
          reject(err);
          return;
        }
        let update;
        const find = list.find((rs) => title === rs);
        if (title === find) {
          update = true;
        }
        if (!data) {
          // data가 없을 시 데이터를 비움
          data = "";
        }

        let tem = `<!DOCTYPE html>
            <html>
                <head>
                    <title>WEB1 - ${title}</title>
                    <meta charset="utf-8" />
                    <link rel="stylesheet" href="style.css">
                </head>
                <body>
                    <h1><a href="index.html">WEB</a></h1>
                    <ol>
                        ${list
                          .map(
                            (list) =>
                              `<li><a href="/?id=${list}"> ${list}</a></li>`,
                          )
                          .join("")}
                        <a href="create">create </a>  ${
                          update === true
                            ? `<a href=/update?id=${title}>update</a>`
                            : ``
                        } 
                        ${
                          update === true
                            ? `<form action="/delete_process" method="POST">
                                    <input type="hidden" name="id" value="${title}">
                                    <input type="submit" value="delete">
                                </form>`
                            : ``
                        }
                        
                    </ol>
                    <h2>${title}</h2>
                    <p>
                        <a
                            href="https://www.w3.org/TR/html5/"
                            target="_blank"
                            title="html5 speicification"
                            >Hypertext Markup Language (HTML)</a
                        >
                        is the standard markup language for
                        <strong>creating <u>web</u> pages</strong> and web applications.Web
                        browsers receive HTML documents from a web server or from local
                        storage and render them into multimedia web pages. HTML describes
                        the structure of a web page semantically and originally included
                        cues for the appearance of the document.
                    </p>
                    <p style="margin-top: 45px">
                        ${form ? form : data}     
                    </p>
                </body>
            </html>
            `;
        resolve(tem);
      });
    });
  });
};

module.exports = indexHtml;
