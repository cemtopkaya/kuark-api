'use strict';

var /** @type {DBModel} */
     db = require('kuark-db')(),
    extensions = require('kuark-extensions'),
    exception = require('kuark-istisna'),
    schema = require('kuark-schema'),
    mesaj = require('./API').API;

/**
 *
 * @returns {APIUrun}
 * @constructor
 */
function APIUrun() {

    function f_api_urunle_teklif_verilen_ihale_sayisi(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            urun_id = _q.params.Urun_Id,
            onay_durum_id = _q.query.onay_id,
            para_id = _q.query.para_id,
            tarih1 = _q.query.tarih1,
            tarih2 = _q.query.tarih2;

        db.urun.f_db_urunle_teklif_verilen_ihale_sayisi(tahta_id, urun_id, onay_durum_id, para_id, tarih1, tarih2)
            .then(function (arr) {
                _r.status(200).send(mesaj.GET._200(arr, "Ürünle teklif verilen ihale", "Ürünle katıldığı ihale sayıları başarıyla çekildi."));
            }).fail(function () {
            _r.status(500).send(mesaj.GET._500([], "Ürünle teklif verilen ihale", "Ürünle katıldığı ihale sayıları çekilemedi!"));
        });
    }

    /**
     * Ürünü ararken elastic teki bilgilere göre işlemi gerçekleştireceğiz.     *
     * @param {int} _tahta_id
     * @param {object} _arama
     * @returns {*}
     */
    function f_aranan_urun(_tahta_id, _arama) {

        return db.urun.f_db_urun_aktif_urun_idleri(_tahta_id)
            .then(function (_urun_idleri) {
                console.log("elastic için ürün idleri ne geldi,");
                console.log(JSON.stringify(_urun_idleri));

                var query = {
                    "query": {
                        "filtered": {
                            "query": {
                                "query_string": {"query": "*" + _arama.Aranan + "*"}
                            },
                            "filter": {
                                "ids": {
                                    "type": db.elastic.SABIT.TIP.URUN,
                                    "values": _urun_idleri.map(function (e) {
                                        return e.toString();
                                    })
                                }
                            }
                        }
                    },
                    "sort": db.elastic.f_sort(_arama)
                };

                return db.elastic.f_search({
                    method: "POST",
                    index: db.elastic.SABIT.INDEKS.APP,
                    type: db.elastic.SABIT.TIP.URUN,
                    size: _arama.Sayfalama.SatirSayisi,
                    from: _arama.Sayfalama.Sayfa * _arama.Sayfalama.SatirSayisi,
                    body: query

                }).then(function (_resp) {

                    var sonuc = schema.f_create_default_object(schema.SCHEMA.LAZY_LOADING_RESPONSE);
                    sonuc.ToplamKayitSayisi = _resp[0].hits.total;
                    sonuc.Data = _resp[0].hits.hits.pluckX("_source");

                    return sonuc;
                });
            });
    }

    // region ÜRÜN EKLE-SİL-GÜNCELLE-TÜMÜ
    function f_api_urun_tumu(_q, _r) {
        (_q.UrlQuery.Aranan
            ? f_aranan_urun(_q.params.Tahta_Id, _q.UrlQuery)
            : db.urun.f_db_urun_tumu(_q.params.Tahta_Id, _q.UrlQuery.Sayfalama))
            .then(function (_aktifUrunler) {
                _r.status(200).send(mesaj.GET._200(_aktifUrunler, "Ürünler", "Ürünler BAŞARIYLA çekildi."));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.GET._500(_err, "Ürünler", "Ürün çekilemedi!"));
            });
    }

    function f_api_urun_id(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            urun_id = _q.params.Urun_Id;

        db.urun.f_db_urun_id(urun_id, tahta_id)
            .then(function (_urun) {
                _r.status(200).send(mesaj.GET._200(_urun, "Ürün bilgisi", "Ürün BAŞARIYLA çekildi."));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.GET._500(_err, "Ürün bilgisi", "Ürün çekilemedi!"));
            });
    }


    function f_api_urun_ekle(_q, _r) {
        var urun = _q.body,
            tahta_id = _q.params.Tahta_Id,
            kullanici_id = _q.session.ss.kullanici.Id,
            kurum_id = _q.body.UreticiKurum_Id,
            db_urun = schema.f_suz_klonla(schema.SCHEMA.DB.URUN, urun);

        if (!urun.Adi) {
            throw "Eklenecek ürünün adı gerekli";
        }

        db.urun.f_db_urun_ekle(db_urun, kurum_id, tahta_id, kullanici_id)
            .then(function (_dbUrun) {
                _r.status(201).send(mesaj.POST._201(_dbUrun, "Ürün ekle", "Ürün  başarıyla eklendi."));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.POST._500(_err, "Ürün ekle", "Ürün eklenemedi!"));
            });
    }

    function f_api_urun_guncelle(_q, _r) {
        var urun = _q.body,
            tahta_id = _q.params.Tahta_Id,
            kullanici_id = _q.session.ss.kullanici.Id,
            kurum_id = _q.body.UreticiKurum_Id,
            db_urun = schema.f_suz_klonla(schema.SCHEMA.DB.URUN, urun),
            es_urun = schema.f_suz_klonla(schema.SCHEMA.ES.URUN, urun);

        if (!urun.Id) {
            throw "Güncellenecek ürünün seçilmiş olması gerekir";
        }

        db.urun.f_db_urun_guncelle(tahta_id, db_urun, kurum_id, kullanici_id)
            .then(function (_dbResult) {
                _r.status(200).send(mesaj.PUT._200(_dbResult, "Ürün güncelle", "Ürün bilgisi başarıyla güncellendi!"));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.PUT._500(_err, "Ürün güncelle", "Ürün bilgisi GÜNCELLENEMEDİ!"));
            });
    }

    function f_api_urun_sil(_q, _r) {
        var id = _q.params.Urun_Id,
            tahta_id = _q.params.Tahta_Id,
            kullanici_id = _q.session.ss.kullanici.Id;

        db.cop.f_db_cop_urun_sil(tahta_id, id, kullanici_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.DELETE._200(parseInt(id), "", "Ürün Silindi"));
            })
            .fail(function (_err) {
                if (_err instanceof exception.YetkisizErisim) {
                    _r.status(405).send(mesaj.DELETE._405("", _err.Baslik, _err.Icerik));
                }
                else {
                    _r.status(400).send(mesaj.DELETE._400("", _err.Baslik, _err.Icerik));
                }
            });
    }

    // endregion

    // region ANAHTAR KELİMELER
    function f_api_urun_anahtar_tumu(req, res) {
        var tahta_id = req.params.Tahta_Id,
            urun_id = req.params.Urun_Id;

        db.urun.f_db_urun_anahtar_tumu(urun_id, tahta_id)
            .then(function (_dbRes) {
                res.status(200).send(mesaj.GET._200(_dbRes, "", "Ürün anahtar kelimesi BAŞARIYLA çekildi.."));

            })
            .fail(function (_err) {
                res.status(500).send(mesaj.GET._500(_err, "Ürün anahtar", "Ürün anahtar kelimesi çekilemedi!"));
            });
    }

    function f_api_urun_anahtar_ekle(req, res) {
        var tahta_id = req.params.Tahta_Id,
            urun_id = req.params.Urun_Id,
            anahtar = req.body,
            db_anahtar = schema.f_suz_klonla(schema.SCHEMA.ANAHTAR_KELIME, anahtar);

        db.urun.f_db_urun_anahtar_ekle(tahta_id, urun_id, db_anahtar)
            .then(function (_dbRes) {
                res.status(201).send(mesaj.POST._201(_dbRes, "Ürün anahtar kelimesi", "Ürün anahtar kelimesi BAŞARIYLA eklendi.."));
            })
            .fail(function (_err) {
                res.status(500).send(mesaj.POST._500(_err, "Ürün anahtar kelimesi", "Ürün anahtar kelimesi eklenemedi!"));
            });
    }

    function f_api_urun_anahtar_sil(req, res) {
        var tahta_id = req.params.Tahta_Id,
            urun_id = req.params.Urun_Id,
            anahtar = req.params.Anahtar_Id;

        db.urun.f_db_urun_anahtar_sil(tahta_id, urun_id, anahtar)
            .then(function (_dbRes) {
                res.status(200).send(mesaj.DELETE._200(_dbRes, "Anahtar ekle", "Ürün anahtar kelimesi BAŞARIYLA silindi.."));
            })
            .fail(function (_err) {
                res.status(400).send(mesaj.DELETE._400(_err, "Anahtar ekle", "Ürün anahtar kelimesi silinemedi!"));
            });
    }

    // endregion

    // region İLİŞKİLİ KURUM
    function f_api_urun_iliskili_kurum_tumu(req, res) {
        var tahta_id = req.params.Tahta_Id,
            urun_id = req.params.Urun_Id;

        db.urun.f_db_urun_iliskili_kurum_tumu(tahta_id, urun_id)
            .then(function (_dbRes) {
                res.status(200).send(mesaj.GET._200(_dbRes, "Kurum ekle", "Ürünle ilişkili kurum listesi BAŞARIYLA çekildi.."));

            }).fail(function (_err) {
            res.status(500).send(mesaj.GET._500(_err, "Kurum ekle", "Ürünle ilişkili kurum listesi çekilemedi!"));
        });
    }

    function f_api_urun_iliskili_kurum_ekle(req, res) {
        var tahta_id = req.params.Tahta_Id,
            urun_id = req.params.Urun_Id,
            kurum_id = req.params.Kurum_Id;

        db.urun.f_db_urun_iliskili_kurum_ekle(tahta_id, urun_id, kurum_id)
            .then(function (_dbRes) {
                res.status(200).send(mesaj.POST._200(_dbRes, "", "Ürünle ilişkili kurum bilgisi BAŞARIYLA eklendi.."));

            }).fail(function (_err) {
            res.status(500).send(mesaj.POST._500(_err, "Ürünle ilişkili kurum", "Ürünle ilişkili kurum bilgisi eklenemedi!"));
        });
    }

    function f_api_urun_iliskili_kurum_sil(req, res) {
        var tahta_id = req.params.Tahta_Id,
            urun_id = req.params.Urun_Id,
            kurum_id = req.params.Kurum_Id;

        db.urun.f_db_urun_iliskili_kurum_sil(tahta_id, urun_id, kurum_id)
            .then(function (_dbRes) {
                res.status(200).send(mesaj.DELETE._200(_dbRes, "", "Ürünle ilişkili kurum bilgisi BAŞARIYLA silindi.."));

            }).fail(function (_err) {
            res.status(400).send(mesaj.DELETE._400(_err, "", "Ürünle ilişkili kurum bilgisi silinemedi!"));
        });
    }

    // endregion

    /**
     * Tahtalar arası ürün paylaşımı sağlanır
     * @param _q
     * @param _r
     */
    function f_api_urun_paylas(_q, _r) {
        var paylas = _q.body;

        db.urun.f_db_urun_paylas(paylas)
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "", "Tahtanın ürünleri başarıyla paylaşıldı."));
            }).fail(function (_err) {
            _r.status(500).send(mesaj.GET._500("", _err.Baslik, "Tahtanın ürünleri paylaşılamadı!" + _err.Icerik));
        });
    }

    /**
     * @class APIUrun
     */
    return {
        f_api_urunle_teklif_verilen_ihale_sayisi: f_api_urunle_teklif_verilen_ihale_sayisi,
        f_api_urun_paylas: f_api_urun_paylas,
        f_api_urun_iliskili_kurum_tumu: f_api_urun_iliskili_kurum_tumu,
        f_api_urun_iliskili_kurum_ekle: f_api_urun_iliskili_kurum_ekle,
        f_api_urun_iliskili_kurum_sil: f_api_urun_iliskili_kurum_sil,
        f_api_urun_tumu: f_api_urun_tumu,
        f_api_urun_id: f_api_urun_id,
        f_api_urun_ekle: f_api_urun_ekle,
        f_api_urun_guncelle: f_api_urun_guncelle,
        f_api_urun_sil: f_api_urun_sil,
        f_api_urun_anahtar_tumu: f_api_urun_anahtar_tumu,
        f_api_urun_anahtar_ekle: f_api_urun_anahtar_ekle,
        f_api_urun_anahtar_sil: f_api_urun_anahtar_sil
    };
}

module.exports = APIUrun;