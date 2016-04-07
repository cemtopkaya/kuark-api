var express = require('express'),
    api = require('../api/v1/index'),
    v1 = api.v1(),
    r = express.Router(),
    schema = require('kuark-schema'),
    mesaj = require('../api/v1/API').API,
    ortak = require('../../../lib/ortak'),
    extensions = require('kuark-extensions'),
    l = extensions.winstonConfig;

r.route('/default/:SemaAdi')
    .get(function (_q, _r, next) {
        var schemaName = _q.params.SemaAdi,
            schemaId = null;

        if (schemaName.indexOf(".") == -1) {
            schemaId = schema.SCHEMA[schemaName];
        } else {
            schemaName.split(".").forEach(function (_prop, _idx, _arr) {
                if (_idx == 0) {
                    schemaId = schema.SCHEMA[_prop];
                }
                schemaId = schemaId[_prop];
            });
        }
        console.log(schemaId);
        var obj = schema.f_create_default_object(schemaId);
        _r.send(mesaj.GET._200(obj, "Yeni Tahta"));
    });

//region TAHTALAR ARASI KURUM / ÜRÜN / İHALE PAYLAŞIMI
r.route('/kurumlar/paylas')
    .all(function (_q, _r, next) {

        switch (_q.method.toLowerCase()) {
            case "post":
                schema.f_suz_dogrula_cevapla(_q, _r, next, schema.SCHEMA.PAYLAS_IDS, _q.body);
                break;
        }
        next();
    })
    .post(v1.kurum.f_api_kurum_paylas);

r.route('/urunler/paylas')
    .all(function (_q, _r, next) {

        switch (_q.method.toLowerCase()) {
            case "post":
                schema.f_suz_dogrula_cevapla(_q, _r, next, schema.SCHEMA.PAYLAS_IDS, _q.body);
                break;
        }
        next();
    })
    .post(v1.urun.f_api_urun_paylas);

r.route('/ihaleler/paylas')
    .all(function (_q, _r, next) {

        switch (_q.method.toLowerCase()) {
            case "post":
                schema.f_suz_dogrula_cevapla(_q, _r, next, schema.SCHEMA.PAYLAS_IDS, _q.body);
                break;
        }
        next();
    })
    .post(v1.ihale.f_api_ihale_paylas);
// endregion

//region BÖLGELER
r.route('/bolgeler')
    .get(v1.bolge.f_api_bolge_tumu);

r.route('/tahtalar/:Tahta_Id(\\d+)/bolgeler')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Tahta Id bulunamadı!\"}");
        }
    })
    .get(v1.bolge.f_api_bolge_tumu)
    .post(v1.bolge.f_api_bolge_ekle);

r.route('/tahtalar/:Tahta_Id(\\d+)/bolgeler/:Bolge_Id(\\d+)/')
    .all(function (_q, _r, next) {
        'use strict';
        if (_q.params.Bolge_Id && _q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Bölge Id bulunamadı!\"}");
        }
    })
    .get(v1.bolge.f_api_bolge_id)
    .put(v1.bolge.f_api_bolge_guncelle)
    .delete(v1.bolge.f_api_bolge_sil);

r.route('/tahtalar/:Tahta_Id(\\d+)/bolgeler/:Bolge_Id(\\d+)/sehirler')
    .all(function (_q, _r, next) {
        if (_q.params.Bolge_Id && _q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Bölge Id bulunamadı!\"}");
        }
    })
    .get(v1.bolge.f_api_bolge_sehirleri_tumu)
    .post(v1.bolge.f_api_bolge_sehir_ekle);

r.route('/tahtalar/:Tahta_Id(\\d+)/bolgeler/:Bolge_Id(\\d+)/sehirler/:Sehir_Id(\\d+)')
    .all(function (_q, _r, next) {
        if (_q.params.Bolge_Id && _q.params.Tahta_Id && _q.params.Sehir_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Id ler bulunamadı!\"}");
        }
    })
    .delete(v1.bolge.f_api_bolge_sehir_sil);
// endregion

//region ŞEHİRLER

r.route('/sehirler')
    .get(v1.sehir.f_api_sehir_tumu);

r.route('/sehirler/adlari')
    .get(v1.sehir.f_api_sehir_adlari);

r.route('/sehirler/:Sehir_Id(\\d+)/')
    .all(function (_q, _r, next) {
        if (_q.params.Sehir_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Şehir Id bulunamadı!\"}");
        }
    })
    .get(v1.sehir.f_api_sehir_id);
// endregion

//region OLAYLAR
r.route('/olaylar')
    .get(v1.olay.f_api_olay_tumu);
// endregion

//region UYARILAR


r.route('/tahtalar/:Tahta_Id(\\d+)/uyarilar')
    .all(function (_q, _r, next) {

        var tahta_id = _q.params.Tahta_Id;
        if (!tahta_id) {
            next(mesaj[_q.method]._400(null));
        }

        switch (_q.method.toLowerCase()) {
            case "get":

                /** @type {Yetki} */
                var yetki = {uyari: {r: true}};
                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });
                break;
            case "post":

                /** @type {Yetki} */
                var yetki = {uyari: {c: true}};

                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });

                schema.f_suz_dogrula_cevapla(_q, _r, next, schema.SCHEMA.UYARI, _q.body);
                break;

        }
        next();

    })
    .get(v1.uyari.f_api_uyarilar_tumu)
    .post(v1.uyari.f_api_uyari_ekle);

r.route('/uyarilar/tazele')
    .get(v1.uyari.f_api_uyarilari_tazele);

r.route('/tahtalar/:Tahta_Id(\\d+)/uyarilar/:Uyari_Id(\\d+)/')
    .all(function (_q, _r, next) {

        var uyari_id = _q.params.Uyari_Id,
            tahta_id = _q.params.Tahta_Id;

        if (!tahta_id) {
            next(mesaj[_q.method]._400(null));
        }

        if (!uyari_id) {
            next(mesaj[_q.method]._400(null));
        }

        switch (_q.method.toLowerCase()) {
            case "get":

                /** @type {Yetki} */
                var yetki = {uyari: {r: true}};
                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });
                break;
            case "put":

                /** @type {Yetki} */
                var yetki = {uyari: {u: true}};

                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });

                schema.f_suz_dogrula_cevapla(_q, _r, next, schema.SCHEMA.UYARI, _q.body);
                break;
            case "delete":

                /** @type {Yetki} */
                var yetki = {uyari: {d: true}};
                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });
                break;
        }
        next();

    })
    .get(v1.uyari.f_api_uyari_id)
    .put(v1.uyari.f_api_uyari_guncelle)
    .delete(v1.uyari.f_api_uyari_sil);
// endregion

//region IHALELER - GENEL

r.route('/ihaleler/tazele/sb')
    .get(v1.ihale.f_api_ihale_tazele_sb);

r.route('/ihaleler/tazele/id')
    .get(v1.ihale.f_api_ihale_tazele_id);
// endregion

//region KULLANICILAR > AD, session, profil, bolgeler, yetkiler, yorumlar, tahtalar

//region Diğer
r.route('/kullanicilar')
    .post(v1.kullanici.f_api_kullanici_ekle);

//kullanıcı oturum durumunu değiştir
r.route('/kullanicilar/:Kul_Id(\\d+)/oturumDurumlari/:Durum_Id')
    .post(v1.kullanici.f_api_kullanici_oturum_durumu_ekle);


r.route('/kullanicilar/AD/:cn')
    //.get(v1.kullanici.f_api_ad_kullanicilarini_bul);
    .get(function (_q, _r) {
        var ad = require('./ldap/AD')('adminservices', 'q1w2e3r4');
        ad.f_findUsers(_q.params.cn)
            .then(function (_adResults) {
                console.log("***********************");
                console.log(_adResults);
                _r.json(_adResults);
            }).fail(function (err) {
            console.log("---------------------");
            console.log(err);
            _r.json({
                hata: "AD Kullanıcılarını ararken hata oluştu."
            });
        });
    });

r.route('/kullanicilar/:Kul_Id(\\d+)/pass')
    .post(v1.kullanici.f_api_kullanici_pass);

r.route('/kullanicilar/session/')
    .get(v1.kullanici.f_api_kullanici_session);

r.route('/kullanicilar/:Kul_Id(\\d+)/')
    .all(function (_q, _r, next) {
        var kul_id = _q.params.Kul_Id;
        if (!kul_id) {
            next(mesaj[_q.method]._400(null));
        }

        switch (_q.method.toLowerCase()) {
            case "get":
                break;
            case "put":
            case "delete":
                schema.f_suz_dogrula_cevapla(_q, _r, next, schema.SCHEMA.DB.KULLANICI, _q.body);
                break;
        }
        next();
    })
    .get(v1.kullanici.f_api_kullanici_id)
    .put(v1.kullanici.f_api_kullanici_guncelle)
    .delete(v1.kullanici.f_api_kullanici_sil);

r.route('/kullanicilar/:Kul_Id(\\d+)/profil')
    .all(function (_q, _r, next) {
        if (_q.params.Kullanici_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Kullanıcı Id bulunamadı!\"}");
        }
    })
    .get(v1.kullanici.f_api_kullanici_profil)
    .post(v1.kullanici.f_api_kullanici_profil_ekle);

r.route('/kullanicilar/:Kul_Id(\\d+)/bolgeler')
    .all(function (_q, _r, next) {
        if (_q.params.Kul_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Kullanıcı Id bulunamadı!\"}");
        }
    })
    .get(v1.kullanici.f_api_kullanici_bolge_tumu)
    .post(v1.kullanici.f_api_kullanici_bolge_ekle);

r.route('/kullanicilar/:Kul_Id(\\d+)/bolgeler/:Bolge_Id(\\d+)')
    .all(function (_q, _r, next) {
        if (_q.params.Kul_Id && _q.params.Bolge_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Id ler bulunamadı!\"}");
        }
    })
    .delete(v1.kullanici.f_api_kullanici_bolge_sil);


r.route('/kullanicilar/:Kul_Id(\\d+)/yetkiler')
    .all(function (_q, _r, next) {
        if (_q.params.Kul_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Kullanıcı Id bulunamadı!\"}");
        }
    })
    .get(v1.kullanici.f_api_kullanici_yetki_tumu)
    .post(v1.kullanici.f_api_kullanici_yetki_ekle);

r.route('/kullanicilar/:Kul_Id(\\d+)/yetkiler/:Yetki_Id(\\d+)')
    .all(function (_q, _r, next) {
        if (_q.params.Kul_Id && _q.params.Yetki_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Id ler bulunamadı!\"}");
        }
    })
    .put(v1.kullanici.f_api_kullanici_yetki_guncelle)
    .delete(v1.kullanici.f_api_kullanici_yetki_sil);


r.route('/kullanicilar/:Kul_Id(\\d+)/yorumlar')
    .all(function (_q, _r, next) {
        // /kullanicilar/12/yorumlari > /\/kullanicilar\/d+/
        if (_q.params.Kul_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Kullanıcı Id bulunamadı!\"}");
        }
    })
    .post(v1.yorum.f_api_yorum_ekle);
// endregion

//region KULLANICI TAHTALARI
r.route('/kullanicilar/:Kul_Id(\\d+)/tahtalar')
    .all(function (_q, _r, next) {
        extensions.ssg = _q.session.ss.kullanici;

        if (!_q.params.Kul_Id) {
            next(mesaj[_q.method]._400(null));
        }

        if (_q.params.Kul_Id != _q.session.ss.kullanici.Id) {
            next(mesaj[_q.method]._403(null));
        }

        switch (_q.method.toLowerCase()) {
            case "get":
                // 1. kullanicinin tahtalarini cekmesi gerekiyor, doğrudan next()
                break;
            case "post":
                console.log("Post ile tahta ekleyecek");
                var f_idlerDenkmi = function (_q, _r, next) {
                    // Yeni Tahta nesnesinin içindeki Kullanici.Id == session'daki kullanici_id aynı mı?
                    if (_q.body.Kullanicilar[0].Id != _q.session.ss.kullanici.Id) {
                        next(mesaj.POST._401(null, "Tahta oluşturma"));
                    } else {
                        // Her şey yolunda, sonraki çalışsın
                        console.log("Her şey yolunda, sonraki çalışsın");
                        next();
                    }
                };

                // Yeni Tahta nesnesi valid mi?
                schema.f_suz_dogrula_cevapla(_q, _r, next, schema.SCHEMA.INDEX_TAHTA, _q.body);
                break;
        }
        next();
    })
    //her kullanıcının tahtalarını değil, sadece session'ı olan kullanıcı tahtalarını çekebilmeli
    .get(v1.kullanici.f_api_kullanici_tahtalari)
    .post(v1.kullanici.f_api_kullanici_tahta_ekle);

r.route('/kullanicilar/:Kul_Id(\\d+)/tahtalar/:Tahta_Id(\\d+)/ayril')
    .all(function (_q, _r, next) {
        if (_q.params.Kul_Id && _q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Id ler bulunamadı!\"}");
        }
    })
    .delete(v1.kullanici.f_api_kullanici_tahtadan_ayril);


r.route('/kullanicilar/:Kul_Id(\\d+)/tahtalar/:Tahta_Id(\\d+)')
    .all(function (_q, _r, next) {

        if (!_q.params.Kul_Id) {
            next(mesaj[_q.method]._400(null));
        }

        if (!_q.params.Tahta_Id) {
            next(mesaj[_q.method]._400(null));
        }

        if (_q.params.Kul_Id != _q.session.ss.kullanici.Id) {
            next(mesaj[_q.method]._403(null));
        }

        switch (_q.method.toLowerCase()) {
            case "delete":
                // 1. kullanicinin tahtalarini cekmesi gerekiyor, doğrudan next()
                next();
                break;
            case "put":
                next();
                break;
        }
    })
    .delete(v1.kullanici.f_api_kullanici_tahta_sil)
    .put(v1.kullanici.f_api_kullanici_tahta_guncelle);

// endregion

// endregion

//region HABERLER > Tahta, Kullanici
//region TAHTA HABERLERİ
r.route('/tahtalar/:Tahta_Id(\\d+)/haberler')
    .all(function (_q, _r, next) {

        var tahta_id = _q.params.Tahta_Id;
        if (!tahta_id) {
            next(mesaj[_q.method]._400(null));
        }

        switch (_q.method.toLowerCase()) {
            case "get":

                /** @type {Yetki} */
                var yetki = {haber: {r: true}};
                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });
                break;
            case "post":

                /** @type {Yetki} */
                var yetki = {haber: {c: true}};

                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });

                schema.f_suz_dogrula_cevapla(_q, _r, next, schema.SCHEMA.HABER, _q.body);
                break;
        }
        next();

    })
    .post(v1.tahta.f_api_tahta_haber_ekle)
    .get(v1.tahta.f_api_tahta_haber_tumu);


r.route('/tahtalar/:Tahta_Id(\\d+)/haberler/:Haber_Id(\\d+)')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id && _q.params.Haber_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Id ler bulunamadı!\"}");
        }
    })
    .put(v1.tahta.f_api_tahta_haber_guncelle)
    .delete(v1.tahta.f_api_tahta_haber_sil);
// endregion

//region KULLANICI HABERLERİ
r.route('/kullanicilar/:Kul_Id(\\d+)/haberler')
    .all(function (_q, _r, next) {
        if (_q.params.Kul_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Kullanıcı Id bulunamadı!\"}");
        }
    })
    .get(v1.kullanici.f_api_kullanici_haber_tumu);


r.route('/kullanicilar/:Kul_Id(\\d+)/haberler/:Haber_Id(\\d+)')
    .all(function (_q, _r, next) {
        if (_q.params.Kul_Id && _q.params.Haber_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Id ler bulunamadı!\"}");
        }
    })
    .put(v1.kullanici.f_api_kullanici_haber_guncelle)
    .delete(v1.kullanici.f_api_kullanici_haber_sil);

// endregion

//region KULLANICI GÖREV-DİKKAT-İLETİ
r.route('/kullanicilar/:Kul_Id(\\d+)/bildirimler')
    .all(function (_q, _r, next) {
        if (_q.params.Kul_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Kullanıcı Id bulunamadı!\"}");
        }
    })
    .get(v1.kullanici.f_api_kullanici_bildirim_tumu);

r.route('/kullanicilar/:Kul_Id(\\d+)/gorevler')
    .all(function (_q, _r, next) {
        if (_q.params.Kul_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Kullanıcı Id bulunamadı!\"}");
        }
    })
    .get(v1.kullanici.f_api_kullanici_gorev_son_detayi_ile);

r.route('/kullanicilar/:Kul_Id(\\d+)/gorevler/:Gorev_Id')
    .all(function (_q, _r, next) {
        if (_q.params.Kul_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Kullanıcı Id bulunamadı!\"}");
        }
    })
    .get(v1.kullanici.f_api_kullanici_gorev_id)
    .put(v1.kullanici.f_api_kullanici_gorev_guncelle);

r.route('/kullanicilar/:Kul_Id(\\d+)/gorevler/:Gorev_Id/detaylar')
    .all(function (_q, _r, next) {
        if (_q.params.Kul_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Kullanıcı Id bulunamadı!\"}");
        }
    })
    .get(v1.kullanici.f_api_kullanici_gorev_detay)
    .post(v1.kullanici.f_api_kullanici_gorev_detay_ekle);


r.route('/kullanicilar/:Kul_Id(\\d+)/dikkat/:Dikkat_Id')
    .all(function (_q, _r, next) {
        if (_q.params.Kul_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Kullanıcı Id bulunamadı!\"}");
        }
    })
    .put(v1.kullanici.f_api_kullanici_dikkat_guncelle)
    .delete(v1.kullanici.f_api_kullanici_dikkat_sil);

r.route('/kullanicilar/:Kul_Id(\\d+)/ileti/:Ileti_Id')
    .all(function (_q, _r, next) {
        if (_q.params.Kul_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Kullanıcı Id bulunamadı!\"}");
        }
    })
    .put(v1.kullanici.f_api_kullanici_ileti_guncelle)
    .delete(v1.kullanici.f_api_kullanici_ileti_sil);

/*r.route('/kullanicilar/:Kul_Id(\\d+)/dikkat/:Eklenen/:Okunan/:Silinen')
 .all(function (_q, _r, next) {
 if (_q.params.Kul_Id) {
 next();
 } else {
 _r.status(410).send("{\"message\":\"Kullanıcı Id bulunamadı!\"}");
 }
 })
 .get(v1.kullanici.f_api_kullanici_dikkat_tumu);

 r.route('/kullanicilar/:Kul_Id(\\d+)/ileti/:Eklenen/:Okunan/:Silinen')
 .all(function (_q, _r, next) {
 if (_q.params.Kul_Id) {
 next();
 } else {
 _r.status(410).send("{\"message\":\"Kullanıcı Id bulunamadı!\"}");
 }
 })
 .get(v1.kullanici.f_api_kullanici_ileti_tumu);*/

// endregion

// endregion

//region TAHTALAR > kurumlar, urunler, anahtarlar, ihaleler, indeksle
r.route('/tahtalar/:Tahta_Id(\\d+)')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Tahta Id bulunamadı!\"}");
        }
    })
    .get(v1.tahta.f_api_tahta_id);

//region KURUM İŞLEMLERİ(ekle-güncelle-sil-getir)
r.route('/tahtalar/:Tahta_Id(\\d+)/kurumlar')
    .all(function (_q, _r, next) {
        var tahtaId = _q.params.Tahta_Id;
        if (!tahtaId) {
            next(mesaj[_q.method]._400(null));
        }
        if (tahtaId) {
            switch (_q.method.toLowerCase()) {
                case "get":

                    /** @type {Yetki} */
                    var yetki = {firma: {r: true}};
                    ortak.f_kullanici_yetkilimi({
                        q: _q,
                        r: _r,
                        n: next,
                        tahta_id: tahtaId,
                        yetki: yetki
                    });
                    break;
                case "post":

                    /** @type {Yetki} */
                    var yetki = {firma: {c: true}};

                    extensions.ssg = [{"_q.session.ss.kullanici": _q.session.ss.kullanici}];
                    extensions.ssr = [{"yetki": yetki}];
                    ortak.f_kullanici_yetkilimi({
                        q: _q,
                        r: _r,
                        n: next,
                        tahta_id: tahtaId,
                        yetki: yetki
                    });

                    /** @type {Kurum} */
                    schema.f_suz_dogrula_cevapla(_q, _r, next, schema.SCHEMA.KURUM, _q.body);
                    break;
            }
        }

        next();
    })
    .get(v1.kurum.f_api_kurum_tumu)
    .post(v1.kurum.f_api_kurum_ekle);

r.route('/kurumlar')
    .get(v1.kurum.f_api_kurum_tumu_genel);

r.route('/tahtalar/:Tahta_Id(\\d+)/kurumlar/:Kurum_Id(\\d+)/')
    .all(function (_q, _r, next) {
        var kurum_id = _q.params.Kurum_Id,
            tahta_id = _q.params.Tahta_Id;

        if (!tahta_id) {
            next(mesaj[_q.method]._400(null));
        }

        if (!kurum_id) {
            next(mesaj[_q.method]._400(null));
        }

        switch (_q.method.toLowerCase()) {
            case "get":

                /** @type {Yetki} */
                var yetki = {firma: {r: true}};
                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });
                break;
            case "put":

                /** @type {Yetki} */
                var yetki = {firma: {u: true}};

                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });

                /** @type {Kurum} */
                schema.f_suz_dogrula_cevapla(_q, _r, next, schema.SCHEMA.KURUM, _q.body);
                break;
            case "delete":

                /** @type {Yetki} */
                var yetki = {firma: {d: true}};
                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });
                break;
        }
        next();
    })
    .get(v1.kurum.f_api_kurum_id)
    .put(v1.kurum.f_api_kurum_guncelle)
    .delete(v1.kurum.f_api_kurum_sil);

// endregion

//region KURUMUN ÜRÜNLERİ
r.route('/tahtalar/:Tahta_Id(\\d+)/kurumlar/:Kurum_Id(\\d+)/urunler')
    .all(function (_q, _r, next) {
        if (_q.params.Kurum_Id && _q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Kurum ve Tahta Id bulunamadı!\"}");
        }
    })
    .get(v1.kurum.f_api_kurum_urun_tumu);

// endregion

//region TAHTANIN ÜRÜNLERİ(ekle-sil-güncelle-getir)
r.route('/tahtalar/:Tahta_Id(\\d+)/urunler')
    .all(function (_q, _r, next) {

        var tahta_id = _q.params.Tahta_Id;
        if (!tahta_id) {
            next(mesaj[_q.method]._400(null));
        }

        switch (_q.method.toLowerCase()) {
            case "get":

                /** @type {Yetki} */
                var yetki = {urun: {r: true}};
                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });
                break;
            case "post":

                /** @type {Yetki} */
                var yetki = {urun: {c: true}};

                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });

                schema.f_suz_dogrula_cevapla(_q, _r, next, schema.SCHEMA.URUN, _q.body);
                break;
        }
        next();
    })
    .get(v1.urun.f_api_urun_tumu)
    .post(v1.urun.f_api_urun_ekle);

r.route('/tahtalar/:Tahta_Id(\\d+)/urunler/:Urun_Id(\\d+)/')
    .all(function (_q, _r, next) {

        var urun_id = _q.params.Urun_Id,
            tahta_id = _q.params.Tahta_Id;

        if (!tahta_id) {
            next(mesaj[_q.method]._400(null));
        }

        if (!urun_id) {
            next(mesaj[_q.method]._400(null));
        }

        switch (_q.method.toLowerCase()) {
            case "get":

                /** @type {Yetki} */
                var yetki = {urun: {r: true}};
                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });
                break;
            case "put":

                /** @type {Yetki} */
                var yetki = {urun: {u: true}};

                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });

                schema.f_suz_dogrula_cevapla(_q, _r, next, schema.SCHEMA.URUN, _q.body);
                break;
            case "delete":

                /** @type {Yetki} */
                var yetki = {urun: {d: true}};
                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });
                break;
        }
        next();

    })
    .get(v1.urun.f_api_urun_id)
    .put(v1.urun.f_api_urun_guncelle)
    .delete(v1.urun.f_api_urun_sil);

// endregion

//region ÜRÜNÜN TEKLİFLERİ
r.route('/tahtalar/:Tahta_Id(\\d+)/urunler/:Urun_Id(\\d+)/teklifler')
    .all(function (_q, _r, next) {
        if (_q.params.Urun_Id && _q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Id ler bulunamadı!\"}");
        }
    })
    .get(v1.tahta.f_api_tahta_urun_teklifleri);

// endregion

//region ÜRÜN ANAHTAR
r.route('/tahtalar/:Tahta_Id/urunler/:Urun_Id/anahtarlar')
    .all(function (_q, _r, next) {
        if (_q.params.Urun_Id && _q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Kurum ve Tahta Id bulunamadı!\"}");
        }
    })
    .get(v1.urun.f_api_urun_anahtar_tumu)
    .post(v1.urun.f_api_urun_anahtar_ekle);


r.route('/tahtalar/:Tahta_Id/urunler/:Urun_Id/anahtarlar/:Anahtar_Id')
    .all(function (_q, _r, next) {
        if (_q.params.Urun_Id && _q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Kurum ve Tahta Id bulunamadı!\"}");
        }
    })
    .delete(v1.urun.f_api_urun_anahtar_sil);

// endregion

//region ÜRÜNLE İLİŞKİLİ KURUMLAR
r.route('/tahtalar/:Tahta_Id(\\d+)/urunler/:Urun_Id(\\d+)/kurumlar/')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id && _q.params.Urun_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Id ler bulunamadı!\"}");
        }
    })
    .get(v1.urun.f_api_urun_iliskili_kurum_tumu);


r.route('/tahtalar/:Tahta_Id(\\d+)/urunler/:Urun_Id(\\d+)/kurumlar/:Kurum_Id(\\d+)')
    .all(function (_q, _r, next) {
        if (_q.params.Urun_Id && _q.params.Tahta_Id && _q.params.Kurum_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Id ler bulunamadı!\"}");
        }
    })
    .delete(v1.urun.f_api_urun_iliskili_kurum_sil)
    .post(v1.urun.f_api_urun_iliskili_kurum_ekle);

// endregion

//region TAHTA ANAHTAR
r.route('/tahtalar/:Tahta_Id(\\d+)/anahtarlar')
    .get(v1.tahta.f_api_tahta_anahtar_tumu)
    .post(v1.tahta.f_api_tahta_anahtar_ekle);


r.route('/tahtalar/:Tahta_Id(\\d+)/anahtarlar/:Anahtar_Id')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Tahta Id bulunamadı!\"}");
        }
    })
    .delete(v1.tahta.f_api_tahta_anahtar_sil);
// endregion


//region TAHTANIN İHALE RAPOR DETAYLARI

r.route('/tahtalar/:Tahta_Id(\\d+)/ihaleler/raporlar')
    .get(v1.tahta.f_api_tahta_ihale_rapor_bilgileri);
// endregion


//region TAHTA AJANDASI

r.route('/tahtalar/:Tahta_Id(\\d+)/ajandalar')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Tahta Id bulunamadı!\"}");
        }
    })
    .get(v1.tahta.f_api_tahta_ajanda)
    .post(v1.tahta.f_api_tahta_ajanda_ekle)
    .delete(v1.tahta.f_api_tahta_ajanda_sil);

// endregion

//region İHALE KALEMLERİ
r.route('/tahtalar/:Tahta_Id(\\d+)/ihaleler/:Ihale_Id(\\d+)/satirlar/:Satir_Id(\\d+)')
    .all(function (_q, _r, next) {

        var ihale_id = _q.params.Ihale_Id,
            satir_id = _q.params.Satir_Id,
            tahta_id = _q.params.Tahta_Id;

        if (!tahta_id) {
            next(mesaj[_q.method]._400(null));
        }

        if (!ihale_id) {
            next(mesaj[_q.method]._400(null));
        }

        if (!satir_id) {
            next(mesaj[_q.method]._400(null));
        }

        switch (_q.method.toLowerCase()) {
            case "get":

                /** @type {Yetki} */
                var yetki = {kalem: {r: true}};
                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });
                break;
            case "put":

                /** @type {Yetki} */
                var yetki = {kalem: {u: true}};


                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });

                schema.f_suz_dogrula_cevapla(_q, _r, next, schema.SCHEMA.KALEM, _q.body);
                break;
            case "delete":

                /** @type {Yetki} */
                var yetki = {kalem: {d: true}};
                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });
                break;
        }
        next();

    })
    .get(v1.kalem.f_api_kalem_id)
    .put(v1.kalem.f_api_kalem_guncelle)
    .delete(v1.kalem.f_api_kalem_sil);

r.route('/tahtalar/:Tahta_Id(\\d+)/ihaleler/:Ihale_Id(\\d+)/satirlar/tumu')
    .all(function (_q, _r, next) {

        var ihale_id = _q.params.Ihale_Id,
            tahta_id = _q.params.Tahta_Id;

        if (!tahta_id) {
            next(mesaj[_q.method]._400(null));
        }

        if (!ihale_id) {
            next(mesaj[_q.method]._400(null));
        }

        switch (_q.method.toLowerCase()) {
            case "get":

                /** @type {Yetki} */
                var yetki = {kalem: {r: true}};
                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });
                break;
            case "post":

                /** @type {Yetki} */
                var yetki = {kalem: {c: true}};

                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });

                schema.f_suz_dogrula_cevapla(_q, _r, next, schema.SCHEMA.KALEM, _q.body);
                break;
        }
        next();

    })
    .get(v1.tahta.f_api_tahta_ihale_satir_tumu);

r.route('/tahtalar/:Tahta_Id(\\d+)/ihaleler/:Ihale_Id(\\d+)/satirlar')
    .all(function (_q, _r, next) {

        var ihale_id = _q.params.Ihale_Id,
            tahta_id = _q.params.Tahta_Id;

        if (!tahta_id) {
            next(mesaj[_q.method]._400(null));
        }

        if (!ihale_id) {
            next(mesaj[_q.method]._400(null));
        }

        switch (_q.method.toLowerCase()) {
            case "get":

                /** @type {Yetki} */
                var yetki = {kalem: {r: true}};
                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });
                break;
            case "post":

                /** @type {Yetki} */
                var yetki = {kalem: {c: true}};


                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });

                schema.f_suz_dogrula_cevapla(_q, _r, next, schema.SCHEMA.KALEM, _q.body);
                break;
        }
        next();

    })
    .get(v1.tahta.f_api_tahta_ihale_satirlari_sayfali)
    .post(v1.kalem.f_api_kalem_ekle);

// endregion

//region KALEM ONAY

r.route('/tahtalar/:Tahta_Id(\\d+)/ihaleler/:Ihale_Id(\\d+)/satirlar/:Satir_Id(\\d+)/onaylar')
    .all(function (_q, _r, next) {
        if (_q.params.Ihale_Id && _q.params.Satir_Id && _q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Id ler bulunamadı!\"}");
        }
    })
    .put(v1.kalem.f_api_kalem_onay_durum_guncelle);

r.route('/tahtalar/:Tahta_Id(\\d+)/satirlar/:Satir_Id(\\d+)/onaylar')
    .all(function (_q, _r, next) {
        if (_q.params.Satir_Id && _q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Id ler bulunamadı!\"}");
        }
    })
    .get(v1.kalem.f_api_kalem_onay_durumu);

// endregion

//region İHALEYE KATILAN KURUMLAR
r.route('/tahtalar/:Tahta_Id(\\d+)/ihaleler/:Ihale_Id(\\d+)/katilan/kurumlar')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id && _q.params.Ihale_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"İhale ve Tahta Id bulunamadı!\"}");
        }
    })
    .get(v1.ihale.f_api_ihale_kurum_tumu);

// endregion

//region TAHTANIN İHALELERİ

//r.route('/tahtalar/:Tahta_Id(\\d+)/ihaleler?sort=:Siralama&page=:Page&per_page=:Per_page&baslangic=:Tarih1&bitis=:Tarih2')
r.route('/tahtalar/:Tahta_Id(\\d+)/ihaleler')
    .all(function (_q, _r, next) {

        var tahta_id = _q.params.Tahta_Id;
        if (!tahta_id) {
            next(mesaj[_q.method]._400(null));
        }

        switch (_q.method.toLowerCase()) {
            case "get":

                /** @type {Yetki} */
                var yetki = {ihale: {r: true}};
                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });
                break;
            case "post":

                /** @type {Yetki} */
                var yetki = {ihale: {c: true}};
                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });
                schema.f_suz_dogrula_cevapla(_q, _r, next, schema.SCHEMA.IHALE, _q.body);
                break;
        }
        next();
    })
    .get(v1.tahta.f_api_tahta_ihaleleri)
    .post(v1.tahta.f_api_tahta_ihale_ekle);


r.route('/tahtalar/:Tahta_Id(\\d+)/ihaleler/:Ihale_Id(\\d+)')
    .all(function (_q, _r, _next) {
        var tahta_id = _q.params.Tahta_Id,
            ihale_id = _q.params.Ihale_Id;

        if (!tahta_id) {
            _next(mesaj[_q.method]._400(null));
        }

        if (!ihale_id) {
            _next(mesaj[_q.method]._400(null));
        }

        switch (_q.method.toLowerCase()) {
            case "get":

                /** @type {Yetki} */
                var yetki = {ihale: {r: true}};
                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: _next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });
                break;
            case "put":

                /** @type {Yetki} */
                var yetki = {ihale: {u: true}};
                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: _next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });

                schema.f_suz_dogrula_cevapla(_q, _r, _next, schema.SCHEMA.IHALE, _q.body);
                break;
            case "delete":

                /** @type {Yetki} */
                var yetki = {ihale: {d: true}};
                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: _next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });
                break;
        }
        _next();
    })
    .get(v1.ihale.f_api_tahta_ihale_id)
    .put(v1.tahta.f_api_tahta_ihale_guncelle)
    .delete(v1.tahta.f_api_tahta_ihale_sil);


r.route('/tahtalar/:Tahta_Id(\\d+)/gizlenen')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Tahta_Id bulunamadı!\"}");
        }
    })
    .get(v1.tahta.f_api_tahta_gizlenen_tumu);

r.route('/tahtalar/:Tahta_Id(\\d+)/ihaleler/:Ihale_Id(\\d+)/gizlenen')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id && _q.params.Ihale_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Id ler bulunamadı!\"}");
        }
    })
    .post(v1.tahta.f_api_tahta_ihale_gizlenen_ekle)
    .delete(v1.tahta.f_api_tahta_ihale_gizlenen_sil);

r.route('/tahtalar/:Tahta_Id(\\d+)/kurumlar/:Kurum_Id(\\d+)/gizlenen')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id && _q.params.Kurum_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Id ler bulunamadı!\"}");
        }
    })
    .post(v1.tahta.f_api_tahta_kurum_gizlenen_ekle)
    .delete(v1.tahta.f_api_tahta_kurum_gizlenen_sil);

r.route('/tahtalar/:Tahta_Id(\\d+)/satirlar/:Satir_Id(\\d+)/gizlenen')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id && _q.params.Satir_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Id ler bulunamadı!\"}");
        }
    })
    .post(v1.tahta.f_api_tahta_kalem_gizlenen_ekle)
    .delete(v1.tahta.f_api_tahta_kalem_gizlenen_sil);


r.route('/tahtalar/:Tahta_Id(\\d+)/ihaleler/takip')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Tahta_Id bulunamadı!\"}");
        }
    })
    .get(v1.tahta.f_api_tahta_ihale_takip_tumu);

r.route('/tahtalar/:Tahta_Id(\\d+)/ihaleler/:Ihale_Id(\\d+)/takip')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id && _q.params.Ihale_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Id ler bulunamadı!\"}");
        }
    })
    .post(v1.tahta.f_api_tahta_ihale_takip_ekle)
    .delete(v1.tahta.f_api_tahta_ihale_takip_sil);

r.route('/tahtalar/:Tahta_Id(\\d+)/satirlar/takip')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Tahta_Id bulunamadı!\"}");
        }
    })
    .get(v1.kalem.f_api_kalem_takip_tumu);

r.route('/tahtalar/:Tahta_Id(\\d+)/satirlar/:Satir_Id(\\d+)/takip')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id && _q.params.Satir_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Id ler bulunamadı!\"}");
        }
    })
    .post(v1.kalem.f_api_kalem_takip_ekle)
    .delete(v1.kalem.f_api_kalem_takip_sil);


r.route('/tahtalar/:Tahta_Id(\\d+)/ihaleler/:Ihale_Id(\\d+)/kurumlar/:Kurum_Id(\\d+)')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id && _q.params.Ihale_Id && _q.params.Kurum_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Id ler bulunamadı!\"}");
        }
    })
    .put(v1.ihale.f_api_ihale_yapan_kurumu_guncelle);

r.route('/tahtalar/:Tahta_Id(\\d+)/ihaleler/yapilma/:Tarih1/:Tarih2')
    .all(function (_q, _r, next) {
        if (_q.params.Tarih1 && _q.params.Tarih2 && _q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Tarihler bulunamadı!\"}");
        }
    })
    .get(v1.ihale.f_api_ihale_yapilmaTarihineGore);

r.route('/tahtalar/:Tahta_Id(\\d+)/indeksle')
    .get(v1.ihale.f_api_ihale_tumu_tahta_anahtarKelimelerine);

r.route('/tahtalar/:Tahta_Id(\\d+)/ihaleler/indeksle')
    .get(v1.ihale.f_api_ihale_tumu_tahta_indeks_anahtar);

r.route('/tahtalar/:Tahta_Id(\\d+)/ihaleler/:Ihale_Id(\\d+)/satirlar/indeksle')
    .get(v1.kalem.f_api_kalem_tumu_tahta_indeks_anahtar);
// endregion

// endregion

//region TEKLIFLER(ekle-güncelle-sil-getir)

r.route('/tahtalar/:Tahta_Id(\\d+)/teklifler')
    .all(function (_q, _r, next) {

        var tahta_id = _q.params.Tahta_Id;
        if (!tahta_id) {
            next(mesaj[_q.method]._400(null));
        }

        switch (_q.method.toLowerCase()) {

            case "post":

                /** @type {Yetki} */
                var yetki = {teklif: {c: true}};

                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });

                schema.f_suz_dogrula_cevapla(_q, _r, next, schema.SCHEMA.TEKLIF, _q.body);
                break;
        }
        next();
    })
    .post(v1.tahta.f_api_tahta_teklif_ekle);

r.route('/tahtalar/:Tahta_Id(\\d+)/teklifler/:Teklif_Id(\\d+)')
    .all(function (_q, _r, next) {

        var teklif_id = _q.params.Teklif_Id,
            tahta_id = _q.params.Tahta_Id;

        if (!tahta_id) {
            next(mesaj[_q.method]._400(null));
        }

        if (!teklif_id) {
            next(mesaj[_q.method]._400(null));
        }

        switch (_q.method.toLowerCase()) {
            case "get":

                /** @type {Yetki} */
                var yetki = {teklif: {r: true}};
                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });
                break;
            case "put":

                /** @type {Yetki} */
                var yetki = {teklif: {u: true}};

                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });

                schema.f_suz_dogrula_cevapla(_q, _r, next, schema.SCHEMA.TEKLIF, _q.body);
                break;
            case "delete":

                /** @type {Yetki} */
                var yetki = {teklif: {d: true}};
                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });
                break;
        }
        next();
    })
    .get(v1.tahta.f_api_tahta_teklif_id)
    .put(v1.tahta.f_api_tahta_teklif_guncelle)
    .delete(v1.tahta.f_api_tahta_teklif_sil);

r.route('/tahtalar/:Tahta_Id(\\d+)/teklifler/:Teklif_Id(\\d+)/onaylar/:OnayDurum_Id')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id && _q.params.Teklif_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Id ler bulunamadı!\"}");
        }
    })
    .put(v1.tahta.f_api_tahta_teklif_durum_guncelle);


r.route('/tahtalar/:Tahta_Id(\\d+)/kurumlar/:Kurum_Id(\\d+)/teklifler')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id && _q.params.Kurum_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Id ler bulunamadı!\"}");
        }
    })
    .get(v1.tahta.f_api_tahta_kurum_teklifleri);


r.route('/tahtalar/:Tahta_Id(\\d+)/ihaleler/:Ihale_Id(\\d+)/teklifler')
    .all(function (_q, _r, next) {
        if (_q.params.Ihale_Id && _q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"İhale ve Tahta Id bulunamadı!\"}");
        }
    })
    .get(v1.tahta.f_api_tahta_ihale_teklif_tumu);

r.route('/tahtalar/:Tahta_Id(\\d+)/satirlar/:Satir_Id(\\d+)/teklifler')
    .all(function (_q, _r, next) {
        if (_q.params.Ihale_Id && _q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"İhale ve Tahta Id bulunamadı!\"}");
        }
    })
    .get(v1.tahta.f_api_tahta_kalem_teklif_tumu);


r.route('/tahtalar/:Tahta_Id(\\d+)/kurumlar/:Kurum_Id(\\d+)/urunler/:Urun_Id/teklifler')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id && _q.params.Kurum_Id && _q.params.Urun_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Id'ler bulunamadı!\"}");
        }
    })
    .get(v1.kurum.f_api_kurumun_urune_verdigi_teklifler);

// endregion

//region UYELER
r.route('/tahtalar/:Tahta_Id(\\d+)/uyeler')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Tahta Id bulunamadı!\"}");
        }
    })
    .get(v1.tahta.f_api_tahta_uyeleri_tumu)
    .post(v1.tahta.f_api_tahta_uye_ekle);


r.route('/tahtalar/:Tahta_Id(\\d+)/uyeler/:Uye_Id(\\d+)')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Tahta ve Üye Id bulunamadı!\"}");
        }
    })
    .delete(v1.tahta.f_api_tahta_uye_sil)
    .put(v1.tahta.f_api_tahta_uye_guncelle);


r.route('/tahtalar/:Tahta_Id(\\d+)/uyeler/:Uye_Id(\\d+)/roller/:Rol_Id(\\d+)')
    .all(function (_q, _r, next) {
        console.log("all içinde method:" + _q.method);
        switch (_q.method.toLowerCase()) {
            case "get":
            case "post":
            case "put":
            case "delete":
                console.log("Kullanıcı içinden rol silinecek, all içinde ilk validasyon");
                if (!_q.params.Tahta_Id) {
                    _r.status(400).send(mesaj.POST._400(null, "Rol İşlemi", null));
                }

            case "delete":
                break;
        }
        next();
    })
    .delete(v1.rol.f_api_rol_sil_uyeden);

r.route('/tahtalar/:Tahta_Id(\\d+)/uyeler/:Uye_Id(\\d+)/roller')
    .all(function (_q, _r, next) {

        var tahta_id = _q.params.Tahta_Id;
        if (!tahta_id) {
            next(mesaj[_q.method]._400(null));
        }

        switch (_q.method.toLowerCase()) {
            case "post":

                /** @type {Yetki} */
                var yetki = {uyeRolleri: {c: true}};

                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });

                break;
            case "put":

                /** @type {Yetki} */
                var yetki = {uyeRolleri: {u: true}};

                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahta_id,
                    yetki: yetki
                });

                break;
        }
        next();
    })
    .put(v1.tahta.f_api_tahta_uye_rol_guncelle)
    .post(v1.tahta.f_api_tahta_uye_rol_guncelle);

//ROLLER TAZELE
r.route('/roller/tazele')
    .get(v1.tahta.f_api_rolleri_tazele);
// endregion

//region KURLAR
r.route('/dovizler/:ParaBirim_Id/:KurTipi_Id/:Tarih1/:Tarih2')
    .get(v1.tahta.f_api_doviz_kurlari_getir_tarih_araligindaki);

r.route('/dovizler/tazele')
    .get(v1.tahta.f_api_doviz_kurlari_tazele);
// endregion

//region ÜRÜNLERİ jsondan çek ve ekle
r.route('/tahtalar/:Tahta_Id(\\d+)/urunler/tazele/:Kurum_Id')
    .get(v1.tahta.f_api_urunleri_tazele);

// endregion

//region DAVETLER
r.route('/tahtalar/:Tahta_Id(\\d+)/davetler')
    .all(function (_q, _r, next) {
        var tahtaId = _q.params.Tahta_Id;
        if (!tahtaId) {
            next(mesaj[_q.method]._400(null));
        }

        switch (_q.method.toLowerCase()) {
            case "post":


                var /** @type {Yetki} */
                    yetki = {davet: {c: true}},
                    /** @type {UyeDavet} */
                    yeniDavet = _q.body,
                    valErr = schema.f_suz_dogrula(schema.SCHEMA.UYE_DAVET, yeniDavet);

                if (valErr) {
                    extensions.ssr = [{"valErr": valErr}];
                    console.error("Davet için validasyon hatası alındı.");
                    var msj = mesaj[_q.method]._400(null);
                    next(msj);
                }

                console.log("Davet ile ilgili YETKİ işlemi yapacağız... > ", yetki);

                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahtaId,
                    yetki: yetki
                });
                break;
        }
        next();
    })
    .get(v1.tahta.f_api_tahta_davetleri)
    .post(v1.tahta.f_api_tahta_davet_ekle);


r.route('/tahtalar/:Tahta_Id(\\d+)/davetler/:Davetli')
    .all(function (_q, _r, next) {
        var tahtaId = _q.params.Tahta_Id;
        if (!tahtaId) {
            next(mesaj[_q.method]._400(null));
        }

        switch (_q.method.toLowerCase()) {
            case "delete":

                /** @type {Yetki} */
                var yetki = {davet: {d: true}};

                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: tahtaId,
                    yetki: yetki
                });
                break;
        }

        next();
    })
    .delete(v1.tahta.f_api_tahta_davet_sil);
// endregion

//region ROLLER


r.route('/tahtalar/:Tahta_Id(\\d+)/roller')
    .all(function (_q, _r, next) {
        console.log("all içinde method:" + _q.method);

        if (!_q.params.Tahta_Id) {
            next(mesaj.POST._400(null, "Rol İşlemi", null));
        }

        switch (_q.method.toLowerCase()) {
            case "get":
                // 1: Tahta rollerini çekmeye yetkili mi?
                var yetki = {rol: {r: true}};


                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: _q.params.Tahta_Id,
                    yetki: yetki
                });
                break;
            case "post":
                // 1: Tahtaya rol eklemeye yetkili mi?

                var yetki = {rol: {c: true}};

                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: _q.params.Tahta_Id,
                    yetki: yetki
                });

                // 2: Rol eklenebilecek/güncellenebilecek yapıda mı?
                schema.f_suz_dogrula_cevapla(_q, _r, next, schema.SCHEMA.ROL, _q.body);
                break;
        }

        next();
    })
    .get(v1.rol.f_api_rol_tumu)
    .post(v1.rol.f_api_rol_ekle);

r.route('/tahtalar/:Tahta_Id(\\d+)/roller/:Rol_Id(\\d+)')
    .all(function (_q, _r, next) {

        if (!_q.params.Rol_Id || !_q.params.Tahta_Id) {
            next(mesaj.POST._400(null, "Rol İşlemi", null));
        }

        switch (_q.method.toLowerCase()) {
            case "get":
                // 1: Tahta rollerini çekmeye yetkili mi?
                var yetki = {rol: {r: true}};

                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: _q.params.Tahta_Id,
                    yetki: yetki
                });

                break;
            case "put":
                // 1: Tahtaya rol eklemeye yetkili mi?

                var yetki = {rol: {u: true}};

                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: _q.params.Tahta_Id,
                    yetki: yetki
                });

                // 2: Rol güncellenebilecek yapıda mı?
                schema.f_suz_dogrula_cevapla(_q, _r, next, schema.SCHEMA.ROL, _q.body);
                break;
            case "delete":
                var yetki = {rol: {d: true}};

                ortak.f_kullanici_yetkilimi({
                    q: _q,
                    r: _r,
                    n: next,
                    tahta_id: _q.params.Tahta_Id,
                    yetki: yetki
                });
                break;
        }
        next();
    })
    .get(v1.rol.f_api_rol_by_id)
    .put(v1.rol.f_api_rol_guncelle)
    .delete(v1.rol.f_api_rol_sil_tahtadan);


r.route('/tahtalar/:Tahta_Id(\\d+)/roller/:Rol_Id(\\d+)/bolgeler')
    .get(v1.rol.f_api_rol_bolgeleri)
    .post(v1.rol.f_api_rol_bolgesi_ekle);

r.route('/tahtalar/:Tahta_Id(\\d+)/roller/:Rol_Id(\\d+)/bolgeler/:Bolge_Id(\\d+)')
    .delete(v1.rol.f_api_rol_bolgesi_sil);

// endregion

//region DASHBOARD ÜRÜN GRAFİKLERİ
r.route('/tahtalar/:Tahta_Id(\\d+)/urunler/:Urun_Id(\\d+)/grafikler/ihale')
    .all(function (_q, _r, next) {
        if (_q.params.Tahta_Id && _q.params.Urun_Id) {
            next();
        } else {
            _r.status(410).send("{\"message\":\"Tahta Id bulunamadı!\"}");
        }
    })
    .get(v1.urun.f_api_urunle_teklif_verilen_ihale_sayisi);

// endregion

module.exports = r;