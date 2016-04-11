var express = require('express'),
    path = require('path'),
    Q = require('q'),
    kontrol = require("../../lib/ihaleKontrol"),
    mesaj = require('../api/v1/API').API,
    r = express.Router(),
    util = require('util');

r.route('/tahtalar/:Tahta_Id/yaklasanIhale/kacGun/:KacGun')
    .all(function (_q, _r, next) {
        if (_q.params.KacGun) {
            next();
        } else {
            _r.send(410, "{\"message\":\"Kaç günlük geri gidileceği bilgisi bulunamadı!\"}");
        }
    })
    .get(function (_q, _r) {
        var kacgun = _q.params.KacGun,
            tahta_id = _q.params.Tahta_Id;
        console.log("kaç gün:" + _q.params.KacGun);

        kontrol.f_IhaleTarihiYaklasanlariCek1(tahta_id, kacgun, false)
            .then(function (_res) {
                _r.send(200, mesaj.GET._200(_res, "", "Tarih aralığına göre ihale bilgileri başarıyla çekildi"));
            })
            .fail(function () {
                _r.send(202, mesaj.GET._202("", "", "Tarih aralığına göre İhaleler çekilemedi!"));
            });
    });

r.route('/tahtalar/:Tahta_Id/yaklasanIhale/:Tarih1/:Tarih2')
    .all(function (_q, _r, next) {
        if (_q.params.Tarih1 && _q.params.Tarih2) {
            next();
        } else {
            _r.send(410, "{\"message\":\"Tarih bilgisi bulunamadı!\"}");
        }
    })
    .get(function (_q, _r) {
        var tarih1 = _q.params.Tarih1,
            tarih2 = _q.params.Tarih2,
            tahta_id = _q.params.Tahta_Id;

        kontrol.f_IhaleTarihiYaklasanlariCek2(tahta_id, tarih1, tarih2, false)
            .then(function (_res) {
                _r.send(200, mesaj.GET._200(_res, "", "Tarih aralığına göre ihale bilgileri başarıyla çekildi"));
            })
            .fail(function () {
                _r.send(202, mesaj.GET._202("", "", "Tarih aralığına göre İhaleler çekilemedi!"));
            });
    });

module.exports = r;