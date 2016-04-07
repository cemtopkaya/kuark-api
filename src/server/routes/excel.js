/*
 BAŞLIKLAR
 [
 "Grup Adı",
 "İhale Kayıt No",
 "Konu",
 "İhale Tarihi",
 "Statü",
 "Kurum Adı",
 "Şehir",
 "Usulü",
 "Sıra No",
 "Malzeme Cinsi",
 "Miktarı",
 "Birimi",
 "Açıklama",
 "Malzeme Kodu"
 ]
 //basliklar = ihaleBilgileri[13],

 var birimler = [

 {"Id": 1, "Adi": "Adet"},
 {"Id": 2, "Adi": "Poşet"},
 {"Id": 3, "Adi": "Litre"},
 {"Id": 4, "Adi": "Metre"},
 {"Id": 5, "Adi": "Çift"},
 {"Id": 6, "Adi": "Kg"},
 {"Id": 7, "Adi": "Gr"},
 {"Id": 8, "Adi": "Rulo"},
 {"Id": 9, "Adi": "100 Ml"},
 {"Id": 10, "Adi": "Ambalaj"},
 {"Id": 11, "Adi": "Kutu"},
 {"Id": 12, "Adi": "M2"},
 {"Id": 13, "Adi": "M3"},
 {"Id": 14, "Adi": "Paket"},
 {"Id": 15, "Adi": "Sarf Malzemeler"},
 {"Id": 16, "Adi": "Set"},
 {"Id": 17, "Adi": "Varil"}
 ];

 var ihaleUsulleri = [

 {"Id": 1, "Adi": "Açık İhale"},
 {"Id": 2, "Adi": "Çerçeve İhale(Münferit)"},
 {"Id": 3, "Adi": "Doğrudan Temin"},
 {"Id": 4, "Adi": "Pazarlık"},
 {"Id": 5, "Adi": "Yaklaşık Maliyet"}
 ];
 */

var express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    xlsx = require('node-xlsx'),
    /** @type {DBModel} */
     db = require('kuark-db')(),
    v1 = require('../api/v1'),
    api = v1.API,
    mesaj = require('../api/v1/API').API;


router.post('/', function (_q, _r) {
    var sPath = _q.body.Path;
    //var sPath = _q.params.Path;
    console.log(sPath);

    //sPath = 'C:\\Users\\duygu.akmaz\\Downloads\\sbkayit.xlsx';

    f_Excel(sPath, _r);

    /*.then(function (_ihaleler) {
     console.log(_ihalaler);
     _r.send(200, mesaj.POST._200(_ihaleler, "", "Excel den çekilen İhaleler sisteme başarıyla eklendi!"));
     */
    /* var tumu = [
     {"ihaleler": ihaleler },
     {"ihaleler_eklenen": ihaleler_eklenen},
     {"ihaleler_eklenemeyen": ihaleler_eklenemeyen},
     {"kurumlar_eklenen": kurumlar_eklenen}
     ];

     _r.send(200, mesaj.POST._200(tumu, "", "Excel den çekilen İhaleler sisteme başarıyla eklendi!"));*/
    /*
     });*/
});

function f_Excel(sPath, _r) {

    var kayit = xlsx.parse(sPath),
        ihaleBilgileri = kayit[0].data,

        ihaleler = [],
        kurumlar_eklenen = [],
        ihaleler_eklenen = [],
        ihaleler_eklenemeyen = [];

    f_IhaleleriCek(ihaleBilgileri, ihaleler);

    f_FazlaliklariTemizle(ihaleler);

    f_SistemeEkle(ihaleler, ihaleler_eklenemeyen, kurumlar_eklenen, ihaleler_eklenen);
    _r.send(200, api.POST._200(ihaleler, "", "Excel den çekilen İhaleler sisteme başarıyla eklendi!"));
}

function f_IhaleleriCek(ihaleBilgileri, ihaleler) {
    var ihale,
        iBasla = 14,
    //iBitir = ihaleBilgileri.length - 3;
        iBitir = 100,
        oncekiSatirId;

    for (i = iBasla; i < iBitir; i++) {

        var simdikiSatir = ihaleBilgileri[i],
            simdikisatirId = simdikiSatir[1] + simdikiSatir[5];

        if (oncekiSatirId != simdikisatirId) {
            if (ihale) {
                ihaleler.push(ihale)
            }

            var ihale_tarihi = f_ExcelDateToJSDate(simdikiSatir[3]);

            ihale = {
                "_Statu": simdikiSatir[4],
                "_KurumAdi": simdikiSatir[5],
                "Kurum": {
                    "Statu": simdikiSatir[4],
                    "Adi": simdikiSatir[5],
                    "Id": 0
                },
                "_IhaleKayitNo": simdikiSatir[1],
                "IhaleNo": simdikiSatir[1],
                "_Konu": simdikiSatir[2],
                "Konusu": simdikiSatir[2],
                "_IhaleTarihi": ihale_tarihi,
                "IhaleTarihi": ihale_tarihi,
                "IhaleUsul": simdikiSatir[7],
                "_Sehir": simdikiSatir[6],
                "YapilacagiAdres": simdikiSatir[6],
                Satirlar: []
            };
        }

        ihale.Kalemler.push({
            "SiraNo": simdikiSatir[8],
            "MalzemeCinsi": simdikiSatir[9],
            "Miktar": simdikiSatir[10],
            "MalzemeKodu": simdikiSatir[13],
            "Birim": simdikiSatir[11],
            "Aciklama": simdikiSatir[12]
        });

        oncekiSatirId = simdikisatirId;
    }
}

function f_SistemeEkle(ihaleler, ihaleler_eklenemeyen, kurumlar_eklenen, ihaleler_eklenen) {

    /* Ihale var mı?
     Yok -> ekle { ihaleler_eklenen.push(ihale) }
     Var -> Eklenmedi  { ihaleler_eklenmeyen.push(ihale) }
     Kurum var mı?
     Yok -> ekle { kurumlar_eklenen.push(ihale.kurum) }
     Var -> ihale.kurum = db'den gelen Kurum nesnesi
     */


    var def_ihale = db.dbQ.Q.defer(),
        def_kurum = db.dbQ.Q.defer();

    v1.kurum.f_tum_kurumlar(def_kurum);
    def_kurum.promise
        .then(function (_arrKurumlarDB) {
            return  _arrKurumlarDB;
        })
        .fail(function () {
            console.log("tüm kurumlar çekilemedi");
        })
        .then(function (arrKurumlarDB) {
            /*
             * Kurumları bir kere çektik ve artıkm elimizde,
             * ihaleleri de bir kere çekelim
             *
             * ister arrKurumlar dizisinden,
             * istersem bir üst then içinde return edilmiş _arrKurumlar parametresiyle elde ettiğim dizinden bakarım
             */

            /*v1.ihale.f_tum_ihaleler(def_ihale);
            def_ihale.promise
                .then(function (_arrIhalelerDB) {
                    *//* ihaleleri de çektik *//*
                    return  _arrIhalelerDB;
                })
                .fail(function () {
                    console.log("tüm ihaleler çekilemedi");
                })
                .then(function (arrIhalelerDB) {
                    // Şimdi excelden gelen ihaleler içinde dönelim
                    ihaleler.forEach(function (_ihale) {
                        f_KontrolveVTIslemleri(arrKurumlarDB, arrIhalelerDB, ihaleler, ihaleler_eklenemeyen, kurumlar_eklenen, ihaleler_eklenen, _ihale);
                    });
                    return ihaleler;
                })
                .then(function (_res) {
                    console.log("ana:" + _res);
                    return ihaleler;
                })
                .fail(function () {
                    console.log("İhale çekme/ekleme işlemi başarılamadı..!");
                    defIhale.reject("İhale çekme/ekleme işlemi başarılamadı..!");
                });*/
        })
        .then(function () {
            return ihaleler;
        })
        .fail(function (_hata) {
            console.log("hata:" + hata);
        });
}

function f_KontrolveVTIslemleri(arrKurumlarDB, arrIhalelerDB, ihaleler, ihaleler_eklenemeyen, kurumlar_eklenen, ihaleler_eklenen, _ihale) {
    /*
     * DB de ihale varsa, ilgili kurum ve satırlar vardır.
     * Yoksa Kurum, Ihale, Satırlar eklenecek
     */
    // db de var mı?
    var vtIhale = _.filter(arrIhalelerDB, {"IhaleTarihi": _ihale.IhaleTarihi, "Konusu": _ihale.Konusu});
    if (vtIhale.length > 0) {
        //ihale db de var
        _ihale.Id = vtIhale.Id;

        ihaleler_eklenemeyen.push(_ihale);
        return ihaleler;
    }
    else {
        /* ihale yok,
         * - Önce ihalenin kurumu DB de varmı?
         *     varsa kurum ID sini ihaleye yazalım
         *     yoksa kurumu ekleyelim
         * - Sonra ihaleyi,
         * - Sonra satırları ekleyelim
         */
        /*return dbQ.Q.all([
         f_KurumKontrol(arrKurumlarDB, kurumlar_eklenen, _ihale),
         f_IhaleKontrol(ihaleler_eklenen, _ihale)
         ]);*/
        var ajax = f_KurumKontrol(arrKurumlarDB, kurumlar_eklenen, _ihale);
        ajax.then(function (_yeni) {
            console.log("f_KurumKontrol=yeni:" + _yeni);
            return f_IhaleKontrol(ihaleler_eklenen, _yeni);
        });
    }
}

function f_IhaleKontrol(ihaleler_eklenen, _ihale) {
    // Ihale ekle

    var sadeceIhaleBilgisi = {
        "IhaleNo": _ihale.IhaleNo,
        "Konusu": _ihale.Konusu,
        "IhaleTarihi": _ihale.IhaleTarihi,
        "IhaleUsul": _ihale.IhaleUsul,
        "YapilacagiAdres": _ihale.YapilacagiAdres
    };

    return db.ihale.f_db_ihale_ekle(sadeceIhaleBilgisi,_ihale.Kurum_Id,0)
        .then(function (_dbRes) {
            var yeniIhale = JSON.parse(_dbRes);
            _ihale.Id = yeniIhale.Id;

            //eklenen ihaleler dizisine ekle
            ihaleler_eklenen.push(yeniIhale);

            //satırlarını eklemeye başla
            _ihale.Kalemler.forEach(function (_satir) {
                return f_SatirEkle(_ihale, _satir);
            });
        })
        .then(function (_res) {
            console.log("f_IhaleKontrol()" + _res);
            return _ihale;
        })
        .fail(function () {
            console.log("İhale ekleme işlemi başarılamadı..!");
            //defIhale.reject("İhale ekleme işlemi başarılamadı..!");
        });
}

function f_SatirEkle(_ihale, _satir) {
    return db.kalem.f_db_kalem_ekle(_ihale.Id,_satir)
        .then(function (_dbSatir) {
            var eklenenSatir = JSON.parse(_dbSatir);
            return eklenenSatir;
        })
        .fail(function () {
            console.log("Satır ekleme işlemi başarılamadı..!");
            //def_satirlar.reject("Satır ekleme işlemi başarılamadı..!");
        });
}

function f_KurumKontrol(arrKurumlarDB, kurumlar_eklenen, _ihale) {
    var kurum = _ihale.Kurum;
    console.log(kurum);

    var arrKurumSuzulen = _.filter(arrKurumlarDB, {"Adi": kurum.Adi});

    // _.where() => [...] (dizi döner)
    if (arrKurumSuzulen.length > 0) {
        //kurumun db deki bilgisini gönder
        _ihale.Kurum_Id = arrKurumSuzulen[0].Id;
        return _ihale;
    }
    else {
        console.log("kurum ekle");
        return db.kurum.f_db_kurum_ekle(kurum)
            // Kurum ekle
            .then(function (_dbResults) {
                var eklenenKurum = JSON.parse(_dbResults[2]);
                _ihale.Kurum_Id = eklenenKurum.Id;

                //eklenen kurumlar dizisine ekle
                kurumlar_eklenen.push(eklenenKurum);
                return _ihale;
            });
    }
}

function f_ExcelDateToJSDate(serial) {
    var utc_days = Math.floor(serial - 25569);
    var utc_value = utc_days * 86400;
    var date_info = new Date(utc_value * 1000);

    var fractional_day = serial - Math.floor(serial) + 0.0000001;

    var total_seconds = Math.floor(86400 * fractional_day);

    var seconds = total_seconds % 60;

    total_seconds -= seconds;

    var hours = Math.floor(total_seconds / (60 * 60));
    var minutes = Math.floor(total_seconds / 60) % 60;

    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds).getTime();
}

function f_FazlaliklariTemizle(_dizi) {

    _.filter(_dizi, function (elm, idx, _dizi) {

        for (prop in elm) {

            if (_.isArray(elm[prop])) {

                f_FazlaliklariTemizle(elm[prop]);

            } else {
                if (prop.indexOf("_") == 0) {
                    delete elm[prop];
                }
            }
        }

    });
}

module.exports = router;
