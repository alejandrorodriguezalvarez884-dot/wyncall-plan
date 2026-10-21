// Serves site/ on http://localhost:4321 to look at the page before publishing:  node serve.js
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "site");
const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json; charset=utf-8" };

http
  .createServer((req, res) => {
    const name = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/\/$/, "/index.html");
    const file = path.join(ROOT, path.normalize(name));
    if (!file.startsWith(ROOT) || !fs.existsSync(file)) return res.writeHead(404).end("Not found");
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(4321, () => console.log("http://localhost:4321"));
