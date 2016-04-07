'use strict';

var /** @type {DBModel} */
    db = require('kuark-db')(),
    schema = require('kuark-schema'),
    extensions = require('kuark-extensions'),
    /** @type {IhaleDunyasi} */
    batch = require('kuark-batch'),
    mesaj = require('./API').API;

/**
 *
 * @returns {APIIhale}
 * @constructor
 */
function APIIhale() {

    // region İHALELERİ ÇEK
    //ihale bilgilerini ihale dünyasından çek
    function f_api_ihale_tazele_id(_q, _r) {
        //_q.session.destroy();

        console.log("tazele");
        console.log(_q.query.ihale_id + " - " + _q.query.top);

        db.redis.dbQ.del(db.redis.kp.temp.ssetKurum);

        //var id = require('../../../batch/ihaleDunyasi/ihaleDunyasi');
        batch.f_ihaleDunyasindanCekRediseEkle(_q.query.ihale_id, _q.query.top)
            .then(function (_ihaleler) {
                _r.status(200).send(mesaj.GET._200(_ihaleler, "İhaleleri çek ve ekle", "İhaleler başarıyla çekildi"));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.GET._500(_err, "İhaleleri çek ve ekle", "İhaleler çekilemedi..." + _err.Icerik));
            });
    }

    //ihale bilgilerini sağlıkbank tan çek
    function f_api_ihale_tazele_sb(_q, _r) {
        //_q.session.destroy();

        var sb = require('../../../batch/saglikbank');
        sb.f_SB_Cek()
            .then(function (_ihaleler) {
                _r.status(200).send(mesaj.GET._200(_ihaleler, "", "İhaleler başarıyla çekildi"));
            }).fail(function () {
            _r.status(500).send(mesaj.GET._500("", "", "İhaleler çekilemedi..."));
        });
    }

    // endregion

    // region İHALEYE KATILAN KURUMLAR

    /*İHALEYE KATILAN KURUMLAR*/
    function f_api_ihale_kurum_tumu(_q, _r) {

        var ihale_id = _q.params.Ihale_Id,
            tahta_id = _q.params.Tahta_Id;

        db.ihale.f_db_ihale_kurum_tumu(tahta_id, ihale_id)
            .then(function (_aktif) {
                _r.status(200).send(mesaj.GET._200(_aktif, "", "İhale kurumları başarıyla çekildi"));

            }).fail(function () {
            _r.status(500).send(mesaj.GET._500("", "", "İhale kurumları çekilemedi..."));
        });
    }

    // endregion

    // region İHALE İNDEKS

    function f_aranan_indeksli_ihale(_tahta_id, arama) {
        return db.tahta.f_db_tahta_ihale_indeksli_idler(_tahta_id)
            .then(function (_ihale_idleri) {
                console.log("elastic için ihale idleri ne geldi,");
                console.log(JSON.stringify(_ihale_idleri));

                var query = {
                    "query": {
                        "filtered": {
                            "query": {
                                "query_string": {"query": "*" + arama.Aranan + "*"}
                            },
                            "filter": {
                                "ids": {
                                    "type": db.elastic.SABIT.TIP.IHALE,
                                    "values": _ihale_idleri.map(function (e) {
                                        return e.toString();
                                    })
                                }
                            }
                        }
                    },
                    "sort": db.elastic.f_sort(arama)
                };

                return db.elastic.f_search({
                    method: "POST",
                    index: db.elastic.SABIT.INDEKS.APP,
                    type: db.elastic.SABIT.TIP.IHALE,
                    size: arama.Sayfalama.SatirSayisi,
                    from: arama.Sayfalama.Sayfa * arama.Sayfalama.SatirSayisi,
                    body: query

                }).then(function (_resp) {

                    var sonuc = schema.f_create_default_object(schema.SCHEMA.LAZY_LOADING_RESPONSE);
                    sonuc.ToplamKayitSayisi = _resp[0].hits.total;

                    var ihaleler = _resp[0].hits.hits.pluckX("_source");
                    return db.ihale.f_db_ihale_takip_kontrol(_tahta_id, ihaleler)
                        .then(function (_ihaleler) {
                            sonuc.Data = _ihaleler;
                            return sonuc;
                        });
                });
            });
    }

    /**
     * Gelen kritere göre lazyload anahtar kelimelerine göre tarihe göre kayıt getirir
     * @param _q
     * @param _r
     */
    function f_api_ihale_tumu_tahta_indeks_anahtar(_q, _r) {

        var tahta_id = _q.params.Tahta_Id;
        (_q.query.q
            ? f_aranan_indeksli_ihale(tahta_id, _q.UrlQuery)
            : db.tahta.f_db_tahta_ihale_indeksli_ihaleler_tarihe_gore_sirali(tahta_id, _q.UrlQuery))
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "", "Tahtanın anahtar kelimelerine göre ihale bilgileri başarıyla çekildi"));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "", "Tahtanın anahtar kelimelerine göre ihale bilgileri çekilemedi..."));
            });
    }

    function f_api_ihale_tumu_tahta_anahtarKelimelerine(_q, _r) {

        if (!_q.query.q) {
            _r.status(500).send(mesaj.GET._500("", "Kriter bilgisi BULUNAMADI.", "Tahtanın anahtar kelimelerine göre ihale bilgileri çekilemedi..."));
        }

        var tahta_id = _q.params.Tahta_Id,
            defer;

        /** @type {OptionsIhale} */
        var opts = {};
        opts.bArrKalemleri = false;
        opts.bYapanKurum = true;
        opts.bTakip = true;

        switch (_q.query.q) {
            case 'grafik1':

                break;
            case 'grafik2':

                break;
            case 'toplam':
                defer = db.tahta.f_db_tahta_ihale_indeksli_toplami(tahta_id);
                break;
            case 'id':
                defer = db.tahta.f_db_tahta_ihale_indeksli_idler(tahta_id);
                break;
            case 'veri':
                defer = db.tahta.f_db_tahta_ihale_indeksli_tahta_anahtarKelimelerineGore(tahta_id, opts);
                break;
            default:
                defer = db.tahta.f_db_tahta_ihale_indeksli_tahta_anahtarKelimelerineGore(tahta_id, opts);
                break;
        }

        defer.then(function (_res) {
            _r.status(200).send(mesaj.GET._200(_res, "", "Tahtanın anahtar kelimelerine göre ihale bilgileri başarıyla çekildi"));
        }).fail(function () {
            _r.status(500).send(mesaj.GET._500("", "", "Tahtanın anahtar kelimelerine göre ihale bilgileri çekilemedi..."));
        });
    }

    // endregion

    // region İHALEYİ YAPAN KURUM

    /**
     * İhaleyi yapan kurum bilgisi
     * @param _q
     * @param _r
     * @returns {*}
     */
    function f_api_ihale_yapan_kurumu(_q, _r) {
        var ihale_id = _q.params.Ihale_Id;

        return db.ihale.f_db_ihale_yapan_kurum(ihale_id)
            .then(function (_dbKurum) {
                _r.status(200).send(mesaj.GET._200(_dbKurum, "", "İhalenin kurumu başarıyla çekildi"));

            }).fail(function () {
                _r.status(500).send(mesaj.GET._500(arguments, "", "İhalenin kurumu çekilemedi..."));
            });
    }

    function f_api_ihale_yapan_kurumu_guncelle(_q, _r) {
        var ihale_id = _q.params.Ihale_Id,
            kurum_id = _q.params.Kurum_Id;

        return db.ihale.f_db_ihale_yapan_kurum_guncelle(ihale_id, kurum_id)
            .then(function (_dbKurum) {
                _r.status(200).send(mesaj.GET._200(_dbKurum, "", "İhalenin kurumu başarıyla çekildi"));

            }).fail(function () {
                _r.status(500).send(mesaj.GET._500(arguments, "", "İhalenin kurumu çekilemedi..."));
            });
    }

    // endregion

    // region TAHTALARLA İHALEYİ PAYLAŞ
    /**
     * Tahtalar arası ihale paylaşımı sağlanır
     * @param _q
     * @param _r
     */
    function f_api_ihale_paylas(_q, _r) {
        var paylas = _q.body;

        db.ihale.f_db_ihale_paylas(paylas)
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "", "Tahtanın ihaleleri başarıyla paylaşıldı."));
            }).fail(function (_err) {
            _r.status(500).send(mesaj.GET._500("", _err.Baslik, "Tahtanın ihaleleri paylaşılamadı!" + _err.Icerik));
        });
    }

    // endregion


    /**
     * Genel ihaleleri getirir.
     * ihale:genel seti çekilir.
     * @returns {*}
     */
    function f_api_ihaleler_genel(_q, _r) {
        var opts = {};
        opts.bArrKalemleri = false;
        opts.bYapanKurum = true;
        opts.bTakip = false;

        return db.ihale.f_db_ihale_tumu_genel(opts)
            .then(function (_ihaleler) {
                _r.status(200).send(mesaj.GET._200(_ihaleler, "", "Genel İhaleler başarıyla çekildi"));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.GET._500(_err, "", "İhaleler çekilemedi..."));
            });
    }

    function f_api_tahta_ihale_id(_q, _r) {
        var id = _q.params.Ihale_Id,
            tahta_id = _q.params.Tahta_Id;

        /** @type {OptionsIhale} */
        var opts = {};
        opts.bArrKalemleri = false;
        opts.bTakip = true;
        opts.bYapanKurum = true;

        db.ihale.f_db_ihale_id(id, tahta_id, opts)
            .then(function (_bulunan) {
                _r.status(200).send(mesaj.GET._200(_bulunan, "", "İhale bilgisi başarıyla çekildi."));
            }).fail(function () {
            _r.status(500).send(mesaj.GET._500("", "", "İhale bilgisi çekilemedi..."));
        });
    }

    function f_api_ihale_yapilmaTarihineGore(_q, _r) {
        var tarih1 = _q.params.Tarih1,
            tarih2 = _q.params.Tarih2,
            tahta_id = _q.params.Tahta_Id;

        db.ihale.f_db_ihale_yapilmaTarihineGore(tarih1, tarih2, tahta_id)
            .then(function (_ihaleler) {
                _r.status(200).send(mesaj.GET._200(_ihaleler, "", "iki tarih aralığına göre ihale bilgileri başarıyla çekildi"));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "", "iki tarih aralığına göre İhaleler çekilemedi!"));
            });
    }


    /**
     * @class APIIhale
     */
    return {
        f_api_ihale_tumu_tahta_indeks_anahtar: f_api_ihale_tumu_tahta_indeks_anahtar,
        f_api_ihale_paylas: f_api_ihale_paylas,
        f_api_ihale_tazele_id: f_api_ihale_tazele_id,
        f_api_ihale_tazele_sb: f_api_ihale_tazele_sb,
        f_api_ihale_yapilmaTarihineGore: f_api_ihale_yapilmaTarihineGore,
        f_api_ihale_yapan_kurumu: f_api_ihale_yapan_kurumu,
        f_api_tahta_ihale_id: f_api_tahta_ihale_id,
        f_api_ihaleler_genel: f_api_ihaleler_genel,
        f_api_ihale_tumu_tahta_anahtarKelimelerine: f_api_ihale_tumu_tahta_anahtarKelimelerine,
        f_api_ihale_kurum_tumu: f_api_ihale_kurum_tumu,
        f_api_ihale_yapan_kurumu_guncelle: f_api_ihale_yapan_kurumu_guncelle
    };
}

module.exports = APIIhale;