'use strict';

var /** @type {DBModel} */
     db = require('kuark-db')(),
    mesaj = require('./API').API;

/**
 *
 * @returns {APIRol}
 * @constructor
 */
function APIRol() {

    function f_api_rol_bolgesi_ekle(_q, _r) {
        var islem = "Rolle ilişkili bölge ekle",
            rol_id = _q.params.Rol_Id,
            tahta_id = _q.params.Tahta_Id,
            bolge_id = _q.body.Bolge_Id;

        db.rol.f_db_rol_bolgesi_ekle(rol_id, bolge_id, tahta_id)
            .then(function (_aktif) {
                _r.status(201).send(mesaj.POST._201(parseInt(bolge_id), islem, "Bölge BAŞARIYLA eklendi.."));
            }).fail(function (_err) {
            _r.status(500).send(mesaj.POST._500(_err, islem, "Bölge eklenemedi!"));
        });
    }

    function f_api_rol_bolgesi_sil(_q, _r) {
        var islem = "Rolle ilişkili bölge sil",
            rol_id = _q.params.Rol_Id,
            tahta_id = _q.params.Tahta_Id,
            bolge_id = _q.params.Bolge_Id;

        db.rol.f_db_rol_bolgesi_sil(rol_id, bolge_id, tahta_id)
            .then(function (_aktif) {
                _r.status(200).send(mesaj.DELETE._200(parseInt(bolge_id), islem, "Bölge BAŞARIYLA silindi.."));
            }).fail(function (_err) {
            _r.status(500).send(mesaj.DELETE._500(_err, islem, "Bölge silinemedi!"));
        });
    }

    function f_api_rol_bolgeleri(_q, _r) {
        var islem = "Rolle ilişkili bölgeler",
            rol_id = _q.params.Rol_Id,
            tahta_id = _q.params.Tahta_Id;

        db.rol.f_db_rol_bolgeleri_tumu(rol_id, tahta_id)
            .then(function (_aktif) {
                _r.status(200).send(mesaj.GET._200(_aktif, islem, "Bölge BAŞARIYLA çekildi.."));
            }).fail(function (_err) {
            _r.status(500).send(mesaj.GET._500(_err, islem, "Bölge çekilemedi!"));
        });
    };


    function f_api_rol_by_id(_q, _r) {
        var islem = "Rol Çekilmesi",
            rol_id = _q.params.Rol_Id,
            tahta_id = _q.params.Tahta_Id;

        db.rol.f_db_rol_id(rol_id)
            .then(function (_aktif) {
                _r.status(200).send(mesaj.GET._200(_aktif, islem, "Rol BAŞARIYLA çekildi."));
            }).fail(function (_err) {
            _r.status(500).send(mesaj.GET._500(_err, islem, "Rol çekilemedi!"));
        });
    }

    function f_api_rol_tumu(_q, _r) {
        var islem = "Rollerin Çekilmesi",
            tahta_id = _q.params.Tahta_Id;

        db.rol.f_db_rol_tumu(tahta_id)
            .then(function (_aktif) {
                _r.status(200).send(mesaj.GET._200(_aktif, islem, "Roller BAŞARIYLA çekildi."));

            }).fail(function (_err) {
            _r.status(500).send(mesaj.GET._500(_err, islem, "Roller çekilemedi!"));
        });
    }

    function f_api_rol_ekle(_q, _r) {
        var rol = _q.body,
            tahta_id = _q.params.Tahta_Id,
            islem = "Rol Ekleme",
            kullanici_id = _q.session.ss.kullanici.Id;

        db.rol.f_db_rol_ekle(rol, tahta_id, kullanici_id)
            .then(function (_dbRol) {
                _r.status(201).send(mesaj.POST._201(_dbRol, islem, "Rol bilgisi BAŞARIYLA eklendi."));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.POST._500(_err, islem, "Rol eklenemedi! "));
            });
    }

    function f_api_rol_guncelle(_q, _r) {
        var rol = _q.body,
            tahta_id = _q.params.Tahta_Id,
            rol_id = _q.params.Rol_Id,
            islem = "Rol Bilgisini Güncelleme",
            kullanici_id = _q.session.ss.kullanici.Id;

        db.rol.f_db_rol_guncelle(tahta_id, rol, kullanici_id)
            .then(function (_dbResult) {
                _r.status(200).send(mesaj.PUT._200(_dbResult, islem, "Rol bilgisi BAŞARIYLA güncellendi!"));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.PUT._500(_err, islem, "Rol bilgisi GÜNCELLENEMEDİ!"));
            });
    }

    function f_api_rol_sil_tahtadan(_q, _r) {
        var tahta_id = parseInt(_q.params.Tahta_Id),
            rol_id = parseInt(_q.params.Rol_Id),
            islem = "Rol Silme";

        /**
         * Önce tahtanın rolüyle ilişkili kullanıcılardan bu rolü sil
         * Sonra tahtadan rolü kaldır.
         */
        db.tahta.f_db_aktif_tahta_uye_idleri(tahta_id)
            .then(function (_arr_uye_idleri) {// uyelerden rolü sil
                _arr_uye_idleri = [].concat(_arr_uye_idleri);

                console.log("_arr_uye_idleri %s > typeof: %s ", _arr_uye_idleri, Array.isArray(_arr_uye_idleri));

                db.rol.f_db_rol_sil_tahta(tahta_id, rol_id, _arr_uye_idleri)
                    .then(function () {
                        _r.status(200).send(mesaj.DELETE._200(parseInt(rol_id), islem, "Rol bilgisi BAŞARIYLA Silindi"));
                    })
                    .fail(function (_err) {
                        _r.status(500).send(mesaj.DELETE._500(_err, islem, "Rol silerken hata oluştu."));
                    });
            })
    }

    function f_api_rol_sil_uyeden(_q, _r) {
        var tahta_id = parseInt(_q.params.Tahta_Id),
            rol_id = parseInt(_q.params.Rol_Id),
            uye_id = parseInt(_q.params.Uye_Id),
            islem = "Rol Silme";

        db.rol.f_db_rol_sil_kullanici(uye_id, tahta_id, rol_id)
            .then(function () {
                _r.status(200).send(mesaj.DELETE._200(parseInt(id), islem, "Rol bilgisi BAŞARIYLA Silindi"));
            }).fail(function (_err) {
            _r.status(500).send(mesaj.DELETE._500(_err, islem, "Rol silerken hata oluştu."));
        });
    }

    /**
     * @class APIRol
     */
    return {
        f_api_rol_bolgesi_ekle: f_api_rol_bolgesi_ekle,
        f_api_rol_bolgesi_sil: f_api_rol_bolgesi_sil,
        f_api_rol_bolgeleri: f_api_rol_bolgeleri,
        f_api_rol_by_id: f_api_rol_by_id,
        f_api_rol_tumu: f_api_rol_tumu,
        f_api_rol_ekle: f_api_rol_ekle,
        f_api_rol_guncelle: f_api_rol_guncelle,
        f_api_rol_sil_tahtadan: f_api_rol_sil_tahtadan,
        f_api_rol_sil_uyeden: f_api_rol_sil_uyeden
    };
}

module.exports = APIRol;