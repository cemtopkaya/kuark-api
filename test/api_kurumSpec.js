var chai = require('chai'),
    should = chai.should,
    expect = chai.expect,
    assert = chai.assert,
    request = require('supertest'),
    db = require("kuark-db");

describe("API Kurum işlemleri", function () {

    var apiRootUrl = "http://127.0.0.1:3000";
    before(function (done) {
        done();
    });

    it("Kurum arama", function (done) {
        console.log("url_query: ");
        var url_query = {};//defaults(schema.UrlQuery);
        url_query.Aranan = "kam";
        url_query.Aranacak_Alanlar = "";
        url_query.Tahta_Id = 1;
        //url_query.Sayfalama = null;
        url_query.Kullanici_Id = 0;
        console.log("Arama object: " + JSON.stringify(url_query));


        return db.kurum.f_db_aktif_kurum_idleri(url_query.Tahta_Id, null)
            .then(function (_kurum_idleri) {
                console.log("kurum id leri:" + _kurum_idleri);

                var query = {
                    "query": {
                        "filtered": {
                            "query": {
                                "query_string": {
                                    "query": "*" + url_query.Aranan + "*"
                                }
                            },
                            "filter": {
                                "bool": {
                                    "should": _kurum_idleri.map(function (_id) {
                                        return {"term": {"Id": _id}}
                                    })
                                }
                            }
                        }
                    }
                };

                return elastic.f_search({
                    method: "POST",
                    index: "kuark",
                    type: "kurum",
                    searchSize: url_query.Sayfalama.SatirSayisi,
                    from: url_query.Sayfalama.Sayfa * url_query.Sayfalama.SatirSayisi,
                    body: query

                }).then(function (_resp) {
                    return _.pluck(_resp[0].hits.hits, "_source");
                }).then(function (_res) {
                    console.log(JSON.stringify(_res));
                    done();
                }).fail(function (_err) {
                    done(_err);
                });
            });
    });

    it("Kurum ekle", function (done) {
        var gelen = {
            Adi: "testimm",
            Statu: "özel",
            Kurumdur: 1,
            TicariUnvan: "ticari",
            Tel1: "111",
            Tel2: "222"
        };

        return db.kurum.f_db_kurum_ekle(null, gelen, 1)
            .then(function (_dbKurum) {
                console.log("ne geldi?")
                console.log(_dbKurum);
                done();
            })
            .fail(function (_err) {
                console.log(_err)
            });
    });

    it("Kurum güncelle", function (done) {

        var kurum = {
            Adi: "test",
            TicariUnvani: "ediyorum",
            Statu: "özel",
            VD: "1",
            VN: "3",
            Kurumdur: true,
            AcikAdres: "aaa",
            Adi: "test",
            Faks: "4444444444",
            Kurumdur: true,
            Sehir: "antalya",
            Web: "hhh",
            Id: 12
        };

        kurum = f_semali_kurum(kurum);

        return db.kurum.f_db_kurum_guncelle(1, kurum)
            .then(function (_dbKurum) {
                console.log("ne geldi?")
                console.log(_dbKurum);
                done();
            })
            .fail(function (_err) {
                console.log(_err)
            });


    });

    it("Kurum bilgisini çek", function (done) {
        db.kurum.f_db_kurum_id(1)
            .then(function (_bulunanKurum) {
                console.log(JSON.stringify(_bulunanKurum));
                done();
            }).fail(function (_err) {
            done(_err);
        });

        /*


         this.timeout(8000);
         request(apiRootUrl)
         .get('/api/v1/kurumlar/1')
         .send({})
         .expect(200,done);

         .end(function (err, res) {
         if (err) {
         throw err;
         } else {
         console.log("response");
         (res.text).should.equal('Moved Temporarily. Redirecting to /');
         console.log("end içi");
         done()
         }
         // Should.js fluent syntax applied
         //res.body.should.have.property('_id');
         //res.body.firstName.should.equal('JP');
         //res.body.lastName.should.equal('Berd');
         //res.body.creationDate.should.not.equal(null);
         });
         * */
    });


});