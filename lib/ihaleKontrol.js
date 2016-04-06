function IhaleKontrol() {

    /*
     * İHALE TARİHİ YAKLAŞANLARI UYARACAĞIZ
     * YENİ EKLENEN İHALELERİ HABERLERE EKLEYECEĞİZ
     */
    var express = require('express'),
        path = require('path'),
        Q = require('q'),
        _ = require('lodash'),
        db = require('kuark-db'),
        EMail = require('./email'),
        result = {},
        tum_kurumlar = [];

    //region YARDIMCI
    var f_tum_kurumlari_cek = function (_tahta_id) {

        var defer = Q.defer();
        if (tum_kurumlar.length == 0) {
            db.kurum.f_db_kurum_tumu(_tahta_id)
                .then(function (_aktifKurumlar) {
                    tum_kurumlar = _aktifKurumlar;
                    defer.resolve(tum_kurumlar);
                })
                .fail(function (_err) {
                    console.log("tüm kurumlar çekilemedi." + _err);
                    defer.reject("tüm kurumlar çekilemedi!")
                });
        } else {
            defer.resolve(tum_kurumlar);
        }
        return defer.promise;
    };

    var f_ihaleleri_cek = function (_tahta_id, _tarih1, _tarih2, _mailAt) {
        var defer = Q.defer();
        console.log("tarih1:" + _tarih1);
        console.log("tarih2:" + _tarih2);

        f_tum_kurumlari_cek(_tahta_id)
            .then(function (_dbKurumlar) {
                db.ihale.f_db_ihale_yapilmaTarihineGore(_tarih1, _tarih2, _tahta_id)
                    .then(function (_ihaleler) {
                        if (_ihaleler) {
                            if (_mailAt) {
                                var html = f_htmlOlustur(_ihaleler, _dbKurumlar);
                                f_mailAt(html)
                                    .then(function (_res) {
                                        defer.resolve(_ihaleler);
                                    })
                                    .fail(function () {
                                        console.log("Mail gönderilemedi");
                                        defer.reject("Mail gönderilemedi!");
                                    });
                            } else {
                                defer.resolve(_ihaleler);
                            }
                        }
                    })
                    .fail(function (_err) {
                        console.log("Yapılma tarihine göre ihaleler çekilemedi ve mail için gönderilecek html oluşturulamadı!" + _err);
                        console.log(arguments);
                        defer.reject("Yapılma tarihine göre ihaleler çekilemedi!")
                    });
            })
            .fail(function (_err) {
                console.log("Kurumlar çekilemedi!" + _err);
                console.log(arguments);
                defer.reject("Kurumlar çekilemedi!")
            });
        return defer.promise;
    };

    function f_htmlOlustur(_ihaleler, _dbKurumlar) {
        if (_ihaleler) {
            var html = "<html>";
            html += "<style> table, th, td {  border: 1px solid black;  border-collapse: collapse;} th, td {  padding: 5px;  }  th {  text-align: left;  }  </style>";
            html += "<p>Sn İlgili,<br/><br/>Tarihi yaklaşan ihalelerin detayları aşağıdadır:<br/></p>";
            html += "<table style='width:100%'>";
            html += "<tr>";
            html += "<th>İhale Tarihi</th>";
            html += "<th>İhale No</th>";
            html += "<th>Konusu</th>";
            html += "<th>Yapılacağı Adres</th>";
            html += "<th>Kurumu</th>";
            html += "</tr>";

            _ihaleler.forEach(function (ihale) {
                html += "<tr>";
                html += "<td>" + new Date(ihale.IhaleTarihi) + "</td>";
                html += "<td>" + (ihale.IhaleNo ? ihale.IhaleNo : "") + "</td>";
                html += "<td>" + (ihale.Konusu ? ihale.Konusu : "" ) + "</td>";
                html += "<td>" + (ihale.YapilacagiAdres ? ihale.YapilacagiAdres : "") + "</td>";

                if (ihale.Kurum_Id) {
                    var kurum = _.where(_dbKurumlar, {Id: ihale.Kurum_Id});
                    html += "<td>" + (kurum.length > 0 ? kurum[0].Adi : "") + "</td>";
                } else {
                    html += "<td></td>";
                }
                html += "</tr>";
            });
            html += "</table>";
            html += "</html>";
            return html;
        }
        return "";
    }

    function f_mailAt(_html) {
        var defer = Q.defer();

        var mail = new EMail("", "", "", true);

        var txt = _html,
            from = "",
            to = "duygu.akmaz@fmc-ag.com",
            cc = "",
            bcc = "",
            subject = "İhale Bilgilendirme hk";

        mail.f_send(txt, from, to, cc, bcc, subject, true)
            .then(function (_res) {
                defer.resolve(_res);
            })
            .fail(function (_err) {
                console.log("Mail gönderilemedi!" + _err);
                console.log(arguments);
                defer.reject("Mail gönderilemedi" + _err);
            });
        return defer.promise;
    }
    // endregion

    /**
     * bugunden verilen gün sonrasına kadar kayıtlı ihaleler
     * @param {int} _tahta_id
     * @param {int} _bugundenkacGunSonrasi
     * @param {boolean} _mailAt
     */
    var f_IhaleTarihiYaklasanlariCek1 = function (_tahta_id, _bugundenkacGunSonrasi, _mailAt) {
        //bugunden x gün  sonrasına kadar olan ihaleler (ihale tarihi) çekiliyor
        console.log(_bugundenkacGunSonrasi);

        var d = new Date();
        d.setDate(d.getDate() + _bugundenkacGunSonrasi);

        var tarih1 = new Date().getTime(),
            tarih2 = d.getTime();

        return f_ihaleleri_cek(_tahta_id, tarih1, tarih2, _mailAt);
    };

    /**
     * iki tarih aralıgındaki ihaleler
     * @param {int} _tahta_id
     * @param {int} _bugundenkacGunSonrasi
     * @param {boolean} _mailAt
     */
    var f_IhaleTarihiYaklasanlariCek2 = function (_tahta_id, _tarih1, _tarih2, _mailAt) {
        return f_ihaleleri_cek(_tahta_id, _tarih1, _tarih2, _mailAt);
    };

    result = {
        f_IhaleTarihiYaklasanlariCek1: f_IhaleTarihiYaklasanlariCek1,
        f_IhaleTarihiYaklasanlariCek2: f_IhaleTarihiYaklasanlariCek2
    };

    return result;
}

module.exports = IhaleKontrol();