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
          ".webm": "video/webm",
        }[path.extname(file)] || "application/octet-stream";
      if(req.headers.range){
        const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        let start=match?.[1]?Number(match[1]):0,end=match?.[2]?Number(match[2]):bytes.length-1;
        if(match&&!match[1]&&match[2]){start=Math.max(0,bytes.length-Number(match[2]));end=bytes.length-1;}
        if(!match||start>end||start>=bytes.length){res.writeHead(416,{'Content-Range':`bytes */${bytes.length}`});return res.end();}
        end=Math.min(end,bytes.length-1);res.writeHead(206,{'Content-Type':type,'Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${bytes.length}`,'Content-Length':end-start+1});return res.end(bytes.subarray(start,end+1));
      }
      res.writeHead(200, { "Content-Type": type, "Content-Length":bytes.length, "Accept-Ranges":"bytes" });
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
