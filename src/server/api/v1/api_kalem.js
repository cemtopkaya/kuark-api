'use strict';

var /** @type {DBModel} */
     db = require('kuark-db')(),
    schema=require('kuark-schema'),
    extensions=require('kuark-extensions'),
    exception=require('kuark-istisna'),
    mesaj = require('./API').API;

/**
 *
 * @returns {APIKalem}
 * @constructor
 */
function APIKalem() {

    // region KALEM TAKİP
    function f_api_kalem_takip_tumu(_q, _r) {
        var tahta_id = _q.params.Tahta_Id;

        if (!_q.query.q) {
            _r.status(500).send(mesaj.GET._500("", "Kalem bilgisi", "Tahtanın takip edilen kalem bilgileri çekilemedi..."));
        }

        var defer;
        switch (_q.query.q) {

            case 'toplam':
                defer = db.kalem.f_db_kalem_takip_toplami(tahta_id);
                break;
            case 'id':
                defer = db.kalem.f_db_kalem_takip_idler(tahta_id);
                break;
            case 'veri':
                defer = db.kalem.f_db_tahta_kalem_takip_tumu(tahta_id);
                break;
            default:
                defer = db.kalem.f_db_tahta_kalem_takip_tumu(tahta_id);
                break;
        }

        defer.then(function (_res) {
            _r.status(200).send(mesaj.GET._200(_res, "Kalem bilgisi", "Takipteki kalemler başarıyla çekildi."));
        }).fail(function () {
            _r.status(500).send(mesaj.GET._500("", "Kalem bilgisi", "Takipteki kalemler çekilemedi!"));
        });
    }

    function f_api_kalem_takip_ekle(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            satir_id = _q.params.Satir_Id;

        db.kalem.f_db_tahta_kalem_takip_ekle(tahta_id, satir_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.POST._200(_res, "Kalem bilgisi", "Kalem bilgisi başarıyla takip edileceklere eklendi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.POST._500("", "Kalem bilgisi", "Kalem bilgisi takiptekilere eklenemedi!"));
            });
    }

    function f_api_kalem_takip_sil(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            satir_id = _q.params.Satir_Id;

        db.kalem.f_db_tahta_kalem_takip_sil(tahta_id, satir_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.DELETE._200(satir_id, "Kalem bilgisi", "Kalem bilgisi başarıyla takip edilecekler listesinden silindi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.DELETE._500("", "Kalem bilgisi", "Kalem bilgisi takiptekilerden silinemedi!"));
            });
    }

    // endregion

    // region SATIR İŞLEMLERİ- (EKLE-GÜNCELLE-SİL-BUL)

    function f_api_kalem_id(_q, _r) {
        var satir_id = _q.params.Satir_Id,
            ihale_id = _q.params.Ihale_Id,
            tahta_id = _q.params.Tahta_Id;

        /** @type {OptionsKalem} */
        var opt = {};
        opt.bArrTeklifleri = false;
        opt.bOnayDurumu = true;
        opt.bTakiptemi = true;

        db.kalem.f_db_kalem_id(satir_id, tahta_id, opt)
            .then(function (_bulunansatir) {
                _r.status(200).send(mesaj.GET._200(_bulunansatir, "", "kalem bilgisi başarıyla çekildi."));
            })
            .fail(function () {
            _r.status(500).send(mesaj.GET._500("", "", "kalem bilgisi bulunamadı!"));
        });
    }

    function f_api_kalem_ekle(_q, _r) {

        var kalem = _q.body,
            db_kalem = schema.f_suz_klonla(schema.SCHEMA.DB.KALEM, kalem),
            es_kalem = schema.f_suz_klonla(schema.SCHEMA.ES.KALEM, kalem),
            ihale_id = _q.params.Ihale_Id,
            tahta_id = _q.params.Tahta_Id,
            kullanici_id = _q.session.ss.kullanici.Id;

        db.kalem.f_db_kalem_ekle_tahta(tahta_id, ihale_id, es_kalem, db_kalem, kullanici_id)
            .then(function (_dbResult) {
                _r.send(201, mesaj.POST._201(_dbResult, "Kalem ekle", "Yeni kalem BAŞARIYLA eklendi."));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.POST._500(_err, "Kalem ekle", "kalem EKLENEMEDİ!"));
            });
    }

    function f_api_kalem_guncelle(_q, _r) {

        var kalem = _q.body,
            db_kalem = schema.f_suz_klonla(schema.SCHEMA.DB.KALEM, kalem),
            es_kalem = schema.f_suz_klonla(schema.SCHEMA.ES.KALEM, kalem),
            tahta_id = _q.params.Tahta_Id,
            ihale_id = _q.params.Ihale_Id,
            satir_id = _q.params.Satir_Id,
            kullanici_id = _q.session.ss.kullanici.Id;

        db.kalem.f_db_kalem_guncelle_tahta(tahta_id, ihale_id, es_kalem, db_kalem, kullanici_id)
            .then(function (_dbResult) {
                _r.send(200, mesaj.PUT._200(_dbResult, "Kalem güncelle", "İhaleye bağlı kalem BAŞARIYLA güncellendi."));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.PUT._500(_err, "Kalem güncelle", "Kalem bilgisi güncellenemedi!"));
            });
    }

    function f_api_kalem_sil(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            ihale_id = _q.params.Ihale_Id,
            satir_id = _q.params.Satir_Id,
            kullanici_id = _q.session.ss.kullanici.Id;

        db.cop.f_db_cop_kalem_sil(tahta_id, ihale_id, satir_id, kullanici_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.DELETE._200(parseInt(satir_id), "Kalem sil", "İhale kalem bilgisi BAŞARIYLA Silindi!"));
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

    /**
     * Satırının onay durumunu günceller sonuçta satırı geri döner.     *
     * @param _q
     * @param _r
     */
    function f_api_kalem_onay_durum_guncelle(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            kalem_id = _q.params.Satir_Id,
            ihale_id = _q.params.Ihale_Id,
            onay_durum = _q.body,
            kullanici_id = _q.session.ss.kullanici.Id;

        onay_durum.Kullanici_Id = kullanici_id;

        db.kalem.f_db_kalem_onay_durumu_guncelle(tahta_id, ihale_id, kalem_id, onay_durum)
            .then(function (_dbResult) {
                db.kalem.f_db_kalem_id(kalem_id, tahta_id)
                    .then(function (_kalem) {
                        _r.status(200).send(mesaj.PUT._200(_kalem, "Kalem onay durumu değiştir", "İhale kaleminin onay durumu BAŞARIYLA güncellendi."));
                    });
            }).fail(function (_err) {
            _r.status(500).send(mesaj.PUT._500("", "Kalem onay durumu değiştir", "İhale kaleminin onay durumu güncellenirken hata oluştu:" + _err));
        });
    }

    function f_api_kalem_onay_durumu(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            kalem_id = _q.params.Satir_Id,
            kullanici_id = _q.session.ss.kullanici.Id;

        db.kalem.f_db_kalem_onay_durumu(kalem_id, tahta_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "", "İhale kaleminin onay durumu BAŞARIYLA çekildi."));

            }).fail(function (_err) {
            _r.status(500).send(mesaj.GET._500("", "", "İhale kaleminin onay durumu çekilirken hata oluştu:" + _err));
        });
    }

    // endregion

    // region INDEX

    function f_aranan_indeksli_kalem(_tahta_id, _ihale_id, arama) {
        return db.kalem.f_db_kalem_indeksli_idler_ihaleye_bagli(_tahta_id, _ihale_id)
            .then(function (_kalem_idleri) {
                console.log("elastic için _kalem_idleri ne geldi,");
                console.log(JSON.stringify(_kalem_idleri));

                var query = {
                    "query": {
                        "filtered": {
                            "query": {
                                "query_string": {"query": "*" + arama.Aranan + "*"}
                            },
                            "filter": {
                                "ids": {
                                    "type": db.elastic.SABIT.TIP.KALEM,
                                    "values": _kalem_idleri.map(function (e) {
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
                    type: db.elastic.SABIT.TIP.KALEM,
                    size: arama.Sayfalama.SatirSayisi,
                    from: arama.Sayfalama.Sayfa * arama.Sayfalama.SatirSayisi,
                    body: query

                }).then(function (_resp) {

                    var sonuc = schema.f_create_default_object(schema.SCHEMA.LAZY_LOADING_RESPONSE);
                    sonuc.ToplamKayitSayisi = _resp[0].hits.total;

                    var kalemler = _resp[0].hits.hits.pluckX("_source");

                    if (kalemler && kalemler.length > 0) {

                        return db.redis.dbQ.Q.all([
                            db.kalem.f_db_kalem_takip_kontrol(_tahta_id, kalemler),
                            db.kalem.f_db_kalem_onay_durumu(kalemler.pluckX("Id"), _tahta_id)
                        ]).then(function (_ress) {

                            var arr_onay_durumlari = _ress[1];

                            return kalemler.map(function (_elm, _idx) {
                                    _elm.OnayDurumu = arr_onay_durumlari[_idx];
                                    return _elm;
                                })
                                .then(function (_olusan) {
                                    sonuc.Data = _olusan;
                                    return sonuc;
                                });
                        });

                    } else {
                        sonuc.Data = [];
                        return sonuc;
                    }

                    /* sonuc.Data = kalemler && kalemler.length ? kalemler : [];
                     return sonuc;*/
                });
            });
    }

    /**
     * Gelen kritere göre lazyload anahtar kelimelerine göre kalemleri getirir
     * @param _q
     * @param _r
     */
    function f_api_kalem_tumu_tahta_indeks_anahtar(_q, _r) {
        console.log("f_api_kalem_tumu_tahta_indeks_anahtar");

        var tahta_id = _q.params.Tahta_Id,
            ihale_id = _q.params.Ihale_Id;

        //aranan varsa elastic e yoksa da db ye sor
        (_q.query.q
            ? f_aranan_indeksli_kalem(tahta_id, ihale_id, _q.UrlQuery)
            : db.kalem.f_db_kalem_indeksliler_by_page(tahta_id, ihale_id, _q.UrlQuery))
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "", "Tahtanın anahtar kelimelerine göre kalem bilgileri başarıyla çekildi"));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "", "Tahtanın anahtar kelimelerine göre kalem bilgileri çekilemedi..."));
            });
    }

    // endregion


    /**
     * @class APIKalem
     */
    return {
        f_api_kalem_tumu_tahta_indeks_anahtar: f_api_kalem_tumu_tahta_indeks_anahtar,
        f_api_kalem_takip_tumu: f_api_kalem_takip_tumu,
        f_api_kalem_takip_sil: f_api_kalem_takip_sil,
        f_api_kalem_takip_ekle: f_api_kalem_takip_ekle,
        f_api_kalem_onay_durumu: f_api_kalem_onay_durumu,
        f_api_kalem_onay_durum_guncelle: f_api_kalem_onay_durum_guncelle,
        f_api_kalem_sil: f_api_kalem_sil,
        f_api_kalem_guncelle: f_api_kalem_guncelle,
        f_api_kalem_ekle: f_api_kalem_ekle,
        f_api_kalem_id: f_api_kalem_id
    };
}

module.exports = APIKalem;