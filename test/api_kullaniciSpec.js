var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    db = require("kuark-db"),
    request = require('super-request'),
    ortak = require('./_ortakTestEnv');


describe("API Kullanıcı işlemleri", function () {

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

    it('super-request ile logged in', function (done) {

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
            .end(done);
    });

    it('Kullanıcı tahtalarını çeker', function (done) {
        return login(done)
            .get('/api/v1/kullanicilar/1/tahtalar')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res, body) {
                console.log(body);
                done();
            });
    });

    it('/kullanicilar', function (done) {
        return login(done)
            .get('/api/v1/kullanicilar')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res, body) {
                console.log(body);
                done();
            });
    });
});

