const restify = require('restify');
const redis = require('redis');

const serverHost = process.env.SERVERHOST || '0.0.0.0';
const serverPort = process.env.SERVERPORT || 3000;
const server = restify.createServer();

const redisHost = process.env.REDISHOST || 'localhost';
const redisPort = process.env.REDISPORT || 6379;
const redisCacheExpirationTimeout = process.env.REDISCACHEEXPIRATIONTIMEOUT || 60;
const redisClient = redis.createClient({host: redisHost, port: redisPort});

server.use(restify.plugins.bodyParser());

server.get('/flights/:type/:value', function(req, res, next){
  let type = req.params.type;
  let value = req.params.value;
  let key = `/flights/${type}/${value}`.toLowerCase();

  let message = null;

  console.log(`Reading from: ${key}`);

  redisClient.get(key, function(err, data){
    if(data) {
      message = JSON.parse(data);
    }
    else if(err) {
      res.status(500);
      message = {
        err: JSON.stringify(err)
      };
    }
    else {
      res.status(404);
      message = {
        message: "No Data Found"
      };
    }

    res.send(message);
    next();
  });
});

server.post('/flights/:type/:value', function(req, res, next){
  let type = req.params.type;
  let value = req.params.value;
  let key = `/flights/${type}/${value}`;

  console.log(`Writing to: ${key}`);
  
  redisClient.set(key, JSON.stringify(req.body), 'EX', redisCacheExpirationTimeout, function(err, reply){
    if(err){
      res.status(500);
    }
    console.log(`reply: ${reply}`);

    res.send();
    next();
  });
});

server.get('/healthprobe', function(req, res, next){
  res.send("I'm healthy");
  next();
});

server.get('/readinessprobe', function(req, res, next){
  res.send("I'm ready");
  next();
});

server.listen(serverPort, serverHost, function() {
  console.log('%s listening at %s', server.name, server.url);
});