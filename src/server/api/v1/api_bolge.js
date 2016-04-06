'use strict';

var db = require('kuark-db');

/**
 *
 * @returns {APIBolge}
 * @constructor
 */
function APIBolge() {

    function f_api_bolge_id(_q, _r) {
        var id = _q.params.Bolge_Id;

        db.bolge.f_db_bolge_id(id)
            .then(function (bolge) {
                _r.status(200).send(mesaj.GET._200(bolge, "Bölge bilgisi", "Bölge başarıyla çekildi"));
            })
            .fail(function () {
                _r.status(500).send(mesaj.GET._500("", "Bölge bilgisi", "Bölge çekilemedi!"));
            });
    }

    function f_api_bolge_sehirleri_tumu(_q, _r) {

        var id = _q.params.Bolge_Id,
            tahta_id = _q.params.Tahta_Id;

        db.bolge.f_db_bolge_sehirleri(id)
            .then(function (_lst) {
                _r.status(200).send(mesaj.GET._200(_lst, "Şehirler", "Bölgeye ait tüm şehirler başarıyla çekildi."));

            }).fail(function (_err) {

            _r.status(500).send(mesaj.GET._500(_err, "Şehirler", "Bölgeye ait şehirler çekilemedi..."));
        });
    }

    function f_api_bolge_sehir_ekle(_q, _r) {
        console.log("f_api_bolge_sehir_ekle");

        var bolge_id = _q.params.Bolge_Id,
            tahta_id = _q.params.Tahta_Id,
            sehir_id = _q.body.Sehir_Id;

        db.bolge.f_db_bolge_sehir_ekle(sehir_id, bolge_id, tahta_id)
            .then(function () {
                _r.status(201).send(mesaj.POST._201("1", "Şehirler", "Bölgeye ait tüm şehirler başarıyla EKLENDİ."));

            }).fail(function (_err) {

            _r.status(500).send(mesaj.POST._500(_err, "Şehirler", "Bölgeye ait şehir EKLENEMEDİ..."));
        });
    }

    function f_api_bolge_sehir_sil(_q, _r) {
        console.log("f_api_bolge_sehir_sil");

        var bolge_id = _q.params.Bolge_Id,
            tahta_id = _q.params.Tahta_Id,
            sehir_id = _q.params.Sehir_Id;

        db.bolge.f_db_bolge_sehir_sil(sehir_id, bolge_id, tahta_id)
            .then(function () {
                _r.status(200).send(mesaj.DELETE._200("1", "Şehirler", "Bölgeye ait şehir başarıyla SİLİNDİ."));

            }).fail(function (_err) {

            _r.status(500).send(mesaj.DELETE._500(_err, "Şehirler", "Bölgeye ait şehir SİLİNEMEDİ..."));
        });
    }

    function f_api_bolge_tumu(_q, _r) {
        var tahta_id = _q.params.Tahta_Id;
        db.bolge.f_db_bolge_tumu(tahta_id)
            .then(function (_aktif) {
                _r.status(200).send(mesaj.GET._200(_aktif, "Bölgeleri listele", "Tüm bölgeler başarıyla çekildi."));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.GET._500(_err, "Bölgeleri listele", "Bölgeler çekilemedi..."));
            });
    }

    function f_api_bolge_ekle(_q, _r) {

        var bolge = _q.body,
            tahta_id = _q.params.Tahta_Id;

        db.bolge.f_db_bolge_ekle(bolge, tahta_id)
            .then(function (_dbResults) {
                _r.status(200).send(mesaj.POST._200(_dbResults, "Bölge ekle", "Bölge başarıyla eklendi."));
            })
            .fail(function (_err) {
                _r.status(500).send(mesaj.POST._500(_err, "Bölge ekle", "Bölge eklenemedi"));
            });
    }

    function f_api_bolge_guncelle(_q, _r) {
        var bolge = _q.body,
            tahta_id = _q.params.Tahta_Id;

        if (!bolge.Id) throw "Güncellenecek bölgenin seçilmiş olması gerekir";

        db.bolge.f_db_bolge_guncelle(bolge, tahta_id)
            .then(function (_dbResult) {
                _r.status(200).send(mesaj.PUT._200(_dbResult, "Bölge güncelle", "Bölge bilgisi başarıyla güncellendi."));
            })
            .fail(function () {
                _r.status(500).send(mesaj.PUT._500("", "Bölge güncelle", "Bölge bilgisi GÜNCELLENEMEDİ!"));
            });
    }

    function f_api_bolge_sil(_q, _r) {
        var id = _q.params.Bolge_Id,
            tahta_id = _q.params.Tahta_Id;
        db.bolge.f_db_bolge_sil(id, tahta_id)
            .then(function (_dbResults) {
                _r.status(200).send(mesaj.DELETE._200(parseInt(id), "Bölge sil", "Bölge başarıyla Silindi"));
            })
            .fail(function () {
                _r.status(500).send(mesaj.DELETE._500("", "Bölge sil", "Bölge silerken hata oluştu."));
            });
    }

    /**
     * @class APIBolge
     */
    return {
        f_api_bolge_sehir_sil: f_api_bolge_sehir_sil,
        f_api_bolge_sehir_ekle: f_api_bolge_sehir_ekle,
        f_api_bolge_sehirleri_tumu: f_api_bolge_sehirleri_tumu,
        f_api_bolge_tumu: f_api_bolge_tumu,
        f_api_bolge_id: f_api_bolge_id,
        f_api_bolge_ekle: f_api_bolge_ekle,
        f_api_bolge_guncelle: f_api_bolge_guncelle,
        f_api_bolge_sil: f_api_bolge_sil
    }
}

module.exports = APIBolge;