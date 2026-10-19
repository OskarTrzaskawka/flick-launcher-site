const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const root = path.resolve(__dirname, "../site");
function start(port = 4174) {
  const server = http.createServer(async (req, res) => {
    try {
      let name = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      if (name.startsWith("/flick-launcher-site/"))
        name = name.slice("/flick-launcher-site".length);
      if (name.endsWith("/")) name += "index.html";
      const file = path.resolve(root, "." + name);
      if (file !== root && !file.startsWith(root + path.sep)) {
        res.writeHead(403);
        return res.end();
      }
      const bytes = await fs.readFile(file);
      const type =
        {
          ".html": "text/html; charset=utf-8",
          ".css": "text/css; charset=utf-8",
          ".js": "text/javascript; charset=utf-8",
          ".json": "application/json",
          ".png": "image/png",
          ".svg": "image/svg+xml",
          ".ttf": "font/ttf",
          ".txt": "text/plain; charset=utf-8",
        }[path.extname(file)] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": type });
      res.end(bytes);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}
module.exports = { start };
if (require.main === module)
  start(Number(process.env.PORT || 4174)).then((server) =>
    console.log(`Local: http://127.0.0.1:${server.address().port}/flick-launcher-site/`),
  );
