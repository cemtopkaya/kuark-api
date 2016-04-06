var chai = require('chai'),
    should = chai.should,
    expect = chai.expect,
    assert = chai.assert,
    request = require('supertest'),
    db = require("kuark-db");

describe.only("API Ürün işlemleri", function () {
    var app = require('../src/server/app');

    before(function (done) {
        done();
    });

    it("Ürün ekle", function (done) {

        var urun = {
                Adi: 'testim',
                Kodu: 'x',
                Bu_ne: "aaaa"
            },
            tahta_id = 1;

        request(app)
            .get('/api/v1/tahtalar/' + tahta_id + '/urunler/')
            .send({})
            .expect(200, done);
    });
});