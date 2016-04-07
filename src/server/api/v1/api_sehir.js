'use strict';

var /** @type {DBModel} */
     db = require('kuark-db')(),
    mesaj = require('./API').API;

/**
 *
 * @returns {APISehir}
 * @constructor
 */
function APISehir() {

    function f_api_sehir_tumu(req, res) {
        db.sehir.f_db_sehir_tumu()
            .then(function (_aktif) {
                res.send(200, mesaj.GET._200(_aktif, "Şehirler", "Tüm şehirler başarıyla çekildi."));

            })
            .fail(function () {

                res.send(500, mesaj.GET._500("", "Şehirler", "Şehirler çekilemedi..."));
            });
    }

    function f_api_sehir_id(_q, _r) {
        var id = _q.params.Sehir_Id;

        db.sehir.f_db_sehir_id(id)
            .then(function (sehir) {
                _r.send(200, mesaj.GET._200(JSON.parse(sehir), "Şehir getir", "Şehir bilgisi BAŞARIYLA çekildi."));
            })
            .fail(function () {
                _r.send(500, mesaj.GET._500("", "Şehir getir", "Şehir çekilemedi!"));
            });
    }

    function f_api_sehir_tazele(_q, _r) {
        //tüm şehirleri sisteme ekle
        var arrSehirler = require("../../../public/json/sehirler.json").data;
        db.sehir.f_db_sehir_ekle(arrSehirler)
            .then(function () {
                _r.send(200, mesaj.GET._200("", "Şehir ekle", "Şehirler BAŞARIYLA eklendi."));
            })
            .fail(function () {
                _r.send(500, mesaj.GET._500("", "Şehir ekle", "Şehirler eklenemedi!"));
            });

    }

    function f_api_sehir_adlari(_q, _r) {

        db.sehir.f_db_sehir_adlari()
            .then(function (_sehirler) {
                _r.send(200, mesaj.GET._200(_sehirler, "Şehirler", "Şehir isimleri BAŞARIYLA çekildi."));
            })
            .fail(function () {
                _r.send(500, mesaj.GET._500("", "Şehirler", "Şehirler çekilemedi!"));
            });
    }

    /**
     * @class APISehir
     */
    return {
        f_api_sehir_tazele: f_api_sehir_tazele,
        f_api_sehir_adlari: f_api_sehir_adlari,
        f_api_sehir_tumu: f_api_sehir_tumu,
        f_api_sehir_id: f_api_sehir_id
    };
}

module.exports = APISehir;