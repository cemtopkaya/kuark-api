var chai = require('chai'),
    should = chai.should(),
    expect = chai.expect,
    assert = chai.assert,
    request = require('super-request'),
    ortak = require('./_ortakTestEnv'),
    db = require("kuark-db");

describe("API Ürün işlemleri", function () {

    it('aaa', function (done) {
        done();
    });

/*    function login(done) {
        var cookie = null;

        return request(ortak.app)
            .post('/login')
            .form({
                EPosta: 'cem.topkaya@fmc-ag.com',
                Sifre: '.aqswdefr.'
            })
            .expect(302)
            .end(function (err, res, body) {

                console.log("**************");
                console.log("\t Error\t : ", err);
                console.log("\t Status\t : ", res.status);
                console.log("\t Body\t : ", res.body);

                if (err) return done(err);

                if (body === 'Found. Redirecting to /login/auth/success') {
                    cookie = res.headers['set-cookie'];
                }
            })
            .get('/login/auth/success')
            .expect(200)
            .end();
    }

    it("Tahtanın ürünlerini çek", function (done) {

        var tahta_id = 1,
            url = '/api/v1/tahtalar/' + tahta_id + '/urunler/';

        return login(done)
            .get('/api/v1/tahtalar/1/urunler/')
            .expect(200)
            .end(function(err,res,body){
                if(err) return done(err);
                done();
            });
    });*/
});