'use strict';

var db = require('kuark-db');

/**
 *
 * @returns {APIKurum}
 * @constructor
 */
function APIKurum() {

    // region KURUM LİSTELE

    /**
     * Kurumu elastic den sorgula
     * @param _query
     * @param _arama
     * @returns {*}
     */
    function f_elastic_sorgu(_query, _arama) {
        return elastic.f_search({
            method: "POST",
            index: db.elastic.INDEKS.APP,
            type: db.elastic.TIP.KURUM,
            size: _arama.Sayfalama.SatirSayisi,
            from: _arama.Sayfalama.Sayfa * _arama.Sayfalama.SatirSayisi,
            body: _query
        }).then(function (_resp) {
            var sonuc = schema.f_create_default_object(schema.SCHEMA.LAZY_LOADING_RESPONSE);
            sonuc.ToplamKayitSayisi = _resp[0].hits.total;
            sonuc.Data = _.pluck(_resp[0].hits.hits, "_source");
            return sonuc;
        });
    }

    /**
     * Kurumun ararken elasticten arayacağız
     * @param {int} tahta_id
     * @param {object} arama
     * @returns {*}
     */
    function f_kurum_aranan(tahta_id, arama) {

        if (tahta_id && tahta_id > 0) {

            return db.kurum.f_db_aktif_kurum_idleri(tahta_id)
                .then(function (_kurum_idleri) {
                    console.log(" _kurum_idleri > " + _kurum_idleri);
                    var query = {
                        "query": {
                            "filtered": {
                                "query": {
                                    "query_string": {"query": "*" + arama.Aranan + "*"}
                                },
                                "filter": {
                                    "ids": {
                                        "type": db.elastic.SABIT.TIP.KURUM,
                                        "values": _kurum_idleri.map(function (e) {
                                            return e.toString()
                                        })
                                    }
                                }
                            }
                        },
                        "sort": elastic.f_sort(arama)
                    };
                    return f_elastic_sorgu(query, arama);
                });

        } else {
            var query = {
                "query": {
                    "filtered": {
                        "query": {
                            "query_string": {"query": "*" + arama.Aranan + "*"}
                        }
                    }
                },
                "sort": elastic.f_sort(arama)
            };
            return f_elastic_sorgu(query, arama);
        }
    }

    function f_api_kurum_tumu(_q, _r) {

        (_q.UrlQuery.Aranan
            ? f_kurum_aranan(_q.params.Tahta_Id, _q.UrlQuery)
            : db.kurum.f_db_kurum_tumu(_q.params.Tahta_Id, _q.UrlQuery.Sayfalama))
            .then(function (arr) {
                _r.status(200).send(mesaj.GET._200(arr, "Kurumları listele", "Kurumlar başarıyla çekildi."));
            }).fail(function () {
            _r.status(500).send(mesaj.GET._500([], "Kurumları listele", "Kurumlar çekilemedi!"));
        });
    }

    /**
     * Genel kurumları getir(ihale dünyasından çekilen kurumlar)
     * @param _q
     * @param _r
     */
    function f_api_kurum_tumu_genel(_q, _r) {
        console.log("f_api_kurum_tumu_genel");

        (_q.UrlQuery.Aranan
            ? f_kurum_aranan(_q.params.Tahta_Id, _q.UrlQuery)
            : db.kurum.f_db_kurum_tumu(0, _q.UrlQuery.Sayfalama))
            .then(function (arr) {
                _r.status(200).send(mesaj.GET._200(arr, "Kurumları listele", "Kurumlar başarıyla çekildi."));
            }).fail(function () {
            _r.status(500).send(mesaj.GET._500([], "Kurumları listele", "Kurumlar çekilemedi!"));
        });
    }

    /**
     * Tahtaya ait özel kurum bilgilerini getirir.
     * @param _q
     * @param _r
     */
    function f_api_kurum_tumu_tahta_ozel(_q, _r) {
        var tahta_id = _q.params.Tahta_Id;
        db.kurum.f_db_kurum_tahta_aktif(tahta_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "", "tahtaya ait özel kurumlar bilgisi başarıyla çekildi."));
            }).fail(function (_err) {
            _r.status(500).send(mesaj.GET._500("", _err.Baslik, "tahtaya ait özel kurum bulunamadı!" + _err.Icerik));
        });
    }

    // endregion

    // region KURUM BUL-EKLE-GÜNCELLE-SİL

    function f_api_kurum_id(_q, _r) {
        var id = _q.params.Kurum_Id;

        db.kurum.f_db_kurum_id(id)
            .then(function (_bulunanKurum) {
                _r.status(200).send(mesaj.GET._200(_bulunanKurum, "", "Kurum bilgisi başarıyla çekildi."));
            }).fail(function () {
            _r.status(500).send(mesaj.GET._500("", "", "Kurum bilgisi bulunamadı!"));
        });
    }

    function f_api_kurum_ekle(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            kullanici_id = _q.session.ss.kullanici.Id,
            kurum = _q.body,
            db_kurum = schema.f_suz_klonla(schema.SCHEMA.DB.KURUM, kurum);

        db.kurum.f_db_kurum_ekle(db_kurum, tahta_id, kullanici_id)
            .then(function (_dbKurum) {
                _r.status(201).send(mesaj.POST._201(_dbKurum, "Kurum ekle", "Kurum BAŞARIYLA eklendi."));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.POST._500("", "Kurum ekle", "Kurum bilgisi eklenemedi! HATA:" + _err));
            });
    }

    function f_api_kurum_guncelle(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            kullanici_id = _q.session.ss.kullanici.Id,
            kurum = _q.body,
            db_kurum = schema.f_suz_klonla(schema.SCHEMA.DB.KURUM, kurum),
            es_kurum = schema.f_suz_klonla(schema.SCHEMA.ES.KURUM, kurum);

        db.kurum.f_db_kurum_guncelle(tahta_id, es_kurum, db_kurum, kullanici_id)
            .then(function (_dbKurum) {
                _r.status(200).send(mesaj.PUT._200(_dbKurum, "Kurum güncelle", "Kurum BAŞARIYLA güncellendi."));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.PUT._500(_err, "Kurum güncelle", "Kurum bilgisi güncellenemedi!"));
            });
    }

    function f_api_kurum_sil(_q, _r) {
        var id = _q.params.Kurum_Id,
            tahta_id = _q.params.Tahta_Id,
            kullanici_id = _q.session.ss.kullanici.Id;

        db.cop.f_db_cop_kurum_sil(tahta_id, id, kullanici_id)
            .then(function () {
                _r.status(200).send(mesaj.DELETE._200(id, "Kurum sil", "Kurum Başarıyla silindi."));
            })
            .fail(function (_err) {
                if (_err instanceof exception.yetkisizErisim) {
                    _r.status(405).send(mesaj.DELETE._405("", _err.Baslik, _err.Icerik));
                }
                else {
                    _r.status(400).send(mesaj.DELETE._400("", _err.Baslik, _err.Icerik));
                }
            });
    }

    // endregion

    // region KURUMUN ÜRÜNLERİ
    function f_api_kurum_urun_tumu(_q, _r) {
        var kurum_id = _q.params.Kurum_Id,
            tahta_id = _q.params.Tahta_Id;

        db.kurum.f_db_kurum_urun_tumu(tahta_id, kurum_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "", "kurum ürünleri başarıyla çekildi."));
            }).fail(function (_err) {
            _r.status(500).send(mesaj.GET._500("HATA ALINDI:" + _err, "", "kurum ürünü bulunamadı!"));
        });
    }

    // endregion

    // region KURUMUN ÜRÜNE VERDİĞİ TEKLİFLER

    function f_api_kurumun_urune_verdigi_teklifler(_q, _r) {
        var kurum_id = _q.params.Kurum_Id,
            tahta_id = _q.params.Tahta_Id,
            urun_id = _q.params.Urun_Id,
            adet = _q.query.adet,
            onay_id = _q.query.onay_id,
            para_id = _q.query.para_id,
            tarih1 = _q.query.tarih1,
            tarih2 = _q.query.tarih2,
            kullanici_id = _q.session.ss.kullanici.Id;

        var defer;
        switch (_q.query.q) {
            case 'fiyat':
            {
                defer = db.kurum.f_db_kurumun_urune_verdigi_teklif_fiyatlari(tahta_id, kurum_id, urun_id, adet, para_id, onay_id, tarih1, tarih2);
            }
                break;
            case 'veri':
            {
                defer = db.kurum.f_db_kurumun_urune_verdigi_teklifler(tahta_id, kurum_id, urun_id, adet, para_id, onay_id, tarih1, tarih2);
            }
                break;
            default:
        }

        defer.then(function (_res) {
            _r.status(200).send(mesaj.GET._200(_res, "Kurum teklifleri", "Kurumun ürüne verdiği teklifler başarıyla çekildi"));
        }).fail(function () {
            _r.status(500).send(mesaj.GET._500("", "Kurum teklifleri", "Kurumun ürüne verdiği teklifler çekilemedi..."));
        });
    }
    // endregion

    // region TAHTALAR ARASI KURUM PAYLAŞIMI
    /**
     * Tahtalar arası kurum paylaşımı sağlanır
     * @param _q
     * @param _r
     */
    function f_api_kurum_paylas(_q, _r) {
        var paylas = _q.body;

        db.kurum.f_db_kurum_paylas(paylas)
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "", "Tahtanın kurumları başarıyla paylaşıldı."));
            }).fail(function (_err) {
            _r.status(500).send(mesaj.GET._500("", _err.Baslik, "Tahtanın kurumları paylaşılamadı! " + _err.Icerik));
        });
    }

    // endregion

    /**
     * @class APIKurum
     */
    return {
        f_api_kurumun_urune_verdigi_teklifler: f_api_kurumun_urune_verdigi_teklifler,
        f_api_kurum_tumu: f_api_kurum_tumu,
        f_api_kurum_tumu_genel: f_api_kurum_tumu_genel,
        f_api_kurum_urun_tumu: f_api_kurum_urun_tumu,
        f_api_kurum_id: f_api_kurum_id,
        f_api_kurum_ekle: f_api_kurum_ekle,
        f_api_kurum_guncelle: f_api_kurum_guncelle,
        f_api_kurum_sil: f_api_kurum_sil,
        f_api_kurum_tumu_tahta_ozel: f_api_kurum_tumu_tahta_ozel,
        f_api_kurum_paylas: f_api_kurum_paylas
    };
}

module.exports = APIKurum;