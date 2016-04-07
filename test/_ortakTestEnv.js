var path = require('path'),
    serverModule = require('../src/server/app'),
    expressApp = serverModule.expressSetup(path.join(__dirname + '/public'), path.join(__dirname + '/views')),
    superagent = require('superagent'),
    supertest = require('supertest'),
    request = require('super-request'),
    ortak = require('./_ortakTestEnv');

module.exports = {
    app: expressApp,
    login: function (done) {
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
    },
    loginSuperAgent: function (request, done) {

        var agent = superagent.agent();
        var request2 = supertest(ortak.app);
        request
            .post('/login')
            //.set('Content-Type', 'application/x-www-form-urlencoded')
            /*.send('EPosta=cem.topkaya@fmc-ag.com')
             .send('Sifre=.aqswdefr.')*/
            .type('form')
            .send({EPosta: 'cem.topkaya@fmc-ag.com'})
            .send({Sifre: '.aqswdefr.'})
            .expect('Location', '/login/auth/success')
            .end(function (err, res) {
                if (err) return done(err);

                agent.saveCookies(res);

                console.log("**************");
                console.log("\t Error: ", err);
                console.log("\t Status: ", res.status);
                console.log("\t Body: ", res.body);
                console.log("\t Location: -", res.header.location + "-");
                console.log("0000000000000 " + res.headers['set-cookie']);

            })
            .get('/login/auth/success')
            .expect(200)
            .end(function (err) {
                if (err) return done(err);

                done(agent);
            });
    }
};

if (!module.parent) {
    console.log("Module . PARENT ");
    expressApp.listen(3000);
}