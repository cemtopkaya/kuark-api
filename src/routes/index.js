var router = require('express').Router(),
    ortak = require('../../lib/ortak'),
    extensions = require('kuark-extensions'),
    l = extensions.winstonConfig,
    routes = {
        api: require('./api'),
        ekap: require("./ekap"),
        email: require('./email'),
        excel: require('./excel'),
        kontrol: require('./kontrol'),
        upload: require('./upload'),
        web: require('./web'),
        login: require('./login'),
        gc: require('./google_calendar')
    };

function Router(app) {

// Passport ayalarları
    var passport = require('passport'),
        passportKuark = require('../auth/passportInit')(passport);
    app.use(passportKuark.initialize());
    app.use(passportKuark.session());

    function ensureAuthenticated(req, res, next) {
        if (req.session.ss.kullanici && req.session.ss.kullanici.Id) {
            return next();
        }
        else {
            console.log("giriş yapılmamış hiç");
            res.status(401).jsonp(
                {
                    code: 401,
                    title: 'Sisteme tekrar giriş yapmanız gerekiyor.',
                    message: 'Sisteme tekrar giriş yapmanız gerekiyor.',
                    data: null
                }
            );
        }
        return;
        // Session kısmını iyileştireceğim
        if (req.isAuthenticated())
            return next();
        else {
            console.log("giriş yapılmamış hiç");
            res.status(401).jsonp(
                {
                    code: 401,
                    title: 'Sisteme tekrar giriş yapmanız gerekiyor.',
                    message: 'Sisteme tekrar giriş yapmanız gerekiyor.',
                    data: null
                }
            );
        }
    }

    // Genel ROUTING işlerine başlayalım
    router
    /* WEB ROUTING */

    // KARŞILAMA

        .use(function (_req, _res, _next) {

            if (!_req.session.ss) {
                l.i("Session oluşsun....");

                // Server Side bilgileri Session içinde tutacak
                _req.session.ss = {
                    kullanici: null
                };

                // Client Side bilgileri Session içinde tutacak
                _req.session.cs = {
                    ejs: {
                        form: null,
                        dogrulamaHatasi: null
                    }
                };
            }
            /*   var key = 'oauth:twitter';
             if (!_req.session[key]) {
             _req.session[key] = {};
             }*/

            var fullUrl = _req.protocol + '://' + _req.get('host') + _req.originalUrl;
            console.log("\033[092m" +
                "GELEN REQUEST:\n\tMETHOD\t: %s \n\tCOOKIE\t: %s \n\tURL\t: %s \n\tBODY\t: %s" +
                "\033[0m", _req.method, _req.headers['set-cookie'], fullUrl, JSON.stringify(_req.body, null, 2));
            _next();
        })

        .use("/", routes.web)
        .use('/login/', routes.login)
        .use('/upload/', routes.upload)
        .use('/ihaleleriYukle/', routes.excel)
        .use("/mailGonder/", routes.email)
        .use("/kontrol/", routes.kontrol)
        .use("/gc/", routes.gc)
        .use('/views/', function (req, res, next) {
            res.render(req.url.substring(1));
        })
        /* API ROUTING */
        .use("/api/v1/", ensureAuthenticated, ortak.f_create_urlQuery, routes.api)
        //.use("/api/v1/",routes.api)
        .use("/ekap/", routes.ekap)

        /* production error handler  will NOT print stacktrace */
        .use(function (_err, _req, _res, _next) {
            var fullUrl = _req.protocol + '://' + _req.get('host') + _req.originalUrl;

            console.error("\nSORUNLU REQUEST:\n\tMETHOD\t: %s \n\tURL\t\t: %s \n\tBODY\t: %s", _req.method, fullUrl, JSON.stringify(_req.body, null, 2));
            extensions.ssr = [{"EnAlttakiHataSatirinaDustu": _err}];

            if (_err.data && _err.data.returnType && _err.data.returnType == "json") {
                return _res.json(_err);
            }

            _res.render('error', {
                status: _err.status,
                message: _err.message,
                error: _err,
                sessionUserId: _req.session ? _req.session.userId : "Session uff olmuş"
            })
        })

        .use(function (_req, _res, _next) {

            if (!_req.session.ss) {
                l.i("Session oluşsun....");
                // Client Side bilgileri Session içinde tutacak
                _req.session.cs = {
                    ejs: {
                        form: null,
                        dogrulamaHatasi: null
                    }
                };
                // Server Side bilgileri Session içinde tutacak
                _req.session.ss = {kullanici: null};
            }

            var fullUrl = _req.protocol + '://' + _req.get('host') + _req.originalUrl;
            console.log("\033[092m" +
                "GELEN REQUEST:\n\tMETHOD\t: %s \n\tURL\t\t: %s \n\tBODY\t: %s" +
                "\033[0m", _req.method, fullUrl, JSON.stringify(_req.body, null, 2));
            _res.end("Böyle bir url için sayfamız hiç olmadı ama bu olmayacak demek değil ;)")
        });

    return router;
}
module.exports = Router;