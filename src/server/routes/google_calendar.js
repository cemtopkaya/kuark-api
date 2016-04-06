var express = require('express'),
    r = express.Router(),
    gcal = require('google-calendar'),
    db = require('kuark-db');

function f_token_kontrol(_req, _res, _next) {
    if (!_req.session.ss.kullanici || _req.session.ss.kullanici == null || !_req.session.ss.kullanici.Id) {
        return _next(mesaj["GET"]._401({returnType: "json"}, "Kullanıcı bilgisi BULUNAMADI!", "Çıkış yapıp tekrar girmelisin!"));

    } else if (!_req.session.ss.kullanici.Providers.GP) {
        //return _res.redirect('/login/auth/google');
        return _next(mesaj["GET"]._401({returnType: "json"},
            "Google+ bilgisi BULUNAMADI!",
            "Google calendar ile ilgili işlem yapabilmek için öncelikle google+ ile giriş yapmalısın!"));

    } else {
        return _next();
    }
}

//region kullanıcının takvim listesini getirme-yeni takvim ekleme

/**
 * 127.0.0.1:3000/gc
 */
r.route('/')
    .all(f_token_kontrol)
    .get(function (req, res) {
        console.log("gc get");
        var accessToken = req.session.ss.kullanici.Providers.GP.token;
        console.log("accessToken>" + accessToken);

        gcal(accessToken).calendarList.list(function (err, data) {
            if (err) {
                console.log("err.message>" + err.message);
                res.send({
                    code: 500,
                    title: "Google calendar list çekme işlemi",
                    message: "Google calendar list çekilemedi.Hata mesajı:" + err.message,
                    data: err
                });

            } else {
                res.send({
                    code: 200,
                    title: "Google calendar list çekme işlemi",
                    message: "Google calendar list başarıyla çekildi.",
                    data: data.items
                });
            }
        });
    })
    .post(function (req, res) {
        var accessToken = req.session.ss.kullanici.Providers.GP.token;
        console.log("accessToken>" + accessToken);

        var resource = req.body;

        gcal(accessToken).calendars.insert(resource, function (err, data) {
            if (err) {

                res.send({
                    code: 500,
                    title: "Google calendar list ekleme işlemi",
                    message: "Google calendar list eklenemedi.Hata mesajı:" + err.message,
                    data: err
                })
            } else {
                res.send({
                    code: 200,
                    title: "Google calendar list ekleme işlemi",
                    message: "Google calendar list başarıyla eklendi.",
                    data: data
                });
            }
        });
    });

// endregion

//region takvim bilgisini gösterme-silme-güncelleme
r.route('/:Calendar_Id')
    .all(function (req, res, next) {
        if (req.params.Calendar_Id) {
            next();
        } else {
            res.status(410).send("{\"message\":\"calendarId bulunamadı!\"}");
        }
    })
    .get(function (req, res) {

        var accessToken = req.session.ss.kullanici.Providers.GP.token,
            calendarId = req.params.Calendar_Id;

        gcal(accessToken).calendars.get(calendarId, function (err, data) {
            if (err) {
                res.send({
                    code: 500,
                    title: "Google calendar id çekme işlemi",
                    message: "Google calendar id çekilemedi.Hata mesajı:" + err.message,
                    data: err
                });
            } else {
                res.send({
                    code: 200,
                    title: "Google calendar id çekme işlemi",
                    message: "Google calendar id başarıyla çekildi.",
                    data: data
                });
            }
        });
    })
    .delete(function (req, res) {

        var accessToken = req.session.ss.kullanici.Providers.GP.token,
            calendarId = req.params.Calendar_Id;

        gcal(accessToken).calendars.delete(calendarId, function (err, data) {
            if (err) {
                res.send({
                    code: 500,
                    title: "Google calendar silme işlemi",
                    message: "Google calendar silinemedi.Hata mesajı:" + err.message,
                    data: err
                });
            } else {
                res.send({
                    code: 200,
                    title: "Google calendar silme işlemi",
                    message: "Google calendar başarıyla silindi.",
                    data: calendarId
                });
            }
        });
    })
    .put(function (req, res) {

        var accessToken = req.session.ss.kullanici.Providers.GP.token,
            calendarId = req.params.Calendar_Id,
            resource = req.body;

        gcal(accessToken).calendars.put(calendarId, resource, function (err, data) {
            if (err) {
                res.send({
                    code: 500,
                    title: "Google calendar güncelleme işlemi",
                    message: "Google calendar güncellenemedi.Hata mesajı:" + err.message,
                    data: err
                });
            } else {
                res.send({
                    code: 200,
                    title: "Google calendar güncelleme işlemi",
                    message: "Google calendar başarıyla güncellendi.",
                    data: data
                });
            }
        });
    });
// endregion

//region takvime bağlı etkinlikleri gösterme-yeni etkinlik ekleme
r.route('/:Calendar_Id/events/')
    .all(f_token_kontrol, function (req, res, next) {
        if (req.params.Calendar_Id) {
            next();
        } else {
            res.status(410).send("{\"message\":\"calendarId bulunamadı!\"}");
        }
    })
    .get(function (req, res) {
        var accessToken = req.session.ss.kullanici.Providers.GP.token,
            calendarId = req.params.Calendar_Id;

        gcal(accessToken).events.list(calendarId, function (err, data) {
            if (err) {
                res.send({
                    code: 500,
                    title: "Google calendar events çekme işlemi",
                    message: "Google calendar events çekilemedi.Hata mesajı:" + err.message,
                    data: err
                })
            } else {
                res.send({
                    code: 200,
                    title: "Google calendar events çekme işlemi",
                    message: "Google calendar events başarıyla çekildi.",
                    data: data.items
                });
            }
        });
    })
    .post(function (req, res) {
        var event = req.body,
            accessToken = req.session.ss.kullanici.Providers.GP.token,
            calendarId = req.params.Calendar_Id;

        gcal(accessToken).events.insert(calendarId, event, function (err, response) {
            console.log('GOOGLE RESPONSE:', err, response);

            if (err) {
                res.status(500).send({
                    code: 500,
                    title: "Google calendar events ekleme",
                    message: "İşlem tamamlanamadı! Hata mesajı:" + err.message,
                    data: err
                });
            }
            else {

                res.status(201).send({
                    code: 201,
                    title: "Google calendar events ekleme",
                    message: "Ekleme işlemi BAŞARIYLA tamamlandı.",
                    data: response
                });
            }
        });
    });
// endregion

//region takvime bağlı etkinliği çekme-silme-güncelleme
r.route('/:Calendar_Id/events/:Event_Id')
    .all(f_token_kontrol, function (req, res, next) {

        if (req.params.Calendar_Id) {
            next();
        } else {
            res.status(410).send("{\"message\":\"Calendar_Id bulunamadı!\"}");
        }
    })
    .get(function (req, res) {
        var accessToken = req.session.ss.kullanici.Providers.GP.token,
            calendarId = req.params.Calendar_Id ? req.params.Calendar_Id : "primary",
            eventId = req.params.Event_Id;

        gcal(accessToken).events.get(calendarId, eventId, function (err, data) {

            if (err) {
                res.send({
                    code: 500,
                    title: "Google calendar event çekme işlemi",
                    message: "Google calendar event bilgisi çekilemedi.Hata mesajı:" + err.message,
                    data: err
                })
            } else {
                res.send({
                    code: 200,
                    title: "Google calendar event çekme işlemi",
                    message: "Google calendar event başarıyla getirildi.",
                    data: data
                });
            }
        });
    })
    .delete(function (req, res) {
        var accessToken = req.session.ss.kullanici.Providers.GP.token,
            calendarId = req.params.Calendar_Id ? req.params.Calendar_Id : "primary",
            eventId = req.params.Event_Id;

        gcal(accessToken).events.delete(calendarId, eventId, function (err, data) {

            if (err) {
                res.send({
                    code: 500,
                    title: "Google calendar events silme işlemi",
                    message: "Google calendar event silinemedi.Hata mesajı:" + err.message,
                    data: err
                })
            } else {
                res.send({
                    code: 200,
                    title: "Google calendar events silme işlemi",
                    message: "Google calendar events başarıyla silindi.",
                    data: calendarId
                });
            }
        });
    })
    .put(function (req, res) {
        var accessToken = req.session.ss.kullanici.Providers.GP.token,
            calendarId = req.params.Calendar_Id ? req.params.Calendar_Id : "primary",
            eventId = req.params.Event_Id,
            resource = req.body;

        gcal(accessToken).events.update(calendarId, eventId, resource, function (err, data) {

            if (err) {
                res.send({
                    code: 500,
                    title: "Google calendar event güncelleme işlemi",
                    message: "Google calendar event güncellenedi.Hata mesajı:" + err.message,
                    data: err
                })
            } else {
                res.send({
                    code: 200,
                    title: "Google calendar event güncelleme işlemi",
                    message: "Google calendar event başarıyla güncellendi.",
                    data: data
                });
            }
        });
    });
// endregion

//region takvime bağlı ACL kuralları listesini görme-ekleme
r.route('/:Calendar_Id/acl')
    .all(f_token_kontrol, function (req, res, next) {
        if (req.params.Calendar_Id) {
            next();
        } else {
            res.status(410).send("{\"message\":\"calendarId bulunamadı!\"}");
        }
    })
    .get(function (req, res) {

        var accessToken = req.session.ss.kullanici.Providers.GP.token,
            calendarId = req.params.Calendar_Id;

        gcal(accessToken).acl.list(calendarId, function (err, data) {
            if (err) {
                res.send({
                    code: 500,
                    title: "Google calendar acl list çekme işlemi",
                    message: "Google calendar acl list çekilemedi.Hata mesajı:" + err.message,
                    data: err
                });
            } else {
                res.send({
                    code: 200,
                    title: "Google calendar acl list çekme işlemi",
                    message: "Google calendar acl list başarıyla çekildi.",
                    data: data.items
                });
            }
        });
    })
    .post(function (req, res) {

        var accessToken = req.session.ss.kullanici.Providers.GP.token,
            calendarId = req.params.Calendar_Id,
            resource = req.body;

        gcal(accessToken).acl.insert(calendarId, resource, function (err, data) {
            if (err) {
                res.send({
                    code: 500,
                    title: "Google calendar acl list ekleme işlemi",
                    message: "Google calendar acl list eklenemedi.Hata mesajı:" + err.message,
                    data: err
                });
            } else {
                res.send({
                    code: 200,
                    title: "Google calendar acl list ekleme işlemi",
                    message: "Google calendar acl list başarıyla eklendi.",
                    data: data
                });
            }
        });
    });
// endregion

//region takvime bağlı ACL kuralını görme-güncelleme-silme
r.route('/:Calendar_Id/acl/:Rule_Id')
    .all(f_token_kontrol, function (req, res, next) {
        if (req.params.Calendar_Id && req.params.Rule_Id) {
            next();
        } else {
            res.status(410).send("{\"message\":\"Id ler bulunamadı!\"}");
        }
    })
    .get(function (req, res) {

        var accessToken = req.session.ss.kullanici.Providers.GP.token,
            calendarId = req.params.Calendar_Id,
            ruleId = req.params.Rule_Id;

        gcal(accessToken).acl.get(calendarId, ruleId, function (err, data) {
            if (err) {
                res.send({
                    code: 500,
                    title: "Google calendar acl çekme işlemi",
                    message: "Google calendar acl çekilemedi.Hata mesajı:" + err.message,
                    data: err
                });
            } else {
                res.send({
                    code: 200,
                    title: "Google calendar acl çekme işlemi",
                    message: "Google calendar acl başarıyla çekildi.",
                    data: data
                });
            }
        });
    })
    .put(function (req, res) {

        var accessToken = req.session.ss.kullanici.Providers.GP.token,
            calendarId = req.params.Calendar_Id,
            resource = req.body,
            ruleId = req.params.Rule_Id;

        gcal(accessToken).acl.update(calendarId, ruleId, resource, function (err, data) {
            if (err) {
                res.send({
                    code: 500,
                    title: "Google calendar acl güncelleme işlemi",
                    message: "Google calendar acl güncellenemedi.Hata mesajı:" + err.message,
                    data: err
                });
            } else {
                res.send({
                    code: 200,
                    title: "Google calendar acl güncelleme işlemi",
                    message: "Google calendar acl başarıyla güncellendi.",
                    data: data
                });
            }
        });
    })
    .delete(function (req, res) {

        var accessToken = req.session.ss.kullanici.Providers.GP.token,
            calendarId = req.params.Calendar_Id,
            ruleId = req.params.Rule_Id;

        gcal(accessToken).acl.delete(calendarId, ruleId, function (err, data) {

            if (err) {
                res.send({
                    code: 500,
                    title: "Google calendar acl silme işlemi",
                    message: "Google calendar acl silinemedi.Hata mesajı:" + err.message,
                    data: err
                });
            } else {
                if (data == "Not Found") {
                    res.send({
                        code: 500,
                        title: "Google calendar acl silme işlemi",
                        message: "Google calendar acl silinemedi.Hata mesajı:" + data,
                        data: data
                    });

                } else {
                    res.send({
                        code: 200,
                        title: "Google calendar acl silme işlemi",
                        message: "Google calendar acl başarıyla silindi.",
                        data: ruleId
                    });
                }

            }
        });
    });

// endregion

module.exports = r;