'use strict';

var /** @type {DBModel} */
     db = require('kuark-db')(),
    extensions = require('kuark-extensions'),
    schema = require('kuark-schema'),
    exception=require('kuark-istisna'),
    mesaj = require('./API').API;

/**
 *
 * @returns {APIKullanici}
 * @constructor
 */
function APIKullanici() {

    // region KULLANICI HABERLERİ

    /**
     * Kullanıcıya gelen tüm haberleri içerir (aktif haldeki okunup okunmama durumu olmadan)
     * @param _q
     * @param _r
     */
    function f_api_kullanici_haber_tumu(_q, _r) {
        var kul_id = _q.params.Kul_Id;
        db.haber.f_db_haber_tumu(0, kul_id, true, false, false)
            .then(function (arr) {
                _r.status(200).send(mesaj.GET._200(arr, "", "Haberler başarıyla çekildi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "", "Haberler çekilemedi!"));
            });
    }

    function f_api_kullanici_bildirim_tumu(_q, _r) {
        var defer,
            kul_id = _q.params.Kul_Id,
            yeni = _q.query.c == "true",
            silinen = _q.query.d == "true",
            okunan = _q.query.u == "true",
            adet = _q.query.per_page ? parseInt(_q.query.per_page) : 10,
            sayfa = _q.query.page ? parseInt(_q.query.page) : 0;

        //genel tipe ve q ya göre toplamları veya kayıtları bulunur.

        switch (_q.query.q) {
            case schema.SABIT.UYARI.TODO:
            {
                var tumu = _q.query.tumu == "true";
                if (_q.query.tipi == "veri") {
                    defer = db.gorev.f_db_gorev_tumu(kul_id, tumu, !tumu, sayfa, adet);

                } else if (_q.query.tipi == "toplam") {
                    defer = db.gorev.f_db_gorev_toplam(kul_id, tumu, !tumu);
                }
            }
                break;
            case schema.SABIT.UYARI.ALERT:
            {
                if (_q.query.tipi == "veri") {
                    defer = db.dikkat.f_db_dikkat_tumu(kul_id, yeni, silinen, okunan, sayfa, adet);

                } else if (_q.query.tipi == "toplam") {
                    defer = db.dikkat.f_db_dikkat_toplam(kul_id, yeni, silinen, okunan);
                }
            }
                break;
            case schema.SABIT.UYARI.MAIL:
            {
                if (_q.query.tipi == "veri") {
                    defer = db.ileti.f_db_ileti_tumu(kul_id, sayfa, adet);

                } else if (_q.query.tipi == "toplam") {
                    defer = db.ileti.f_db_ileti_toplam(kul_id);
                }
            }
                break;
            case schema.SABIT.UYARI.SMS:
            {
                throw "Sms bildirimi henüz hazır değil";
            }
                break;
            default:
                defer = db.dikkat.f_db_dikkat_tumu(kul_id, yeni, silinen, okunan, sayfa, adet);
                break;
        }

        defer.then(function (_res) {
            _r.status(200).send(mesaj.GET._200(_res, "", "Bildirimler başarıyla çekildi"));
        }).fail(function () {
            _r.status(500).send(mesaj.GET._500("", "", "Bildirimler çekilemedi..."));
        });
    }


    function f_api_kullanici_gorev_son_detayi_ile(_q, _r) {

        var kul_id = _q.params.Kul_Id,
            adet = _q.query.per_page ? parseInt(_q.query.per_page) : 10,
            sayfa = _q.query.page ? parseInt(_q.query.page) : 0;

        db.gorev.f_db_gorev_son_detay_bilgisi_ile(kul_id, true, false, sayfa, adet)
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "", "Görevler başarıyla çekildi"));
            }).fail(function () {
            _r.status(500).send(mesaj.GET._500("", "", "Görevler çekilemedi..."));
        });
    }

    /**
     * Kullanıcının okudugu haberleri içerir
     * @param _q
     * @param _r
     */
    function f_api_kullanici_haber_okunan(_q, _r) {
        var kul_id = _q.params.Kul_Id;
        db.haber.f_db_haber_tumu(0, kul_id, false, false, true)
            .then(function (arr) {
                _r.status(200).send(mesaj.GET._200(arr, "", "Haberler başarıyla çekildi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "", "Haberler çekilemedi!"));
            });
    }

    function f_api_kullanici_dikkat_guncelle(_q, _r) {
        //güncelleme demek okundu olarak işaretlenmesi demektir
        var kul_id = _q.params.Kul_Id,
            dikkat_id = _q.params.Dikkat_Id;
        db.dikkat.f_db_dikkat_guncelle(kul_id, dikkat_id, false, false, true)
            .then(function (arr) {
                _r.status(200).send(mesaj.GET._200(arr, "Dikkat güncelle", "Dikkat bilgisi başarıyla okundu olarak güncellendi.."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "Dikkat güncelle", "Dikkat bilgisi okundu olarak düzenlenemedi!"));
            });
    }

    function f_api_kullanici_gorev_detay(_q, _r) {

        var kul_id = _q.params.Kul_Id,
            id = _q.params.Gorev_Id,
            sayfa = _q.query.page ? parseInt(_q.query.page) : 0,
            adet = _q.query.per_page ? parseInt(_q.query.per_page) : 10;

        db.gorev.f_db_gorev_detay_tumu(id, sayfa, adet)
            .then(function (arr) {
                _r.status(200).send(mesaj.GET._200(arr, "Kullanıcı görevleri", "Görev detay bilgisi başarıyla çekildi.."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "Kullanıcı görevleri", "Görev detay bilgisi çekilemedi!"));
            });
    }

    function f_api_kullanici_gorev_id(_q, _r) {

        var kul_id = _q.params.Kul_Id,
            id = _q.params.Gorev_Id,
            sayfa = _q.query.page ? parseInt(_q.query.page) : 0,
            adet = _q.query.per_page ? parseInt(_q.query.per_page) : 10;

        db.gorev.f_db_gorev_id(id)
            .then(function (arr) {
                _r.status(200).send(mesaj.GET._200(arr, "Kullanıcı görevi", "Görev bilgisi başarıyla çekildi.."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "Kullanıcı görevi", "Görev bilgisi çekilemedi!"));
            });
    }

    function f_api_kullanici_gorev_guncelle(_q, _r) {

        var kul_id = _q.params.Kul_Id,
            id = _q.params.Gorev_Id;
        db.gorev.f_db_gorev_guncelle(kul_id, id)
            .then(function (arr) {
                _r.status(200).send(mesaj.GET._200(arr, "", "Görev bitti olarak belirlendi.."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "", "Görev bitti olarak belirlenemedi!"));
            });
    }

    function f_api_kullanici_gorev_detay_ekle(_q, _r) {

        var kul_id = _q.params.Kul_Id,
            id = _q.params.Gorev_Id,
            detay = _q.body;
        db.gorev.f_db_gorev_detay_ekle(id, detay)
            .then(function (arr) {
                _r.status(200).send(mesaj.GET._200(arr, "", "Görev bilgisi başarıyla eklendi.."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "", "Görev eklenemedi!"));
            });
    }

    function f_api_kullanici_dikkat_sil(_q, _r) {
        var kul_id = _q.params.Kul_Id,
            dikkat_id = _q.params.Dikkat_Id;
        db.dikkat.f_db_dikkat_sil(kul_id, dikkat_id)
            .then(function (arr) {
                _r.status(200).send(mesaj.GET._200(arr, "", "Dikkat bilgisi başarıyla silindi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "", "Dikkat silinemedi!"));
            });
    }

    function f_api_kullanici_ileti_guncelle(_q, _r) {
        //güncelleme demek okundu olarak işaretlenmesi demektir
        var kul_id = _q.params.Kul_Id,
            id = _q.params.Ileti_Id;
        db.ileti.f_db_ileti_guncelle(kul_id, id, false, false, true)
            .then(function (arr) {
                _r.status(200).send(mesaj.GET._200(arr, "", "İleti bilgisi başarıyla okundu olarak güncellendi.."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "", "İleti bilgisi okundu olarak düzenlenemedi!"));
            });
    }

    function f_api_kullanici_ileti_sil(_q, _r) {
        var kul_id = _q.params.Kul_Id,
            id = _q.params.Ileti_Id;
        db.ileti.f_db_ileti_sil(kul_id, id)
            .then(function (arr) {
                _r.status(200).send(mesaj.GET._200(arr, "", "İleti bilgisi başarıyla silindi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "", "İleti silinemedi!"));
            });
    }

    /**
     * Kullanıcıya yeni haber ekle
     * @param _q
     * @param _r
     */
    function f_api_kullanici_haber_ekle(_q, _r) {
        var haber = _q.body,
            kul_id = _q.params.Kul_Id;

        db.haber.f_db_haber_ekle(0, kul_id, haber)
            .then(function (_dbHaber) {
                _r.send(201, mesaj.POST._201(_dbHaber, "", "Haber BAŞARIYLA eklendi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.POST._500("", "", "Haber bilgisi eklenemedi!"));
            });
    }

    function f_api_kullanici_haber_guncelle(_q, _r) {

        var id = _q.params.Haber_Id,
            kul_id = _q.params.Kul_Id;

        db.haber.f_db_haber_guncelle(0, kul_id, id, false, false, true)
            .then(function (_dbHaber) {
                _r.send(200, mesaj.PUT._200(_dbHaber, "", "Haber BAŞARIYLA güncellendi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.POST._500("", "", "Haber bilgisi güncellenemedi!"));
            });
    }

    function f_api_kullanici_haber_sil(_q, _r) {
        var id = _q.params.Haber_Id,
            kul_id = _q.params.Kul_Id;

        db.haber.f_db_haber_sil(0, kul_id, id)
            .then(function (_dbResults) {
                _r.status(200).send(mesaj.DELETE._200(parseInt(id), "", "Haber bilgisi BAŞARIYLA Silindi!"));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.DELETE._500("", _err.Baslik, "Haber silerken hata oluştu>" + _err.Icerik));
            });
    }

    // endregion

    // region KULLANICI TAHTALARI
    /**
     * Kullanıcının hem sahip hem üyesi olduğu tahtalar.
     * @param _q
     * @param _r
     */
    function f_api_kullanici_tahtalari(_q, _r) {
        // 1. Kullanıcının tahtalarını çekelim
        // 2. Session içindeki bilgilerine tahtalarını ekleyelim
        // 3. Cevabı dönelim

        extensions.ssg = [{"??? _dbTahtalar": "oncesi"}];
        //db.kullanici.f_db_kullanici_tahtalari(_q.params.Kul_Id, {rol: true, kullanici: true}) // 1
        db.kullanici.f_db_kullanici_tahtalari(_q.params.Kul_Id) // 1
            .then(function (_dbTahtalar) {

                //extensions.ssg = [{"_dbTahtalar": _dbTahtalar}];
                //_q.session.ss.kullanici.Tahtalari = _dbTahtalar; // 2
                _r.status(200).send(mesaj.GET._200(_dbTahtalar, "Kullanıcı tahtaları", "kullanıcı tahtaları başarıyla çekildi.")); // 3
            })
            .fail(function (_err) {
                extensions.ssr = [{"Kullanıcı Tahtalarında HATA": _err}];
                _r.status(404).send(mesaj.GET._404(_err, "Kullanıcı tahtaları", "kullanıcı tahtası bulunamadı!"));
            });
    }

    function f_api_kullanici_tahta_ekle(_q, _r) {
        var kul_id = _q.session.ss.kullanici.Id,
            tahta = _q.body,
            /**
             * @type Tahta
             */
            tahtaYeni = schema.f_suz_klonla(schema.SCHEMA.INDEX_TAHTA, tahta),
            tahta_db = tahtaYeni.Genel;

        // region VALIDASYON
        if (tahta_db.Kullanici_Id !== kul_id) {
            return _r.status(500).send(mesaj.POST._500("", "", "Sisteme giriş yapmış kullanıcı ile eklenmek istenen tahtanın kullanıcısı aynı değil!"));
        }
        // endregion

        extensions.ssg = [{"tahtaYeni": tahtaYeni}];
        db.tahta.f_db_tahta_ekle(tahta_db, tahta_db.Kullanici_Id)
            .then(function (_res) {
                _r.send(201, mesaj.POST._201(_res, "", "kullanıcı tahtası başarıyla eklendi."));
            })
            .fail(function (_err) {
                console.log("Tahta eklenirken hata oluştu. HATA:\n\t" + _err);
                _r.status(500).send(mesaj.POST._500("", "", "kullanıcı tahtası eklenemedi!"));
            });
    }

    function f_api_kullanici_tahta_guncelle(_q, _r) {

        var kul_id = _q.params.Kul_Id,
            tahta_id = _q.params.Tahta_Id,
            tahta = _q.body,
            tahta_semali = schema.f_suz_klonla(schema.SCHEMA.INDEX_TAHTA, tahta),
            db_genel = tahta_semali.Genel;

        db.tahta.f_db_tahta_guncelle(db_genel, kul_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.PUT._200(_res, "", "Kullanıcı tahtası başarıyla güncellendi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.PUT._500("", "", "Kullanıcı tahtası güncellenemedi!"));
            });
    }

    function f_api_kullanici_tahtadan_ayril(_q, _r) {
        var kul_id = _q.params.Kul_Id,
            tahta_id = _q.params.Tahta_Id;

        db.tahta.f_db_tahtadan_ayril(tahta_id, kul_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.DELETE._200(parseInt(tahta_id), "Tahtadan Ayrılma İşlemi", "Kullanıcı Tahtadan başarıyla ayrıldı."));
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

    function f_api_kullanici_tahta_sil(_q, _r) {
        var kul_id = _q.params.Kul_Id,
            tahta_id = _q.params.Tahta_Id;

        db.cop.f_db_cop_tahta_sil(tahta_id, kul_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.DELETE._200(parseInt(tahta_id), "Tahta Silme İşlemi", "Kullanıcı Tahtası başarıyla silindi."));
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

    // region KULLANICI PROFİL BİLGİSİ
    function f_api_kullanici_profil(_q, _r) {
        var kul_id = _q.params.Kul_Id;

        db.kullanici.f_db_kullanici_profil(kul_id)
            .then(function (_aktif) {
                _r.status(200).send(mesaj.GET._200(_aktif, "", "Kullanıcı profil bilgisi başarıyla çekildi."));
            }).fail(function () {
            _r.status(500).send(mesaj.GET._500("", "", "Kullanıcı profil bilgisi çekilemedi..."));
        });
    }

    function f_api_kullanici_profil_ekle(_q, _r) {
        var profil = _q.body;
        var kul_id = _q.params.Kul_Id;

        db.kullanici.f_db_kullanici_profil_ekle(kul_id, profil)
            .then(function (_dbResult) {
                _r.send(201, mesaj.POST._201(_dbResult, "", "Kullanıcı profil bilgisi başarıyla eklendi."));
            }, function () {
                _r.status(500).send(mesaj.POST._500("", "", "Kullanıcı profil bilgisi eklenemedi!"));
            });
    }

    // endregion

    // region KULLANICI BÖLGELERİ
    function f_api_kullanici_bolge_tumu(_q, _r) {
        var kul_id = _q.params.Kul_Id;
        db.kullanici.f_db_kullanici_bolge_tumu(kul_id)
            .then(function (_aktif) {
                _r.status(200).send(mesaj.GET._200(_aktif, "", "Tüm kullanıcı bölgeleri başarıyla çekildi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "", "Kullanıcı bölgeleri çekilemedi..."));
            });
    }

    function f_api_kullanici_bolge_ekle(_q, _r) {
        var bolge_id = _q.body;
        var kul_id = _q.params.Kul_Id;

        db.kullanici.f_db_kullanici_bolge_ekle(kul_id, bolge_id)
            .then(function (_dbResult) {
                _r.send(201, mesaj.POST._201(parseInt(_dbResult), "Bölge ekle", "Kullanıcı bölgesi başarıyla eklendi."));
            }, function (_err) {
                _r.status(500).send(mesaj.POST._500(_err, "Bölge ekle", "Kullanıcı bölgesi eklenemedi!"));
            });
    }

    function f_api_kullanici_bolge_sil(_q, _r) {
        var kul_id = _q.params.Kul_Id;
        var bolge_id = _q.params.Bolge_Id;

        db.kullanici.f_db_kullanici_bolge_sil(kul_id, bolge_id)
            .then(function () {
                _r.status(200).send(mesaj.DELETE._200(parseInt(bolge_id), "Bölge sil", "Kullanıcı bölgesi başarıyla silindi."));
            }, function () {
                _r.status(500).send(mesaj.DELETE._500("", "Bölge sil", "Kullanıcı bölgesi silinemedi!"));
            });
    }

    // endregion

    // region KULLANICI YETKİLERİ
    function f_api_kullanici_yetki_tumu(_q, _r) {
        var kul_id = _q.params.Kul_Id;
        db.kullanici.f_db_kullanici_yetki_tumu(kul_id)
            .then(function (_aktif) {
                _aktif
                    ? _r.status(200).send(mesaj.GET._200(_aktif, "Kullanıcı yetkileri", "Tüm kullanıcı yetkileri başarıyla çekildi.")) : _r.status(204).send(mesaj.GET._204(_aktif, "", "Kullanıcı yetkisi tanımlanmamış."));
            }).fail(function () {
            _r.status(500).send(mesaj.GET._500("", "Kullanıcı yetkileri", "Kullanıcı yetkileri çekilemedi..."));
        });
    }

    function f_api_kullanici_yetki_ekle(_q, _r) {
        var yetki_id = _q.body;
        var kul_id = _q.params.Kul_Id;

        db.kullanici.f_db_kullanici_yetki_ekle(kul_id, yetki_id)
            .then(function (_dbResult) {
                _r.send(201, mesaj.POST._201(_dbResult, "Yetki ekle", "Kullanıcı yetkisi başarıyla eklendi."));
            }, function () {
                _r.status(500).send(mesaj.POST._500("", "Yetki ekle", "Kullanıcı yetkisi eklenemedi!"));
            });
    }

    function f_api_kullanici_yetki_guncelle(_q, _r) {
        var yetki = _q.body,
            kul_id = _q.params.Kul_Id;

        db.kullanici.f_db_kullanici_yetki_guncelle(kul_id, yetki)
            .then(function (_dbResult) {
                _r.send(200, mesaj.PUT._200(_dbResult, "Yetki güncelle", "Kullanıcı yetkisi başarıyla güncellendi."));
            }, function () {
                _r.status(500).send(mesaj.PUT._500("", "Yetki güncelle", "Kullanıcı yetkisi eklenemedi!"));
            });
    }

    function f_api_kullanici_yetki_sil(_q, _r) {
        var kul_id = _q.params.Kul_Id,
            yetki_id = _q.params.Yetki_Id;

        db.kullanici.f_db_kullanici_yetki_sil(kul_id, yetki_id)
            .then(function (_dbResult) {
                _r.status(200).send(mesaj.DELETE._200(parseInt(yetki_id), "Yetki sil", "Kullanıcı yetkisi başarıyla silindi."));
            }, function () {
                _r.status(500).send(mesaj.DELETE._500("", "", "Kullanıcı yetkisi silinemedi!"));
            });
    }


    // endregion

    // region KULLANICI BİLGİLERİ
    /**
     * Gelen şifre sessiondaki şifre ile aynı ise giriş yapabilir. yoksa hata mesajı gösterilir
     */
    function f_api_kullanici_pass(_q, _r) {
        var kullanici = _q.session.ss.kullanici;
        if (_q.params.Kul_Id == kullanici.Id) {

            if (kullanici.Sifre == _q.body.Pass) {

                _r.status(200).send(mesaj.POST._200("", "Kullanıcı şifre", "Kullanıcı şifresi doğru."));

            } else {
                _r.status(500).send(mesaj.POST._500("", "", "Kullanıcı şifresi HATALI."));
            }
        } else {
            _r.status(500).send(mesaj.POST._500("", "", "Kullanıcı bilgisi sessiondaki ile aynı değil!"));
        }
    }

    function f_api_kullanici_session(_q, _r) {
        console.log("JSON.stringify(_q.session.ss.kullanici)");
        console.log(JSON.stringify(_q.session.ss.kullanici));

        var sonuc = schema.f_suz_klonla(schema.SCHEMA.KULLANICI_BROWSER, _q.session.ss.kullanici);
        console.log("JSON.stringify(sonuc)");
        console.log(JSON.stringify(sonuc));
        //_r.status(200).send(mesaj.GET._200(_q.session.ss.kullanici, "", "Kullanıcı bilgisi başarıyla çekildi."));
        _r.status(200).send(mesaj.GET._200(sonuc, "", "Kullanıcı bilgisi başarıyla çekildi."));
    }

    function f_api_kullanici_id(_q, _r) {
        var id = _q.params.Kul_Id;
        db.kullanici.f_db_kullanici_id(id)
            .then(function (_bulunan) {
                _bulunan
                    ? _r.status(200).send(mesaj.GET._200(_bulunan, "", "Kullanıcı bilgisi başarıyla çekildi."))
                    : _r.status(404).send(mesaj.GET._404(_bulunan, "", "Kullanıcı bilgisi bulunamadı!"));
            }).fail(function () {
            _r.status(500).send(mesaj.GET._500("", "", "Kullanıcı bilgisi çekilemedi..."));
        });
    }

    function f_api_kullanici_ekle(_q, _r) {
        var kullanici = _q.body;

        db.kullanici.f_db_kullanici_ekle(kullanici)
            .then(function (_dbResult) {
                _q.session.ss.kullanici = _dbResult;
                _r.send(201, mesaj.POST._201(_dbResult, "", "Kullanıcı başarıyla eklendi."));
            }, function (_err) {
                _r.status(500).send(mesaj.POST._500(null, null, "Kullanıcı eklenemedi! Hata: " + _err));
            });
    }

    function f_api_kullanici_oturum_durumu_ekle(_q, _r) {
        var kul_id = _q.params.Kul_Id,
            durum_id = _q.params.Durum_Id;

        db.kullanici.f_db_kullanici_oturum_durumu_ekle(kul_id, durum_id)
            .then(function (_dbResult) {
                _q.session.ss.kullanici.OturumDurumu = durum_id;
                _r.send(201, mesaj.POST._201(durum_id, "Oturum durumu", "Kullanıcı durumu başarıyla değiştirildi."));
            }, function (_err) {
                _r.status(500).send(mesaj.POST._500("", "Oturum durumu", "Kullanıcı durumu başarıyla değiştirildi"));
            });
    }

    function f_api_kullanici_guncelle(_q, _r) {
        var kullanici = _q.body,
            db_kullanici = schema.f_suz_klonla(schema.SCHEMA.DB.KULLANICI, kullanici);

        db.kullanici.f_db_kullanici_guncelle(db_kullanici)
            .then(function (_dbResult) {
                _r.send(200, mesaj.PUT._200(_dbResult, "", "Kullanıcı bilgisi başarıyla güncellendi!"));
            })
            .fail(function () {
                _r.status(500).send(mesaj.PUT._500("", "", "Kullanıcı bilgisi GÜNCELLENEMEDİ!"));
            });
    }

    function f_api_kullanici_sil(_q, _r) {
        var id = _q.params.Kul_Id;
        db.kullanici.f_db_kullanici_sil(id)
            .then(function (_dbResults) {
                _r.status(200).send(mesaj.DELETE._200(parseInt(id), "", "Kullanıcı Silindi"));
            }).fail(function () {
            _r.status(400).send(mesaj.DELETE._400("", "", "Kullanıcı silerken hata oluştu."));
        });
    }

    /* Active Directory Kullanıcılarını bulur */
    function f_api_ad_kullanicilarini_bul(_q, _r) {
        var ad = require('../../ldap/AD')('adminservices', 'q1w2e3r4');

        ad.f_findUsers(_q.params.cn)
            .then(function (_adResults) {
                _r.status(200).send(mesaj.DELETE._200(1, "AD'de bulunan kullanıcılar", _adResults));
            }).fail(function () {
            _r.status(500).send(mesaj.DELETE._500("", "", "AD Kullanıcılarını ararken hata oluştu."));
        });
    }

    // endregion

    /**
     * @class APIKullanici
     */
    return {
        f_api_kullanici_gorev_id: f_api_kullanici_gorev_id,
        f_api_kullanici_gorev_son_detayi_ile: f_api_kullanici_gorev_son_detayi_ile,
        f_api_kullanici_gorev_guncelle: f_api_kullanici_gorev_guncelle,
        f_api_kullanici_pass: f_api_kullanici_pass,
        f_api_kullanici_gorev_detay: f_api_kullanici_gorev_detay,
        f_api_kullanici_gorev_detay_ekle: f_api_kullanici_gorev_detay_ekle,
        f_api_kullanici_dikkat_guncelle: f_api_kullanici_dikkat_guncelle,
        f_api_kullanici_dikkat_sil: f_api_kullanici_dikkat_sil,
        f_api_kullanici_ileti_guncelle: f_api_kullanici_ileti_guncelle,
        f_api_kullanici_ileti_sil: f_api_kullanici_ileti_sil,
        f_api_kullanici_bildirim_tumu: f_api_kullanici_bildirim_tumu,
        f_api_kullanici_oturum_durumu_ekle: f_api_kullanici_oturum_durumu_ekle,
        f_api_kullanici_haber_sil: f_api_kullanici_haber_sil,
        f_api_kullanici_haber_guncelle: f_api_kullanici_haber_guncelle,
        f_api_kullanici_haber_ekle: f_api_kullanici_haber_ekle,
        f_api_kullanici_haber_okunan: f_api_kullanici_haber_okunan,
        f_api_kullanici_haber_tumu: f_api_kullanici_haber_tumu,
        f_api_kullanici_profil: f_api_kullanici_profil,
        f_api_kullanici_profil_ekle: f_api_kullanici_profil_ekle,
        f_api_kullanici_tahta_ekle: f_api_kullanici_tahta_ekle,
        f_api_kullanici_tahtalari: f_api_kullanici_tahtalari,
        f_api_kullanici_tahta_guncelle: f_api_kullanici_tahta_guncelle,
        f_api_kullanici_tahta_sil: f_api_kullanici_tahta_sil,
        f_api_kullanici_bolge_tumu: f_api_kullanici_bolge_tumu,
        f_api_kullanici_bolge_ekle: f_api_kullanici_bolge_ekle,
        f_api_kullanici_bolge_sil: f_api_kullanici_bolge_sil,
        f_api_kullanici_yetki_tumu: f_api_kullanici_yetki_tumu,
        f_api_kullanici_yetki_ekle: f_api_kullanici_yetki_ekle,
        f_api_kullanici_yetki_guncelle: f_api_kullanici_yetki_guncelle,
        f_api_kullanici_yetki_sil: f_api_kullanici_yetki_sil,
        f_api_kullanici_session: f_api_kullanici_session,
        f_api_kullanici_ekle: f_api_kullanici_ekle,
        f_api_kullanici_id: f_api_kullanici_id,
        f_api_kullanici_guncelle: f_api_kullanici_guncelle,
        f_api_kullanici_sil: f_api_kullanici_sil,
        f_api_ad_kullanicilarini_bul: f_api_ad_kullanicilarini_bul,
        f_api_kullanici_tahtadan_ayril: f_api_kullanici_tahtadan_ayril
    };
}

module.exports = APIKullanici;