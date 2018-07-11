const fetch = require('node-fetch');
const restify = require('restify');
const port = process.env.PORT || 3000;

const server = restify.createServer();

server.get('/healthprobe', function(req, res, next){
  res.send("I'm healthy");
  next();
});

server.get('/readiness', function(req, res, next){
  res.send("I'm Ready");
  next();
});

server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});