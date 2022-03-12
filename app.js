let http = require('http');
let fs = require('fs');
let uglify = require('uglify-js');
let winston = require('winston');
let connect = require('connect');
let route = require('connect-route');
let connect_st = require('st');

let DocumentHandler = require('./lib/document_handler');

const configPath = process.argv.length <= 2 ? 'config.js' : process.argv[2];
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
config.port = process.env.PORT || config.port || 8080;
config.host = process.env.HOST || config.host || 'localhost';

if (config.logging) {
  try {
    winston.remove(winston.transports.Console);
  } catch(e) {
  }

  let detail, type;
  for (let i = 0; i < config.logging.length; i++) {
    detail = config.logging[i];
    type = detail.type;
    delete detail.type;
    winston.add(winston.transports[type], detail);
  }
}

let Store = require('./lib/document_stores/file');
let preferredStore = new Store(config.storage);

if (config.recompressStaticAssets) {
  let list = fs.readdirSync('./static');
  for (let j = 0; j < list.length; j++) {
    let item = list[j];
    if ((item.indexOf('.js') === item.length - 3) && (item.indexOf('.min.js') === -1)) {
      let dest = item.substring(0, item.length - 3) + '.min' + item.substring(item.length - 3);
      let orig_code = fs.readFileSync('./static/' + item, 'utf8');

      fs.writeFileSync('./static/' + dest, uglify.minify(orig_code).code, 'utf8');
      winston.info('compressed ' + item + ' into ' + dest);
    }
  }
}

let path, data;
for (let name in config.documents) {
  path = config.documents[name];
  data = fs.readFileSync(path, 'utf8');
  winston.info('loading static document', { name: name, path: path });
  if (data) {
    preferredStore.set(name, data, function(cb) {
      winston.debug('loaded static document', { success: cb });
    }, true);
  }
  else {
    winston.warn('failed to load static document', { name: name, path: path });
  }
}

let pwOptions = config.keyGenerator || {};
pwOptions.type = pwOptions.type || 'random';
let gen = require('./lib/key_generators/' + pwOptions.type);
let keyGenerator = new gen(pwOptions);

let documentHandler = new DocumentHandler({
  store: preferredStore,
  maxLength: config.maxLength,
  keyLength: config.keyLength,
  keyGenerator: keyGenerator
});

let app = connect();

app.use(route(function(router) {

  router.get('/raw/:id', function(request, response) {
    return documentHandler.handleRawGet(request, response, config);
  });

  router.head('/raw/:id', function(request, response) {
    return documentHandler.handleRawGet(request, response, config);
  });


  router.post('/documents', function(request, response) {
    return documentHandler.handlePost(request, response);
  });

  router.get('/documents/:id', function(request, response) {
    return documentHandler.handleGet(request, response, config);
  });

  router.head('/documents/:id', function(request, response) {
    return documentHandler.handleGet(request, response, config);
  });
}));

app.use(connect_st({
  path: __dirname + '/static',
  content: { maxAge: config.staticMaxAge },
  passthrough: true,
  index: false
}));

app.use(route(function(router) {
  router.get('/:id', function(request, response, next) {
    request.sturl = '/';
    next();
  });
}));

app.use(connect_st({
  path: __dirname + '/static',
  content: { maxAge: config.staticMaxAge },
  index: 'index.html'
}));

http.createServer(app).listen(config.port, config.host);

winston.info('listening on ' + config.host + ':' + config.port);