var express = require('express'),
    routerWeb = express.Router(),
    login = require('./login'),
    ortak = require('../../../lib/ortak'),
    passport = require('passport'),
    db = require('kuark-db')(),
    mesaj = require('../api/v1/API').API,
    v1 = require('../api/v1').v1(),
    extensions = require('kuark-extensions'),
    l = extensions.winstonConfig;

/**
 * Kullanıcıya davet gelmiş mi?
 * @param {Object} _req
 * @param {Object} _res
 * @param {Function} _next
 */
var f_checkDavetVarmi = function (_req, _res, _next) {

    if (_req.session.ss.kullanici && _req.session.ss.kullanici.Id && _req.session.ss.davet && _req.session.ss.davet.Gecerli) {
        // Davete icabet edelim ve kullanıcıya davet edildiği tahtayı ekleyelim
        console.log("evet var");
        console.log("tahtaya üye eklemeye gidiyo");

        var tahta_uye = {
            Kullanici_Id: _req.session.ss.kullanici.Id,
            Roller: _req.session.ss.davet.Roller
        };

        var davet = _req.session.ss.davet;

        return db.tahta.f_db_tahta_uye_ekle(davet.Tahta_Id, tahta_uye)
            .then(function (_uyeSonuclar) {
                console.log("üye ekleme sonucu:");
                console.log(JSON.stringify(_uyeSonuclar));

                // Daveti artık uçuralım ki bir sonraki "/" talebinde tekrar davet işlemlerini tekrar etmeyelim.
                console.log("daveti siliyorum");
                return db.tahta.f_db_tahta_davet_sil(davet.Tahta_Id, davet.EPosta)
                    .then(function (_dbDavetSil) {
                        console.log("davet sil sonucu:");
                        console.log(JSON.stringify(_dbDavetSil));

                        if (_dbDavetSil != null) {
                            _req.session.ss.davet = null;
                            //tahtanın kullanıcıları temp i sıfırlıyoruz
                            db.redis.dbQ.del(db.redis.kp.temp.ssetTahtaKullanici(davet.Tahta_Id));
                        }
                        _next();
                    });
            });
    }
    _next();
};

routerWeb.route('/')
    .all(function (_req, _res, _next) {

        if (_req.session.ss.kullanici) {

            var avatar = _req.session.ss.kullanici.Avatar || "./img/avatar7.png";
            _req.session.ss.kullanici.Avatar = avatar;

            _next();
        } else {
            _res.redirect('/login');
        }
    })
    .get(f_checkDavetVarmi, function (_req, _res) {
        _req.session.cs.ejs.kullanici = _req.session.ss.kullanici;
        _req.session.cs.ejs.sessionID = _req.sessionID;
        _res.render('page/index', _req.session.cs);
    });

//region DAVET ISLEMLERI
routerWeb.route('/tahtalar/:Tahta_Id(\\d+)/davetler/:Davet_Id')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id) {
            next();
        } else {
            _r.send(410, "{\"message\":\"Tahta Id bulunamadı!\"}");
        }
    })
    .get(function (_q, _r) {
        // Davetle ilgili tüm bilgileri ss.davet içinde tutacağız.

        db.tahta.f_db_tahta_davet(_q.params.Tahta_Id, _q.params.Davet_Id)
            .then(function (_davet) {
                _q.session.ss.davet = _davet;
                _r.render('page/davetli');
            });
    });

// Davetli üyeliğe gidiyor
routerWeb.route('/tahtalar/:Tahta_Id(\\d+)/davetler/:Davetli/:EPosta')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id && _q.params.Davetli && _q.params.EPosta) {
            next();
        } else {
            l.e("Eposta Davet ile Örtüşmüyor");
            next(mesaj[_q.method]._400(null));
        }
    })
    .post(v1.tahta.f_api_tahta_davet_eposta_kontrol);
// endregion

routerWeb.route('/session')
    .get(ortak.f_once_session);

routerWeb.route('/logout')
    .get(function (req, res) {
        console.log("logout a geldim");
        req.session.destroy(function (err) {
            if (err) {
                console.log('Error destroying session... ERR: ' + err);
            }
            else {
                console.log("session.kullanici: " + req.session);
                res.redirect('/');
            }
        });
    });

routerWeb.route('/html/*')
    .get(function (req, res) {
        console.log("Buraya düşen url: " + req.url);
        //var auth = req.session.kullanici.authorization;
        //res.render(req.url.substring(1), auth);
        res.render(req.url.substring(1));
    });


module.exports = routerWeb;