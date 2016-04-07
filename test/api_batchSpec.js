var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    request = require('super-request'),
    ortak = require('./_ortakTestEnv'),
    db = require("kuark-db");

describe("API BATCH işlemleri", function () {

    function login(done) {
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

    it("Ihale dunyasının ihalelerini çek", function (done) {

        login(done)
            .get('/api/v1/ihaleler/tazele/id')
            .expect(200)
            .end(function (err, res, body) {
                if (err) return done(err);

                done();
            })
    });

    function loginUser() {
        //it('login', loginUser());
        return function (done) {
            request
                .post('/login')
                .send({EPosta: 'cem.topkaya@fmc-ag.com', Sifre: '.aqswdefr.'})
                .expect(302)
                .expect('Location', '/login/auth/success')
                .end(function (err, res) {
                    if (err) return done(err);
                    cookie = res.headers['set-cookie'];
                    return done();
                })
        };
    };

});

