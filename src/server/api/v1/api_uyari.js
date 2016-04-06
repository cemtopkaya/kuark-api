'use strict';

var db = require('kuark-db');

/**
 *
 * @returns {APIUyari}
 * @constructor
 */
function APIUyari() {

    function f_api_uyari_ekle(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            uyari = schema.f_suz_klonla(schema.SCHEMA.DB.UYARI, _q.body);

        db.uyari.f_db_uyari_ekle(tahta_id, uyari)
            .then(function (_res) {
                _r.status(201).send(mesaj.POST._201(_res, "Uyarı bilgisi ekle", "Uyarı BAŞARIYLA eklendi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.POST._500("", "Uyarı bilgisi ekle", "Uyarı bilgisi eklenemedi!"));
            });
    }

    function f_api_uyari_guncelle(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            uyari = schema.f_suz_klonla(schema.SCHEMA.DB.UYARI, _q.body);

        db.uyari.f_db_uyari_guncelle(tahta_id, uyari)
            .then(function (_res) {
                _r.status(200).send(mesaj.PUT._200(_res, "Uyarı bilgisi güncelle", "Uyarı BAŞARIYLA güncellendi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.PUT._500("", "Uyarı bilgisi güncelle", "Uyarı bilgisi güncellenemedi!"));
            });
    }

    function f_api_uyari_id(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            uyari_id = _q.params.Uyari_Id;

        db.uyari.f_db_uyari_id(uyari_id, tahta_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "Uyarı bilgisi", "Uyarı BAŞARIYLA çekildi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "Uyarı bilgisi", "Uyarı bilgisi çekilemedi!"));
            });
    }

    function f_api_uyarilar_tumu(_q, _r) {
        var tahta_id = _q.params.Tahta_Id;

        db.uyari.f_db_uyarilar_tahta_tumu(tahta_id)
            .then(function (_res) {
                _r.status(200).send(mesaj.GET._200(_res, "Uyarı bilgisi", "Tahtaya tanımlanmış uyarılar başarıyla çekildi."));
            }).fail(function () {
            _r.status(500).send(mesaj.GET._500("", "Uyarı bilgisi", "Tahtaya ait uyarı bulunamadı!"));
        });
    }

    function f_api_uyarilari_tazele(_q, _r) {

        db.uyari_servisi.f_servis_uyarilari_cek_calistir();
        _r.status(200).send(mesaj.GET._200("", "Uyarı çalıştır", "Sistemde tanımlı uyarılar başarıyla çalıştırıldı."));
        /* .then(function (_res) {
         _r.status(200).send(mesaj.GET._200(_res, "Uyarı çalıştır", "Sistemde tanımlı uyarılar başarıyla çalıştırıldı."));
         }).fail(function () {
         _r.status(500).send(mesaj.GET._500("", "Uyarı çalıştır", "Uyarılar çalıştırılamadı!"));
         });*/
    }

    function f_api_uyari_sil(_q, _r) {
        var tahta_id = _q.params.Tahta_Id,
            uyari_id = _q.params.Uyari_Id,
            kul_id = _q.session.ss.kullanici.Id;

        db.uyari.f_db_uyari_sil(tahta_id, uyari_id, kul_id)
            .then(function () {
                _r.status(200).send(mesaj.DELETE._200(uyari_id, "Uyarı bilgisi sil", "Uyarı BAŞARIYLA silindi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.DELETE._500("", "Uyarı bilgisi sil", "Uyarı bilgisi silinemedi!"));
            });
    }


    /**
     * @class APIUyari
     */
    return {
        f_api_uyari_id: f_api_uyari_id,
        f_api_uyari_ekle: f_api_uyari_ekle,
        f_api_uyari_guncelle: f_api_uyari_guncelle,
        f_api_uyari_sil: f_api_uyari_sil,
        f_api_uyarilar_tumu: f_api_uyarilar_tumu,
        //f_api_uyari_sonuclari_tumu: f_api_uyari_sonuclari_tumu,
        f_api_uyarilari_tazele: f_api_uyarilari_tazele
    };
}

module.exports = APIUyari;