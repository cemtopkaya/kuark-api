'use strict';

var /** @type {DBModel} */
    db = require('kuark-db')(),
    extensions = require('kuark-extensions'),
    _ = require('lodash'),
    schema = require('kuark-schema'),
    exception = require('kuark-istisna'),
    mesaj = require('./API').API;

/**
 *
 * @returns {APITahta}
 * @constructor
 */
function APITahta() {

    var uuid = require('node-uuid');

    // region TAHTA İŞLEMLERİ

    function f_api_tahta_tumu(_q, _r) {
        db.tahta.f_db_tahta_tumu()
            .then(function (_aktif) {
                _r.status(200).send(mesaj.GET._200(_aktif, "", "Tüm tahtalar başarıyla çekildi."));

            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "", "Tahtalar çekilemedi..."));
            });
    }

    function f_api_tahta_id(_q, _r) {
        var id = _q.params.Tahta_Id;
        db.tahta.f_db_tahta_id(id)
            .then(function (_bulunan) {
                _r.status(200).send(mesaj.GET._200(_bulunan, "", "Tahta bilgisi başarıyla çekildi."));
            }).fail(function () {
            _r.status(500).send(mesaj.GET._500("", "", "Tahta bilgisi çekilemedi..."));
        });
    }

    // endregion

    // region TAHTANIN HABERLERİ

    /**
     * Tahtaya gelen tüm haberleri içerir (aktif haldeki okunup okunmama durumu olmadan)
     * @param _q
     * @param _r
     */
    function f_api_tahta_haber_tumu(_q, _r) {
        var tahta_id = _q.params.Tahta_Id;
        db.haber.f_db_haber_tumu(tahta_id, 0, true, false, false)
            .then(function (arr) {
                _r.status(200).send(mesaj.GET._200(arr, "", "Haberler başarıyla çekildi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "", "Haberler çekilemedi!"));
            });
    }

    /**
     * Tahtanın okunan haberlerini içerir
     * @param _q
     * @param _r
     */
    function f_api_tahta_haber_okunan(_q, _r) {
        var tahta_id = _q.params.Tahta_Id;
        db.haber.f_db_haber_tumu(tahta_id, 0, false, false, true)
            .then(function (arr) {
                _r.status(200).send(mesaj.GET._200(arr, "", "Okunan haberler başarıyla çekildi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "", "Okunan haberler çekilemedi!"));
            });
    }

    function f_api_tahta_haber_silinen(_q, _r) {
        var tahta_id = _q.params.Tahta_Id;
        db.haber.f_db_haber_tumu(tahta_id, 0, false, true, false)
            .then(function (arr) {
                _r.status(200).send(mesaj.GET._200(arr, "", "Silinen haberler başarıyla çekildi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "", "Silinen haberler çekilemedi!"));
            });
    }

    /**
     * Tahtaya yeni haber ekle
     * @param _q
     * @param _r
     */
    function f_api_tahta_haber_ekle(_q, _r) {
        var haber = _q.body,
            tahta_id = _q.params.Tahta_Id;

        db.haber.f_db_haber_ekle(tahta_id, 0, haber)
            .then(function (_dbHaber) {
                _r.status(201).send(mesaj.POST._201(_dbHaber, "", "Haber BAŞARIYLA eklendi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.POST._500("", "", "Haber bilgisi eklenemedi!"));
            });
    }

    function f_api_tahta_haber_guncelle(_q, _r) {

        var id = _q.params.Haber_Id,
            tahta_id = _q.params.Tahta_Id;

        db.haber.f_db_haber_guncelle(tahta_id, 0, id, false, false, true)
            .then(function (_dbHaber) {
                _r.status(200).send(mesaj.PUT._200(_dbHaber, "", "Haber BAŞARIYLA güncellendi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.POST._500("", "", "Haber bilgisi güncellenemedi!"));
            });
    }

    function f_api_tahta_haber_sil(_q, _r) {
        var id = _q.params.Haber_Id,
            tahta_id = _q.params.Tahta_Id;

        db.haber.f_db_haber_sil(tahta_id, 0, id)
            .then(function (_dbResults) {
                _r.status(200).send(mesaj.DELETE._200(parseInt(id), "", "Haber bilgisi BAŞARIYLA Silindi!"));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.DELETE._500("", _err.Baslik, "Haber silerken hata oluştu>" + _err.Icerik));
            });
    }

    // endregion

    // region TAHTA AJANDA

    function f_api_tahta_ajanda(_q, _r) {
        var tahta_id = _q.params.Tahta_Id;
        db.tahta.f_db_tahta_ajandasi(tahta_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "Tahta Ajanda İşlemi", "Tahta ajandası başarıyla çekildi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "Tahta Ajanda İşlemi", "Tahta ajandası bulunamadı!"));
            });
    }


    function f_api_tahta_ajanda_ekle(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            ajanda = _q.body;

        db.tahta.f_db_tahta_ajanda_ekle(tahta_id, ajanda)
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "Tahta Ajanda İşlemi", "Tahta ajandası başarıyla eklendi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "Tahta Ajanda İşlemi", "Tahta ajandası eklenemedi!"));
            });
    }

    function f_api_tahta_ajanda_sil(_q, _r) {
        var tahta_id = _q.params.Tahta_Id;
        db.tahta.f_db_tahta_ajanda_sil(tahta_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "Tahta Ajanda İşlemi", "Tahta ajandası başarıyla silindi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "Tahta Ajanda İşlemi", "Tahta ajandası silinemedi!"));
            });
    }

    // endregion

    // region TAHTA İHALE RAPOR DETAYLARI
    function f_api_tahta_ihale_rapor_bilgileri(_q, _r) {
        var tahta_id = _q.params.Tahta_Id;
        db.tahta.f_db_tahta_ihale_rapor_bilgileri(tahta_id, _q.UrlQuery)
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "İhale bilgileri", "Tahta ihale rapor detayları başarıyla çekildi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "İhale bilgileri", "Tahta ihale rapor detayları bulunamadı!"));
            });
    }

    // endregion


    // region TAHTA ANAHTAR İŞLEMLERİ
    function f_api_tahta_anahtar_tumu(_q, _r) {
        var tahta_id = _q.params.Tahta_Id;
        db.tahta.f_db_tahta_anahtar_tumu(tahta_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "Tahta Anahtar Kelime İşlemi", "Tahta anahtar kelimeleri bilgisi başarıyla çekildi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "Tahta Anahtar Kelime İşlemi", "Tahta anahtar kelimeleri bulunamadı!"));
            });
    }

    //tahta anahtar kelime sil-ekle-güncelle
    function f_api_tahta_anahtar_sil(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            anahtar = _q.params.Anahtar_Id,
            kullanici_id = _q.session.ss.kullanici.Id;

        db.tahta.f_db_tahta_anahtar_sil(tahta_id, anahtar, kullanici_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.DELETE._200(_res, "Tahta Anahtar Kelime İşlemi", "Tahta anahtar kelimeleri başarıyla silindi."));
            })
            .fail(function () {
                _r.status(400).send(mesaj.DELETE._400("", "Tahta Anahtar Kelime İşlemi", "Tahta anahtar kelimesi silinemedi!"));
            });
    }

    function f_api_tahta_anahtar_ekle(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            anahtar = _q.body,
            db_anahtar = schema.f_suz_klonla(schema.SCHEMA.ANAHTAR_KELIME, anahtar),
            kullanici_id = _q.session.ss.kullanici.Id;

        db.tahta.f_db_tahta_anahtar_ekle(tahta_id, db_anahtar, kullanici_id)
            .then(function (_res) {
                _r.status(201).send(mesaj.POST._201(_res, "Tahta Anahtar Kelime İşlemi", "Tahta anahtar kelimeleri başarıyla eklendi."));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.POST._500(_err, "Tahta Anahtar Kelime İşlemi", "Tahta anahtar kelimesi eklenemedi!"));
            });
    }

    // endregion

    // region ÜYE İŞLEMLERİ
    function f_aranan_uye(_tahta_id, _arama) {

        return db.tahta.f_db_aktif_tahta_uye_idleri(_tahta_id, _arama.Sayfalama)
            .then(function (_idleri) {
                console.log("elastic için _idleri ne geldi,");
                console.log(JSON.stringify(_idleri));

                var query = {
                    "query": {
                        "filtered": {
                            "query": {
                                "query_string": {"query": "*" + _arama.Aranan + "*"}
                            },
                            "filter": {
                                "ids": {
                                    "type": db.elastic.SABIT.TIP.KULLANICI,
                                    "values": _idleri.map(function (e) {
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
                    type: db.elastic.SABIT.TIP.KULLANICI,
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

    function f_api_tahta_uyeleri_tumu(_q, _r) {

        (_q.UrlQuery.Aranan
            ? f_aranan_uye(_q.params.Tahta_Id, _q.UrlQuery)
            : db.tahta.f_db_tahta_uyeleri(_q.params.Tahta_Id))
            .then(function (_aktif) {
                _r.status(200).send(mesaj.GET._200(_aktif, "Tahta üyeleri", "Tahta üyeleri BAŞARIYLA çekildi."));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.GET._500(_err, "Tahta üyeleri", "Tahta üyeleri çekilemedi!"));
            });
    }

    function f_api_tahta_uye_ekle(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            uye = _q.body;
        db.tahta.f_db_tahta_uye_ekle(tahta_id, uye)
            .then(function (_res) {
                _r.status(200).send(mesaj.POST._200(_res, "Tahta Üye İşlemi", "Tahta üye bilgisi başarıyla eklendi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.POST._500("", "Tahta Üye İşlemi", "Tahta üyesi eklenemedi!"));
            });
    }

    function f_api_tahta_uye_guncelle(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            uye_id = _q.params.Uye_Id,
            rol = _q.body;

        db.tahta.f_db_tahta_uye_guncelle(tahta_id, uye_id, rol)
            .then(function (_res) {
                _r.status(200).send(mesaj.POST._200(_res, "Tahta Üye İşlemi", "Tahta üye bilgisi başarıyla güncellendi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.POST._500("", "Tahta Üye İşlemi", "Tahta üyesi güncellenemedi!"));
            });
    }

    function f_api_tahta_uye_rol_guncelle(_q, _r) {
        console.log("f_api_tahta_uye_rol_guncelle")
        var tahta_id = _q.params.Tahta_Id,
            uye_id = _q.params.Uye_Id,
            gelen = _q.body;
        console.log("gelen=>" + JSON.stringify(gelen));

        db.tahta.f_db_tahta_uye_rol_guncelle(tahta_id, uye_id, gelen.Roller)
            .then(function (_res) {
                _r.status(200).send(mesaj.POST._200(gelen.Roller, "Tahta Üye İşlemi", "Tahta üyesinin rol bilgisi başarıyla güncellendi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.POST._500("", "Tahta Üye İşlemi", "Tahta üyesinin rol bilgisi güncellenemedi!"));
            });
    }

    function f_api_tahta_uye_sil(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            uye_id = _q.params.Uye_Id;

        db.tahta.f_db_tahta_uye_sil(tahta_id, uye_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.DELETE._200(parseInt(uye_id), "Tahta Üye Silme İşlemi", "Tahta üye bilgisi başarıyla silindi."));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.DELETE._500(_err, (_err.Baslik ? _err.Baslik : "Tahta Üye Silme İşlemi"), "Tahta üyeleri silinemedi! " + (_err.Icerik ? _err.Icerik : "")));
            });
    }

    // endregion

    // region DAVETLİ İŞLEMLERİ
    function f_api_tahta_davetleri(_q, _r) {
        var tahta_id = _q.params.Tahta_Id;

        db.tahta.f_db_tahta_davetleri(tahta_id)
            .then(function (_arrDavetliEpostalar) {
                var uidsizDavetler = _arrDavetliEpostalar.map(function (_elm, _idx) {
                    delete _elm.UID;
                    return _elm;
                });
                _r.status(200).send(mesaj.GET._200(uidsizDavetler, "Tahta Davetli İşlemi", "Tahta davet bilgisi başarıyla çekildi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "Tahta Davetli İşlemi", "Tahta davet bilgisi çekilemedi!"));
            });
    }

    /**
     *  önce davet sonra da uid ekliyoruz
     *  en son mail atıyoruz
     * @param _q
     * @param _r
     */
    function f_api_tahta_davet_ekle(_q, _r) {
        var davet = _q.body;
        davet.UID = uuid.v1();

        db.tahta.f_db_tahta_davet_ekle(davet.Tahta_Id, davet)
            .then(function (_res) {

                function f_davetIletisiGonder(_tahta_id, _uid, _ePosta) {
                    var EMail = extensions.EMail;
                    var mail = new EMail("", "", "", true);

                    /** @type {OptionsTahta} */
                    var opt = {};
                    opt.bAnahtarlari = false;
                    opt.bGenel = true;
                    opt.bKurumu = false;
                    opt.bRolleri = false;
                    opt.bUyeleri = false;
                    opt.bAjanda = false;

                    db.tahta.f_db_tahta_id(_tahta_id, opt)
                        .then(function (_dbTahta) {
                            //TODO: ileti gönderirken "localhost:3000" diye gidiyor bunun yerine environment üstünden gitmesi gereken kök adres gitmeli.
                            //mail at
                            var icerik = "<html>" +
                                "<div>" +
                                "<p>[" + _q.session.ss.kullanici.AdiSoyadi + "] isimli kullanıcı tarafından [" + _dbTahta.Genel.Adi + "] isimli tahtaya davet edildiniz.<br/>İlgili sayfaya gitmek için " +
                                "<a  target=\"_blank\" href=\"http://" + schema.SABIT.URL.LOCAL + "/tahtalar/" + _tahta_id + "/davetler/" + _uid + "\">[BURAYA]</a> tıklayınız.</p>" +
                                "</div>" +
                                "</html>";


                            var txt = icerik,
                                from = "",
                                to = _ePosta || "duygu.akmaz@fmc-ag.com",
                                cc = "",
                                bcc = "",
                                subject = "İhale Tahta Daveti hk";

                            mail.f_send(txt, from, to, cc, bcc, subject, true);

                        });
                }

                f_davetIletisiGonder(davet.Tahta_Id, davet.UID, davet.EPosta);

                _r.status(200).send(mesaj.POST._200(_res, "Tahtaya Davet Ekleme", "Tahtaya davetli başarıyla eklendi."));

            })
            .fail(function () {
                _r.status(500).send(mesaj.POST._500("", "Tahtaya Davet Ekleme", "Tahtaya davetli eklenemedi!"));
            });
    }

    function f_api_tahta_davet_sil(_q, _r) {

        //önce davet sonra da uid ekliyoruz
        //en son mail atıyoruz

        var tahta_id = _q.params.Tahta_Id,
            davet = _q.params.Davetli;

        console.log("tahta_id:" + tahta_id);
        console.log("gelen davet bilgisi:" + JSON.stringify(davet));

        db.tahta.f_db_tahta_davet_sil(tahta_id, davet)
            .then(function (_dbReply) {
                console.log("Silme sonucu: " + JSON.stringify(_dbReply));
                if (_dbReply) {
                    _r.status(200).send(mesaj.DELETE._200(_dbReply, "Tahtadan Davet Silme", "Tahtadan davetli başarıyla silindi."));
                } else {
                    _r.status(404).send(mesaj.DELETE._404(_dbReply, "Tahtadan Davet Silme", "Davet bulunamadığı için silinemedi."));
                }
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.POST._500(_err, "Tahtadan Davet Silme", "Tahtadan davetli başarıyla silinemedi! Hata: " + _err));
            });
    }

    function f_api_tahta_davet_eposta_kontrol(_q, _r) {

        var tahta_id = _q.params.Tahta_Id,
            davet_id = _q.params.Davetli,
            eposta = _q.params.EPosta;

        db.tahta.f_db_tahta_davet_eposta(tahta_id, davet_id, eposta)
            .then(function (_dbReply) {
                extensions.ssg = [{"f_db_tahta_davet_eposta >": _dbReply}];
                if (_dbReply != null) {
                    _q.session.ss.davet.Gecerli = true;
                    _r.status(200).send(mesaj.POST._200({}, "Yeni Davet Kabulü", "Davet gönderilen EPOSTA bilgisi başarılı!"));
                } else {
                    _r.status(500).send(mesaj.POST._500(_dbReply, "Yeni Davet Kabulü", "Davet gönderilen EPOSTA bilgisi DOĞRULAMADI! Lütfen tekrar deneyiniz."));
                }
            })
            .fail(function (_err) {
                extensions.ssr = [{"_err": _err}];
                _r.status(500).send(mesaj.POST._500(_err, "", "Hata: " + _err));
            });
    }

    // endregion

    // region BAĞLI TEKLİFLER
    function f_api_tahta_teklif_id(_q, _r) {
        var teklif_id = _q.params.Teklif_Id,
            tahta_id = _q.params.Tahta_Id;

        /** @type {OptionsTeklif} */
        var opts = {
            bArrUrunler: true,
            bKalemBilgisi: true,
            bIhaleBilgisi: true,
            bKurumBilgisi: true,
            optUrun: {}
        };

        db.teklif.f_db_teklif_id(teklif_id, tahta_id, opts)
            .then(function (_bulunanteklif) {
                _r.status(200).send(mesaj.GET._200(_bulunanteklif, "", "Teklif bilgisi başarıyla çekildi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "", "Teklif bilgisi bulunamadı!"));
            });
    }

    // endregion

    // region TAHTA İHALELERİ
    function f_aranan_ihale(_tahta_id, _arama) {
        console.log("f_aranan_ihale");
        var defer = db.redis.dbQ.Q.defer();

        /**
         * Gelen kritere göre uygun ihale idlerini buluyoruz
         * Örn aktifler geldi ise tahtaya ait ihale+genel aktif ihale-(gizlenen+silinen) kayıtlar çekilir.
         *
         */
        var defer_kriter;
        if (_arama.Kriter == schema.SABIT.URL_QUERY.KRITER.AKTIFLER) {
            defer_kriter = db.ihale.f_db_tahta_ihale_idler_aktif(_tahta_id)
        }
        else if (_arama.Kriter == schema.SABIT.URL_QUERY.KRITER.TAKIPTEKILER) {
            defer_kriter = db.ihale.f_db_ihale_tahtanin_takipteki_ihale_idleri(_tahta_id)
        }
        else if (_arama.Kriter == schema.SABIT.URL_QUERY.KRITER.GIZLENENLER) {
            defer_kriter = db.ihale.f_db_ihale_tahtanin_gizlenen_ihale_idleri(_tahta_id)
        }

        defer_kriter
        //return db.ihale.f_db_tahta_ihale_idler_aktif(_tahta_id)
            .then(function (_ihale_idleri) {
                console.log("elastic için ihale idleri ne geldi,");
                console.log(JSON.stringify(_ihale_idleri));

                var query = {
                    "query": {
                        "filtered": {
                            "query": {
                                "query_string": {"query": "*" + _arama.Aranan + "*"}
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
                    "sort": db.elastic.f_sort(_arama)
                };

                db.elastic.f_search({
                    method: "POST",
                    index: db.elastic.SABIT.INDEKS.APP,
                    type: db.elastic.SABIT.TIP.IHALE,
                    size: _arama.Sayfalama.SatirSayisi,
                    from: _arama.Sayfalama.Sayfa * _arama.Sayfalama.SatirSayisi,
                    body: query

                }).then(function (_resp) {

                    var sonuc = schema.f_create_default_object(schema.SCHEMA.LAZY_LOADING_RESPONSE);
                    sonuc.ToplamKayitSayisi = _resp[0].hits.total;

                    var ihaleler = _resp[0].hits.hits.pluckX("_source");
                    if (ihaleler && ihaleler.length > 0) {
                        db.ihale.f_db_ihale_takip_kontrol(_tahta_id, ihaleler)
                            .then(function (_ihaleler) {
                                sonuc.Data = _ihaleler;
                                defer.resolve(sonuc);
                            });
                    } else {
                        sonuc.Data = [];
                        defer.resolve(sonuc);
                    }
                });
            });
        return defer.promise;
    }

    function f_api_tahta_ihaleleri(_q, _r) {

        var opts = {};
        opts.bArrKalemleri = false;
        opts.bYapanKurum = true;
        opts.bTakip = true;

        (_q.UrlQuery.Aranan
            ? f_aranan_ihale(_q.params.Tahta_Id, _q.UrlQuery)
            : db.ihale.f_db_tahta_ihale_idler_sort_page(_q.params.Tahta_Id, _q.UrlQuery, opts))
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "İhale bilgisi", "İhaleler başarıyla çekildi."));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.GET._500(_err, "İhale bilgisi", "İhaleler çekilemedi!"));
            });
    }

    function f_api_tahta_ihale_ekle(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            ihale = _q.body,
            db_ihale = schema.f_suz_klonla(schema.SCHEMA.DB.IHALE, ihale),
            es_ihale = schema.f_suz_klonla(schema.SCHEMA.ES.IHALE, ihale),
            kullanici_id = _q.session.ss.kullanici.Id;

        db.ihale.f_db_ihale_ekle(es_ihale, db_ihale, db_ihale.Kurum_Id, tahta_id, kullanici_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "İhale bilgisi", "İhale bilgisi başarıyla eklendi."));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.GET._500(_err, "İhale bilgisi", "İhale bilgisi eklenemedi!"));
            });
    }

    function f_api_tahta_ihale_guncelle(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            ihale = _q.body,
            db_ihale = schema.f_suz_klonla(schema.SCHEMA.DB.IHALE, ihale),
            es_ihale = schema.f_suz_klonla(schema.SCHEMA.ES.IHALE, ihale),
            kullanici_id = _q.session.ss.kullanici.Id;

        console.log("ihale>" + JSON.stringify(ihale));
        console.log("db_ihale>" + JSON.stringify(db_ihale));
        console.log("es_ihale>" + JSON.stringify(es_ihale));

        db.ihale.f_db_tahta_ihale_guncelle(es_ihale, db_ihale, tahta_id, db_ihale.Kurum_Id, kullanici_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "İhale bilgisi", "İhale bilgisi başarıyla güncellendi."));
            }).fail(function () {
            _r.status(500).send(mesaj.GET._500("", "İhale bilgisi", "İhale bilgisi güncellenemedi!"));
        });
    }

    function f_api_tahta_ihale_sil(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            ihale_id = _q.params.Ihale_Id,
            kullanici_id = _q.session.ss.kullanici.Id;

        db.cop.f_db_cop_ihale_sil(tahta_id, ihale_id, kullanici_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.DELETE._200(parseInt(ihale_id), "İhale Sil", "İhale bilgisi başarıyla silindi."));
            })
            .fail(function (_err) {
                console.log("_err" + JSON.stringify(_err));
                if (_err instanceof exception.YetkisizErisim) {
                    _r.status(405).send(mesaj.DELETE._405("", _err.Baslik, _err.Icerik));
                }
                else {
                    _r.status(400).send(mesaj.DELETE._400("", _err.Baslik, _err.Icerik));
                }
            });
    }

    // region İHALE TAKİP
    function f_api_tahta_ihale_takip_tumu(_q, _r) {
        var tahta_id = _q.params.Tahta_Id;

        if (!_q.query.q) {
            _r.status(500).send(mesaj.GET._500("", "İhale bilgisi", "Tahtanın takip edilen ihale bilgileri çekilemedi..."));
        }

        var defer;
        switch (_q.query.q) {

            case 'toplam':
                defer = db.tahta.f_db_tahta_ihale_takip_toplami(tahta_id);
                break;
            case 'id':
                defer = db.tahta.f_db_tahta_ihale_takip_idler(tahta_id);
                break;
            case 'veri':
                defer = db.tahta.f_db_tahta_ihale_takip_tumu(tahta_id);
                break;
            default:
                defer = db.tahta.f_db_tahta_ihale_takip_tumu(tahta_id);
                break;
        }

        defer.then(function (_res) {
            _r.status(200).send(mesaj.GET._200(_res, "İhale bilgisi", "Takipteki ihaleler başarıyla çekildi."));
        }).fail(function () {
            _r.status(500).send(mesaj.GET._500("", "İhale bilgisi", "Takipteki ihaleler çekilemedi!"));
        });
    }

    function f_api_tahta_ihale_takip_ekle(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            ihale_id = _q.params.Ihale_Id;

        db.ihale.f_db_tahta_ihale_takip_ekle(tahta_id, ihale_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.POST._200(_res, "İhale bilgisi", "İhale bilgisi başarıyla takip edileceklere eklendi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.POST._500("", "İhale bilgisi", "İhale bilgisi takiptekilere eklenemedi!"));
            });
    }

    function f_api_tahta_ihale_takip_sil(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            ihale_id = _q.params.Ihale_Id;

        db.ihale.f_db_tahta_ihale_takip_sil(tahta_id, ihale_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.DELETE._200(ihale_id, "İhale bilgisi", "İhale bilgisi başarıyla takip edilecekler listesinden silindi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.DELETE._500("", "İhale bilgisi", "İhale bilgisi takiptekilerden silinemedi!"));
            });
    }

    // endregion

    // region GİZLENENLER

    function f_api_tahta_kalem_gizlenen_tumu(_q, _r) {

        var tahta_id = _q.params.Tahta_Id;

        if (!_q.query.q) {
            _r.status(500).send(mesaj.GET._500("", "Kalem bilgisi", "Tahtanın gizlenen KALEM bilgileri çekilemedi..."));
        }

        var defer;
        switch (_q.query.q) {

            case 'toplam':
                defer = db.kalem.f_db_kalem_gizlenen_toplami(tahta_id);
                break;
            case 'id':
                defer = db.kalem.f_db_kalem_gizlenen_idler(tahta_id);
                break;
            case 'veri':
                defer = db.kalem.f_db_kalem_gizlenen_tumu(tahta_id);
                break;
            default:
                defer = db.kalem.f_db_kalem_gizlenen_tumu(tahta_id);
                break;
        }

        defer.then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "Kalem bilgisi", "Gizlenen kalemler başarıyla çekildi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "Kalem bilgisi", "Gizlenen kalemler çekilemedi!"));
            });

    }

    function f_api_tahta_kurum_gizlenen_tumu(_q, _r) {
        var tahta_id = _q.params.Tahta_Id;

        if (!_q.query.q) {
            _r.status(500).send(mesaj.GET._500("", "İhale bilgisi", "Tahtanın gizlenen ihale bilgileri çekilemedi..."));
        }

        var defer;
        switch (_q.query.q) {

            case 'toplam':
                defer = db.kurum.f_db_kurum_gizlenen_toplami(tahta_id);
                break;
            case 'id':
                defer = db.kurum.f_db_kurum_gizlenen_idler(tahta_id);
                break;
            case 'veri':
                defer = db.kurum.f_db_kurum_gizlenen_tumu(tahta_id);
                break;
            default:
                defer = db.kurum.f_db_kurum_gizlenen_tumu(tahta_id);
                break;
        }

        defer.then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "Kurum bilgisi", "Gizlenen kurumlar başarıyla çekildi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "Kurum bilgisi", "Gizlenen kurumlar çekilemedi!"));
            });
    }

    function f_api_tahta_ihale_gizlenen_tumu(_q, _r) {
        var tahta_id = _q.params.Tahta_Id;

        if (!_q.query.q) {
            _r.status(500).send(mesaj.GET._500("", "İhale bilgisi", "Tahtanın gizlenen ihale bilgileri çekilemedi..."));
        }

        var defer;
        switch (_q.query.q) {

            case 'toplam':
                defer = db.tahta.f_db_tahta_ihale_gizlenen_toplami(tahta_id);
                break;
            case 'id':
                defer = db.tahta.f_db_tahta_ihale_gizlenen_idler(tahta_id);
                break;
            case 'veri':
                defer = db.tahta.f_db_tahta_ihale_gizlenen_tumu(tahta_id);
                break;
            default:
                defer = db.tahta.f_db_tahta_ihale_gizlenen_tumu(tahta_id);
                break;
        }

        defer.then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "İhale bilgisi", "Gizlenen ihaleler başarıyla çekildi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "İhale bilgisi", "Gizlenen ihaleler çekilemedi!"));
            });
    }

    function f_api_tahta_gizlenen_tumu(_q, _r) {

        if (!_q.query.tipi) {
            _r.status(500).send(mesaj.GET._500("", "HATA", "Veri tipi bulunamadı!"));
        }

        //gelen tipe göre yönlendiriyoruz
        switch (_q.query.tipi) {

            case 'ihale':
                return f_api_tahta_ihale_gizlenen_tumu(_q, _r);
                break;
            case 'kalem':
                return f_api_tahta_kalem_gizlenen_tumu(_q, _r);
                break;
            case 'kurum':
                return f_api_tahta_kurum_gizlenen_tumu(_q, _r);
                break;
        }
    }

    // region ihale gizle ekle-sil
    function f_api_tahta_ihale_gizlenen_ekle(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            ihale_id = _q.params.Ihale_Id,
            kullanici_id = _q.session.ss.kullanici.Id;

        db.ihale.f_db_tahta_ihale_gizlenen_ekle(tahta_id, ihale_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.POST._200(_res, "İhale bilgisi", "İhale bilgisi başarıyla gizlendi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.POST._500("", "İhale bilgisi", "İhale bilgisi gizlenemedi!"));
            });
    }

    function f_api_tahta_ihale_gizlenen_sil(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            ihale_id = _q.params.Ihale_Id;

        db.ihale.f_db_tahta_ihale_gizlenen_sil(tahta_id, ihale_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.DELETE._200(ihale_id, "İhale bilgisi", "Gizlenen ihale bilgisi başarıyla geri alındı."));
            })
            .fail(function () {
                _r.status(400).send(mesaj.DELETE._400("", "İhale bilgisi", "Gizlenen ihale bilgisi geri alınamadı!"));
            });
    }

    // endregion

    // region kurum gizle ekle-sil
    function f_api_tahta_kurum_gizlenen_ekle(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            kurum_id = _q.params.Kurum_Id,
            kullanici_id = _q.session.ss.kullanici.Id;

        db.kurum.f_db_tahta_kurum_gizlenen_ekle(tahta_id, kurum_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.POST._200(_res, "Kurum bilgisi", "Kurum bilgisi başarıyla gizlendi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.POST._500("", "Kurum bilgisi", "Kurum bilgisi gizlenemedi!"));
            });
    }

    function f_api_tahta_kurum_gizlenen_sil(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            kurum_id = _q.params.Kurum_Id;

        db.kurum.f_db_tahta_kurum_gizlenen_sil(tahta_id, kurum_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.DELETE._200(kurum_id, "Kurum bilgisi", "Gizlenen kurum bilgisi başarıyla geri alındı."));
            })
            .fail(function () {
                _r.status(400).send(mesaj.DELETE._400("", "Kurum bilgisi", "Gizlenen kurum bilgisi geri alınamadı!"));
            });
    }

    // endregion

    // region kalem gizle ekle-sil
    function f_api_tahta_kalem_gizlenen_ekle(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            kalem_id = _q.params.Satir_Id,
            kullanici_id = _q.session.ss.kullanici.Id;

        db.kalem.f_db_kalem_gizlenen_ekle(tahta_id, kalem_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.POST._200(_res, "Kalem bilgisi", "Kalem bilgisi başarıyla gizlendi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.POST._500("", "Kalem bilgisi", "Kalem bilgisi gizlenemedi!"));
            });
    }

    function f_api_tahta_kalem_gizlenen_sil(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            kalem_id = _q.params.Satir_Id;

        db.kalem.f_db_kalem_gizlenen_sil(tahta_id, kalem_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.DELETE._200(kalem_id, "Kalem bilgisi", "Gizlenen kalem bilgisi başarıyla geri alındı."));
            })
            .fail(function () {
                _r.status(400).send(mesaj.DELETE._400("", "Kalem bilgisi", "Gizlenen kalem bilgisi geri alınamadı!"));
            });
    }

    // endregion


    // endregion

    // region İHALEYE BAĞLI KALEMLER

    /**
     *
     * @param _tahta_id
     * @param _ihale_id
     * @param {URLQuery} _arama
     */
    function f_aranan_kalem(_tahta_id, _ihale_id, _arama) {
        var defer = db.redis.dbQ.Q.defer();

        // region aranan kalemleri elastic den sorgula ve bilgilerini göster
        function f_elastic_kalemleri_bagla(_kalem_idleri) {

            function f_elastic_kalem_search(_kalem_idleri) {
                var query = {
                    "query": {
                        "filtered": {
                            "query": {
                                "query_string": {"query": "*" + _arama.Aranan + "*"}
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
                    "sort": db.elastic.f_sort(_arama)
                };

                return db.elastic.f_search({
                    method: "POST",
                    index: db.elastic.SABIT.INDEKS.APP,
                    type: db.elastic.SABIT.TIP.KALEM,
                    size: _arama.Sayfalama.SatirSayisi,
                    from: _arama.Sayfalama.Sayfa * _arama.Sayfalama.SatirSayisi,
                    body: query
                });
            };

            return f_elastic_kalem_search(_kalem_idleri)
                .then(function (_respElastic) {
                    var sonuc = schema.f_create_default_object(schema.SCHEMA.LAZY_LOADING_RESPONSE);
                    sonuc.ToplamKayitSayisi = _respElastic[0].hits.total;

                    var kalemler = _respElastic[0].hits.hits.pluckX("_source");
                    if (kalemler && kalemler.length > 0) {

                        var gelen_kalem_idler = kalemler.pluckX("Id");

                        //sadece aktiflerin onay durumları ve takipte olup olmadıklarını buluyoruz
                        //diğer durumlarda bunlara gerek yok
                        if (_arama.Kriter == schema.SABIT.URL_QUERY.KRITER.AKTIFLER) {

                            return db.redis.dbQ.Q.all([
                                db.kalem.f_db_kalem_takip_kontrol(_tahta_id, kalemler),
                                db.kalem.f_db_kalem_onay_durumu(gelen_kalem_idler, _tahta_id)
                            ]).then(function (_ress) {
                                var olusan_kalem = _.extend(kalemler, _ress[0]);
                                var arr_onay_durumlari = _ress[1];

                                return olusan_kalem.map(function (_elm, _idx) {
                                    _elm.OnayDurumu = arr_onay_durumlari[_idx];
                                    return _elm;
                                }).allX()
                                    .then(function (_olusan) {
                                        sonuc.Data = _olusan;
                                        return sonuc;
                                    });
                            });

                        } else if (_arama.Kriter == schema.SABIT.URL_QUERY.KRITER.TAKIPTEKILER) {

                            return db.kalem.f_db_kalem_onay_durumu(gelen_kalem_idler, _tahta_id)
                                .then(function (arr_onay_durumlari) {

                                    return kalemler.map(function (_elm, _idx) {
                                        _elm.OnayDurumu = arr_onay_durumlari[_idx];
                                        return _elm;
                                    }).allX()
                                        .then(function (_olusan) {
                                            sonuc.Data = _olusan;
                                            return sonuc;
                                        });
                                });
                        }
                        else {
                            sonuc.Data = kalemler;
                            return sonuc;
                        }

                    } else {
                        sonuc.Data = [];
                        return sonuc;
                    }
                });
        };
        // endregion

        /**
         * Gelen kritere göre uygun kalem idlerini buluyoruz
         * Örn aktifler geldi ise tahtaya ait kalem+genel aktif kalem-(gizlenen+silinen) kayıtlar çekilir.
         *
         */
        var defer_kriter;
        if (_arama.Kriter == schema.SABIT.URL_QUERY.KRITER.AKTIFLER) {
            defer_kriter = db.ihale.f_db_ihale_aktif_kalem_idler(_ihale_id, _tahta_id);
        }
        else if (_arama.Kriter == schema.SABIT.URL_QUERY.KRITER.TAKIPTEKILER) {
            defer_kriter = db.ihale.f_db_ihale_tahtanin_takipteki_kalem_idleri(_ihale_id, _tahta_id)
        }
        else if (_arama.Kriter == schema.SABIT.URL_QUERY.KRITER.GIZLENENLER) {
            defer_kriter = db.ihale.f_db_ihale_tahtanin_gizlenen_kalem_idleri(_ihale_id, _tahta_id)
        }

        defer_kriter
            .then(function (_kalem_idler) {
                console.log("_kalem_idler");
                console.log(_kalem_idler);

                if (_kalem_idler.length > 0) {
                    f_elastic_kalemleri_bagla(_kalem_idler)
                        .then(function (_kalemler) {
                            defer.resolve(_kalemler);
                        })
                } else {
                    defer.resolve([]);
                }
            });

        return defer.promise;
    }

    function f_api_tahta_ihale_satirlari_sayfali(_q, _r) {

        var ihale_id = _q.params.Ihale_Id,
            tahta_id = _q.params.Tahta_Id;

        (_q.query.q
            ? f_aranan_kalem(tahta_id, ihale_id, _q.UrlQuery)
            : db.ihale.f_db_ihale_kalemleri_by_page(ihale_id, tahta_id, _q.UrlQuery))
            .then(function (_aktif) {
                _r.status(200).send(mesaj.GET._200(_aktif, "İhale kalemleri", "İhale kalemleri başarıyla çekildi"));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.GET._500(_err, "İhale kalemleri", "İhale kalemleri çekilemedi..."));
            });
    }

    function f_api_tahta_ihale_satir_tumu(_q, _r) {

        var ihale_id = _q.params.Ihale_Id,
            tahta_id = _q.params.Tahta_Id;

        db.ihale.f_db_ihale_kalem_tumu(ihale_id, tahta_id)
            .then(function (_aktif) {
                _r.status(200).send(mesaj.GET._200(_aktif, "İhale kalemleri", "İhale kalemleri başarıyla çekildi"));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.GET._500(_err, "İhale kalemleri", "İhale kalemleri çekilemedi..."));
            });
    }

    // endregion

    // endregion

    // region DÖVİZ KURLARI
    function f_api_doviz_kurlari_tazele(_q, _r) {

        db.doviz.f_db_doviz_kurlari_cek_ekle(0)
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "Kurları çek", "Kurlar başarıyla çekildi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "Kurları çek", "Kurlar çekilemedi!"));
            });
    }

    function f_api_doviz_kurlari_getir_tarih_araligindaki(_q, _r) {
        var paraBirim_id = _q.params.ParaBirim_Id,
            kurTipi_id = _q.params.KurTipi_Id,
            tarih1 = _q.params.Tarih1,
            tarih2 = _q.params.Tarih2;

        db.doviz.f_db_doviz_tarih_araligindaki_kurlari_getir(paraBirim_id, kurTipi_id, tarih1, tarih2)
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "Kurları çek", "Kurlar başarıyla çekildi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "Kurları çek", "Kurlar çekilemedi!"));
            });
    }

    // endregion

    // region ROLLER
    function f_api_rolleri_tazele(_q, _r) {
        var json = require("../../../../lib/roller.json"),
            kullanici_id = _q.session.ss.kullanici.Id;

        db.rol.f_db_rol_ekle(json.data, 0, kullanici_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "Rol bilgisi", "Roller başarıyla eklendi.."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "Rol bilgisi", "Roller eklenemedi!"));
            });
    }

    // endregion

    // region TAHTA URUNLERI
    function f_api_urunleri_tazele(_q, _r) {
        var json = require("../../../../lib/urunler.json"),
            kullanici_id = _q.session.ss.kullanici.Id,
            uretici_id = _q.params.Kurum_Id,
            tahta_id = _q.params.Tahta_Id;

        db.urun.f_db_urun_ekle(json.data, uretici_id, tahta_id, kullanici_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "Ürün ekle", "Ürünler başarıyla eklendi.."));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.GET._500(_err, "Ürün ekle", "Ürünler eklenemedi!"));
            });
    }

    // endregion

    // region TEKLİF İŞLEMLERİ
    function f_api_tahta_teklif_ekle(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            teklif = _q.body,
            db_teklif = schema.f_suz_klonla(schema.SCHEMA.DB.TEKLIF, teklif),
            kullanici_id = _q.session.ss.kullanici.Id;

        db.teklif.f_db_teklif_ekle(tahta_id, db_teklif, kullanici_id)
            .then(function (_dbResult) {
                _r.status(201).send(mesaj.POST._201(_dbResult, "Teklif ekle", "Kaleme bağlı teklif BAŞARIYLA eklendi."));
            })
            .fail(function (_err) {
                if (_err instanceof exception.YetkisizErisim) {
                    _r.status(405).send(mesaj.POST._405("", _err.Baslik, _err.Icerik));
                }
                else {
                    _r.status(500).send(mesaj.POST._500(_err, _err.Baslik, "Teklif eklenirken hata oluştu>" + _err.Icerik));
                }
            });
    }

    function f_api_tahta_teklif_guncelle(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            teklif = _q.body,
            db_teklif = schema.f_suz_klonla(schema.SCHEMA.DB.TEKLIF, teklif),
            kullanici_id = _q.session.ss.kullanici.Id;

        db.teklif.f_db_teklif_guncelle(tahta_id, db_teklif, kullanici_id)
            .then(function (_dbResult) {
                _r.status(200).send(mesaj.PUT._200(_dbResult, "", "Teklif BAŞARIYLA güncellendi!"));
            })
            .fail(function (_err) {
                if (_err instanceof exception.YetkisizErisim) {
                    _r.status(405).send(mesaj.PUT._405("", _err.Baslik, _err.Icerik));
                }
                else {
                    _r.status(500).send(mesaj.PUT._500(_err, _err.Baslik, "Teklif güncellenirken hata oluştu>" + _err.Icerik));
                }
            });
    }

    function f_api_tahta_teklif_durum_guncelle(_q, _r) {
        var teklif_id = _q.params.Teklif_Id,
            tahta_id = _q.params.Tahta_Id,
            onay_durum_id = _q.params.OnayDurum_Id,
            kullanici_id = _q.session.ss.kullanici.Id;

        db.teklif.f_db_teklif_durum_guncelle(tahta_id, teklif_id, onay_durum_id, kullanici_id)
            .then(function (_dbResult) {
                _r.status(200).send(mesaj.PUT._200(_dbResult, "Teklif durumu güncelle", "Teklif durumu BAŞARIYLA güncellendi!"));
            })
            .fail(function (_err) {
                if (_err instanceof exception.YetkisizErisim) {
                    _r.status(405).send(mesaj.PUT._405("", _err.Baslik, _err.Icerik));
                }
                else {
                    _r.status(500).send(mesaj.PUT._500("", _err.Baslik, "Teklif durumu güncellenirken hata oluştu>" + _err.Icerik));
                }
            });
    }

    function f_api_tahta_teklif_sil(_q, _r) {
        var teklif_id = _q.params.Teklif_Id,
            tahta_id = _q.params.Tahta_Id,
            kullanici_id = _q.session.ss.kullanici.Id;

        db.cop.f_db_cop_teklif_sil(tahta_id, teklif_id, kullanici_id)
            .then(function () {
                _r.status(200).send(mesaj.DELETE._200(parseInt(teklif_id), "Teklif sil", "Kaleme bağlı teklif BAŞARIYLA Silindi!"));
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

    // region İHALEYE BAĞLI TEKLİFLER

    function f_aranan_teklif(_tahta_id, arama) {
        return db.tahta.f_db_tahta_teklif_idleri(_tahta_id)
            .then(function (_teklif_idler) {
                console.log("elastic için teklif idler ne geldi,");
                console.log(JSON.stringify(_teklif_idler));

                var query = {
                    "query": {
                        "filtered": {
                            "query": {
                                "query_string": {"query": "*" + arama.Aranan + "*"}
                            },
                            "filter": {
                                "ids": {
                                    "type": db.elastic.SABIT.TIP.TEKLIF,
                                    "values": _teklif_idler.map(function (e) {
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
                    type: db.elastic.SABIT.TIP.TEKLIF,
                    size: arama.Sayfalama.SatirSayisi,
                    from: arama.Sayfalama.Sayfa * arama.Sayfalama.SatirSayisi,
                    body: query

                }).then(function (_resp) {
                    var sonuc = schema.f_create_default_object(schema.SCHEMA.LAZY_LOADING_RESPONSE);
                    sonuc.ToplamKayitSayisi = _resp[0].hits.total;
                    var teklifler = _resp[0].hits.hits.pluckX("_source");
                    var teklifler_sirali = _.sortBy(teklifler, ['Kalem_Id', 'TeklifDurumu_Id']);
                    sonuc.Data = teklifler_sirali;
                    return sonuc;
                });
            });
    }

    function f_api_tahta_ihale_teklif_tumu(_q, _r) {

        var ihale_id = _q.params.Ihale_Id,
            tahta_id = _q.params.Tahta_Id;

        (_q.UrlQuery.Aranan
            ? f_aranan_teklif(tahta_id, _q.UrlQuery)
            : db.ihale.f_db_ihale_teklif_tumu(tahta_id, ihale_id, _q.UrlQuery))
            .then(function (_aktif) {
                _r.status(200).send(mesaj.GET._200(_aktif, "İhale teklifleri", "İhale teklifleri başarıyla çekildi"));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.GET._500("", "İhale teklifleri", "İhale teklifleri çekilemedi..."));
            });
    }

    // endregion

    // region KALEME BAĞLI TEKLİFLER
    function f_api_tahta_kalem_teklif_tumu(_q, _r) {

        var kalem_id = _q.params.Kalem_Id,
            tahta_id = _q.params.Tahta_Id;

        db.kalem.f_db_kalem_teklif_tumu(tahta_id, kalem_id)
            .then(function (_aktif) {
                _r.status(200).send(mesaj.GET._200(_aktif, "Kalem teklifleri", "Kalem teklifleri başarıyla çekildi"));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.GET._500("", "Kalem teklifleri", "Kalem teklifleri çekilemedi..."));
            });
    }

    // endregion

    // region ÜRÜNE BAĞLI TEKLİFLER
    function f_api_tahta_urun_teklifleri(_q, _r) {
        var urun_id = _q.params.Urun_Id,
            tahta_id = _q.params.Tahta_Id,
            onay_durum_id = _q.query.onay_id,
            paraBirim_id = _q.query.para_id,
            tarih1 = _q.query.tarih1,
            tarih2 = _q.query.tarih2;

        if (!_q.query.q) {
            _r.status(500).send(mesaj.GET._500("", "Ürün teklifleri", "Tahtanın ürün teklifleri çekilemedi..."));
        }

        if (!paraBirim_id || paraBirim_id == 0) {
            _r.status(500).send(mesaj.GET._500("", "Ürün teklifleri", "Para birimi bilgisi bulunamadı. Lütfen para birimi seçiniz.."));
        }

        var defer;
        switch (_q.query.q) {
            case 'veri':
            {
                defer = db.urun.f_db_urunun_teklif_detaylari(tahta_id, urun_id, onay_durum_id, paraBirim_id, true, tarih1, tarih2);
            }
                break;
            case 'grafik':
            {
                throw "db.urun.f_db_urunun_teklifleri_grafik metodu henüz oluşturulmadı";

            }
                break;
            case 'toplam':
            {
                defer = db.urun.f_db_urunun_teklif_toplami(tahta_id, urun_id, onay_durum_id, paraBirim_id, tarih1, tarih2);
            }
                break;
            case 'fiyat':
            {
                defer =
                    onay_durum_id == schema.SABIT.ONAY_DURUM.teklif.KAZANDI
                        ? db.urun.f_db_urunun_kazandigi_teklif_fiyatlari(tahta_id, urun_id, paraBirim_id)
                        : db.urun.f_db_urunun_teklif_verildigi_fiyatlari(tahta_id, urun_id, paraBirim_id);

            }
                break;
            default:
        }

        defer.then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "Ürün teklifleri", "Ürünün teklifleri başarıyla çekildi"));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "Ürün teklifleri", "Ürünün teklifleri çekilemedi..."));
            });
    }

    // endregion

    // region KURUMA BAĞLI TEKLİFLER
    function f_api_tahta_kurum_teklifleri(_q, _r) {
        var kurum_id = _q.params.Kurum_Id,
            tahta_id = _q.params.Tahta_Id,
            para_id = _q.query.para_id,
            onay_id = _q.query.onay_id,
            tarih1 = _q.query.tarih1,
            tarih2 = _q.query.tarih2;

        if (!para_id) {
            throw new exception.Istisna("Validasyon hatası!", "Para birimi olmadan sorgulama yapılamaz!");
        }

        if (!_q.query.q) {
            throw new exception.Istisna("Validasyon hatası!", "Sorgulama tipi olmadan işlem yapılamaz!");
        }

        if (tarih1 > tarih2) {
            throw new exception.Istisna("Validasyon hatası!", "Başlangıç tarihi bitiş tarihinden büyük olamaz!");
        }

        var defer;
        switch (_q.query.q) {
            case 'veri':
            {
                defer = db.kurum.f_db_kurumun_teklifleri_detay(tahta_id, kurum_id, onay_id, para_id, tarih1, tarih2, true);
            }
                break;
            case 'toplam':
            {
                defer = db.kurum.f_db_kurumun_teklifleri_toplam(tahta_id, kurum_id, onay_id, para_id, tarih1, tarih2);
            }
                break;
            case 'fiyat':
            {

            }
                break;
            case 'kazanc':
            {
                defer = db.kurum.f_db_kurum_kazanc_trendi(tahta_id, kurum_id, para_id, tarih1, tarih2)
            }
                break;
            case 'grafik_tahta':
            {
                defer = db.ihale.f_db_tahta_ihale_gruplama(tahta_id, kurum_id, onay_id, para_id, tarih1, tarih2);
            }
                break;
            case 'grafik_kurum':
            {
                defer = db.kurum.f_db_kurumun_ihale_gunlerine_gore_katildigi_ihale_toplamlari(tahta_id, kurum_id, onay_id, para_id, tarih1, tarih2);
            }
                break;
            default:
        }

        defer.then(function (_res) {
            _r.status(200).send(mesaj.GET._200(_res, "Kurum teklifleri", "Kurumun teklifleri başarıyla çekildi"));
        }).fail(function () {
            _r.status(500).send(mesaj.GET._500(null, "Kurum teklifleri", "Kurumun teklifleri çekilemedi..."));
        });

    }

    // endregion


    /**
     * @class APITahta
     */
    return {
        f_api_tahta_ihale_rapor_bilgileri: f_api_tahta_ihale_rapor_bilgileri,
        f_api_tahta_ihale_satirlari_sayfali: f_api_tahta_ihale_satirlari_sayfali,
        f_api_tahta_ajanda: f_api_tahta_ajanda,
        f_api_tahta_ajanda_ekle: f_api_tahta_ajanda_ekle,
        f_api_tahta_ajanda_sil: f_api_tahta_ajanda_sil,
        f_api_tahta_gizlenen_tumu: f_api_tahta_gizlenen_tumu,
        f_api_tahta_kalem_teklif_tumu: f_api_tahta_kalem_teklif_tumu,
        f_api_tahta_haber_silinen: f_api_tahta_haber_silinen,
        f_api_tahta_haber_tumu: f_api_tahta_haber_tumu,
        f_api_tahta_haber_okunan: f_api_tahta_haber_okunan,
        f_api_tahta_haber_ekle: f_api_tahta_haber_ekle,
        f_api_tahta_haber_sil: f_api_tahta_haber_sil,
        f_api_tahta_haber_guncelle: f_api_tahta_haber_guncelle,
        f_api_doviz_kurlari_tazele: f_api_doviz_kurlari_tazele,
        f_api_rolleri_tazele: f_api_rolleri_tazele,
        f_api_urunleri_tazele: f_api_urunleri_tazele,
        f_api_doviz_kurlari_getir_tarih_araligindaki: f_api_doviz_kurlari_getir_tarih_araligindaki,
        f_api_tahta_kurum_teklifleri: f_api_tahta_kurum_teklifleri,
        f_api_tahta_teklif_durum_guncelle: f_api_tahta_teklif_durum_guncelle,
        f_api_tahta_urun_teklifleri: f_api_tahta_urun_teklifleri,
        f_api_tahta_ihale_takip_tumu: f_api_tahta_ihale_takip_tumu,
        f_api_tahta_ihale_takip_ekle: f_api_tahta_ihale_takip_ekle,
        f_api_tahta_ihale_takip_sil: f_api_tahta_ihale_takip_sil,
        f_api_tahta_ihale_gizlenen_ekle: f_api_tahta_ihale_gizlenen_ekle,
        f_api_tahta_ihale_gizlenen_sil: f_api_tahta_ihale_gizlenen_sil,
        f_api_tahta_kurum_gizlenen_ekle: f_api_tahta_kurum_gizlenen_ekle,
        f_api_tahta_kurum_gizlenen_sil: f_api_tahta_kurum_gizlenen_sil,
        f_api_tahta_kalem_gizlenen_ekle: f_api_tahta_kalem_gizlenen_ekle,
        f_api_tahta_kalem_gizlenen_sil: f_api_tahta_kalem_gizlenen_sil,
        f_api_tahta_anahtar_sil: f_api_tahta_anahtar_sil,
        f_api_tahta_anahtar_tumu: f_api_tahta_anahtar_tumu,
        f_api_tahta_anahtar_ekle: f_api_tahta_anahtar_ekle,
        f_api_tahta_ihale_teklif_tumu: f_api_tahta_ihale_teklif_tumu,
        f_api_tahta_teklif_sil: f_api_tahta_teklif_sil,
        f_api_tahta_teklif_guncelle: f_api_tahta_teklif_guncelle,
        f_api_tahta_teklif_ekle: f_api_tahta_teklif_ekle,
        f_api_tahta_uyeleri_tumu: f_api_tahta_uyeleri_tumu,
        f_api_tahta_uye_ekle: f_api_tahta_uye_ekle,
        f_api_tahta_uye_sil: f_api_tahta_uye_sil,
        f_api_tahta_uye_guncelle: f_api_tahta_uye_guncelle,
        f_api_tahta_uye_rol_guncelle: f_api_tahta_uye_rol_guncelle,
        f_api_tahta_davet_eposta_kontrol: f_api_tahta_davet_eposta_kontrol,
        f_api_tahta_davetleri: f_api_tahta_davetleri,
        f_api_tahta_davet_ekle: f_api_tahta_davet_ekle,
        f_api_tahta_davet_sil: f_api_tahta_davet_sil,
        f_api_tahta_tumu: f_api_tahta_tumu,
        f_api_tahta_id: f_api_tahta_id,
        f_api_tahta_teklif_id: f_api_tahta_teklif_id,
        f_api_tahta_ihaleleri: f_api_tahta_ihaleleri,
        f_api_tahta_ihale_satir_tumu: f_api_tahta_ihale_satir_tumu,
        f_api_tahta_ihale_ekle: f_api_tahta_ihale_ekle,
        f_api_tahta_ihale_guncelle: f_api_tahta_ihale_guncelle,
        f_api_tahta_ihale_sil: f_api_tahta_ihale_sil
    };
}

module.exports = APITahta;