const fetch = require('node-fetch');
const restify = require('restify');

const httpProtocol = process.env.HTTPPROTOCOL || "http://";

const serverHost = process.env.SERVERHOST || "0.0.0.0";
const serverPort = process.env.SERVERPORT || 4000;
const server = restify.createServer();

const databaseHost = process.env.DBAPIHOST;
const databasePort = process.env.DBAPIPORT;
const dbBASEURL = `${databaseHost}:${databasePort}`;

const cacheHost = process.env.CACHEAPIHOST;
const cachePort = process.env.CACHEAPIPORT;
const cacheBASEURL = `${cacheHost}:${cachePort}`;

server.get('/flights/country/:code', function(req, res, next){
  cacheURL = `${httpProtocol}${cacheBASEURL}${req.path()}`;
  dbURL = `${httpProtocol}${dbBASEURL}${req.path()}`

  fetch(cacheURL)
    .then(function(result){
      if(res.status != 200){
        return Promise.reject();
      }
    })
    .catch(function(){
      return fetch(dbURL);
    })
    .then(function(result){
      return result.json();
    })
    .then(function(json){
      res.send(json);
      next();
    })
});

server.get('/healthprobe', function(req, res, next){
  res.send("I'm healthy");
  next();
});

server.get('/readiness', function(req, res, next){
  res.send("I'm Ready");
  next();
});

server.listen(serverPort, serverHost, function() {
  console.log('%s listening at %s', server.name, server.url);
});