//region YETKILENDIRME - SESSION KONTROL - SAYFALAMA

var extensions = require('kuark-extensions'),
    /** @type {DBModel} */
    db = require('kuark-db')(),
    schema = require('kuark-schema'),
    mesaj = require('../src/api/v1/API').API;


exports.f_check_session = function (_q, _r, _next) {
    if (_q.url.indexOf('ihaleler/tazele') > -1 || _q.url.indexOf('/kullanicilar') == 0) {
        _next();
    } else if (!_q.session.ss.kullanici) {
        _next(mesaj[_q.method]._401(null, "Sanki sisteme giriş yapamamışsınız ya da çıkış yapmışsınız. Tekrar giriş yapıp deneseniz ne güzel olur!"));
    } else {
        _next();
    }
};

exports.f_once_session = function (_q, _r, _next) {
    extensions.ssg = [{"Session": _q.session.ss}];
    _q.session.ss && _q.session.ss.kullanici
        ? _next()
        : _next(mesaj[_q.method]._401(null, "Session bilginiz bulunamadı! Tekrar giriş yapıp deneseniz ne güzel olur!"))
};

/**
 * Session içinde kullanıcı yetkili mi sorgusu
 * @param {object} _opts.q
 * @param {object} _opts.r
 * @param {object} _opts.n
 * @param {Yetki} _opts.yetki
 * @param {integer=} _opts.kullanici_id
 * @param {integer=} _opts.tahta_id
 */
exports.f_kullanici_yetkilimi = function (_opts) {
    // 1. Kullanıcı bu tahtada var mı
    // 2. Tahtadaki rolleri bulalım ki kullanıcı bu rollerden birinde mi görelim
    // 3. Kullanıcı yetkili rollerden birine sahip mi?
    if (!_opts.q || !_opts.r || !_opts.n) {
        var sHata = "Parametre eksik, yetkilendirme yapamam";
        extensions.ssr = [{"sHata": sHata}];
        throw sHata;
    }

    extensions.ssg = [{"_opts": JSON.stringify(_opts.q.session)}];

    /** @type {Kullanici} */
    var kullanici = _opts.q.session.ss.kullanici;
    extensions.ssg = kullanici;

    var kullaniciId = _opts.kullanici_id || _opts.q.session.ss.kullanici.Id;
    var tahtaId = _opts.tahta_id || _opts.q.params.Tahta_Id;

    //db.kullanici.f_db_kullanici_tahtalari(kullaniciId, {rol: true, kullanici: true})
    db.kullanici.f_db_kullanici_tahtalari(kullaniciId)
        .then(function (_dbTahtalar) {

            if (!_dbTahtalar || _dbTahtalar.length == 0) {
                extensions.ssr = [{"! kullanıcının tahtası yok ": kullanici}];
                _opts.n(mesaj[_opts.q.method]._403(null));
                return;
            }

            // 1
            /** @type {Tahta} */
            //var tahta = kullanici.Tahtalari.whereX("Genel.Id", tahtaId);
            var tahta = _dbTahtalar.whereX("Genel.Id", tahtaId);

            if (!tahta) { // 1 > bu tahta kullanıcı tahtalarında yok!
                extensions.ssr = [{"! bu tahta, kullanıcı tahtalarında yok ": tahta}, {"kullanici": kullanici}, {"tahtaId": tahtaId}];
                _opts.n(mesaj[_opts.q.method]._403(null));
                return;
            }

            // 2 ve 3
            /** @type {Uye} */
            var tahtaKullanici = tahta.Uyeler.whereX("Id", kullaniciId);

            if (!tahtaKullanici) {
                extensions.ssr = [{"! bu kullanıcı tahtalarında, istenilen tahta yok ": tahtaKullanici}];
                _opts.n(mesaj[_opts.q.method]._403(null));
                return;
            }

            var arrYetkiliRoller = [];
            tahta.Roller.forEach(function (_rol) {
                if ([_rol].whereX({Yetki: _opts.yetki})) {
                    arrYetkiliRoller.push(_rol.Id);
                }
            });

            console.error("******** Yetki sorgulama işlemi  ******");
            console.error("\tYetki                : ", JSON.stringify({Yetki: _opts.yetki}));
            console.error("\tKullanıcının Rolleri : ", JSON.stringify(tahtaKullanici.Roller));
            console.error("\tTahtanın Rolleri     : ", JSON.stringify(tahta.Roller));
            console.error("-------- Yetki sorgulama işlemi  ******");


            // Kullanicinin rollerinde bu işi yapma yetkisinde rol var mı
            var bYetkili = tahtaKullanici.Roller.some(function (_rolId) {
                if (arrYetkiliRoller.indexOf(_rolId) > -1) {
                    return true;
                }
            });

            if (!bYetkili) {
                console.error("******** Bu işlemi yapacak bir yetki YOK! ******");
                _opts.n(mesaj[_opts.q.method]._403({returnType: "json"}));
            }
        });
};

exports.f_create_urlQuery = function (_q, _r, _next) {
    if (_q.url.indexOf('ihaleler/tazele') > -1 || _q.url == '/kullanicilar') {

        extensions.ssg = [{"f_create_urlQuery ES GEÇİLECEK > url:": _q.url}];
        _next();
        return;
    }
    // GET /tickets?page=3&per_page=10

    var /** @type {Sayfalama} */
        sayfalama = schema.f_create_default_object(schema.SCHEMA.SAYFALAMA),
        sayfa = parseInt(_q.query.page),
        satir_sayisi = parseInt(_q.query.per_page),
        aranacak_sutun = (_q.query.where || "").splitWithOptions(","),
        arrSiralamaQuery = (_q.query.sort || "").splitWithOptions(","),
        aranan = _q.query.q || "",
        kriter = _q.query.kriter || schema.SABIT.URL_QUERY.KRITER.AKTIFLER;

    // Elde etmek istediğimiz: { Sayfa: 2, SatirSayisi: 10 }
    if (_q.query.page && _q.query.per_page) {
        sayfalama.Sayfa = sayfa;
        sayfalama.SatirSayisi = satir_sayisi;
    }

    var arrSiralama = arrSiralamaQuery.map(function (_elm) {
        var siralama = schema.f_create_default_object(schema.SCHEMA.SIRALAMA);
        //TODO: sıralama yapılmak istenen gerçekte var mı?(örn adim yazdı ise tabloda adim sutunu var mı?)
        siralama.Alan = _elm.replace("-", "");
        siralama.Asc = _elm[0] != "-";
        return siralama;
    });

    /** @type {URLQuery} */
    var url_query = schema.f_create_default_object(schema.SCHEMA.URL_QUERY);
    url_query.Aranan = aranan;
    url_query.Aranacak_Alanlar = aranacak_sutun;
    url_query.Sayfalama = sayfalama;
    url_query.Kullanici_Id = _q.session.ss.kullanici.Id;
    url_query.Siralama = arrSiralama;
    url_query.Kriter = kriter;

    for (var key in _q.query) {
        if (_q.query.hasOwnProperty(key) && (/^tarih/).test(key)) {
            url_query.Tarih[key] = _q.query[key];
        }
    }

    extensions.ssg = [{"f_create_urlQuery >": JSON.stringify(url_query)}];

    _q.UrlQuery = url_query;
    _next();
};
// endregion