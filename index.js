var PORT = 3000;

var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');

var server = http.createServer(function (req, res) {
    var pathname = url.parse(req.url).pathname;
    var realPath = path.join("app", pathname); 

    fs.readFile(realPath, function (err, data) {
        if (err) {
            res.writeHeader(404, {
                'content-type': 'text/html;charset="utf-8"'
            });
            res.write('<h1>404错误</h1><p>你要找的页面不存在</p>');
            res.end();
        } else {
            res.writeHeader(200, {
                'content-type': 'text/html;charset="utf-8"'
            });
            res.write(data);
            res.end();
        }
    });

});
server.listen(PORT);