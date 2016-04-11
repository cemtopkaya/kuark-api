var express = require('express'),
    favicon = require('serve-favicon'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    compression = require("compression"),
    templateEngines = require('consolidate'),
    path = require('path'),
    busboy = require('connect-busboy');

var app = express();

module.exports = {expressSetup: setupApp};

function setupApp(staticPath, viewPath) {

//public.engine('ejs', templateEngines.ejs);
//public.engine('html', templateEngines.ejs);
// view engine setup
    app
        .set('views', viewPath || path.join(__dirname, 'views'))
        .set('view engine', 'ejs')
        .set('title', 'Quark');

    app.engine('html', templateEngines.mustache);

    var expressSession = require('express-session'),
        RedisStore = require('connect-redis')(expressSession),
        sessionRedis = expressSession({
            name: "session_id_key",
            secret: "session anahtarları şifrelensin diye",
            cookie: {
                expires: false,
                secure: false,
                httpOnly: true,
                maxAge: 30 * 60 * 10000
            },
            resave: true,
            saveUninitialized: true,
            //store: new RedisStore({host: '127.0.0.1', port: 6379, db: 0})
            store: new RedisStore({host: '10.130.214.126', port: 6379, db: 1})
        }),
        sessionLocal = expressSession({
            name: "session_id_key",
            secret: "session anahtarları şifrelensin diye",
            resave: true,
            saveUninitialized: true
        }),
        favIcoPath = staticPath ? (staticPath + '/img/favicon.ico') : ('/public/img/favicon.ico');

    app
        .use(favicon(favIcoPath))
        .use(compression())
        .use(bodyParser.json())
        .use(bodyParser.urlencoded({extended: true}))
        .use(cookieParser())
        /* SESSION
         * connect-redis
         * Session bilgilerini Redis üstünde tutmak */
        .use(sessionRedis)
        //.use(sessionLocal)
        .use(busboy())

        // static path
        .use("/", express.static(staticPath || path.join(__dirname, '/public')));
    /*.use("/schema", express.static(path.join(__dirname, '/schema')))*/

    app
    /* ROUTING */
        .use(require('./routes')(app))
        .set('port', process.env.PORT || 3000);

    return app;
}

