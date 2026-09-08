import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg'};
http.createServer((request,response)=>{ const pathname=decodeURIComponent((request.url||'/').split('?')[0]); const relative=pathname==='/'?'index.html':pathname.replace(/^\/+/,''); const filePath=path.resolve(root,relative); if(!filePath.startsWith(root+path.sep)){response.writeHead(403);response.end('Forbidden');return;} fs.readFile(filePath,(error,data)=>{if(error){response.writeHead(404);response.end('Not found');return;} response.writeHead(200,{'Content-Type':mime[path.extname(filePath).toLowerCase()]||'application/octet-stream'});response.end(data);}); }).listen(4180,'127.0.0.1');
