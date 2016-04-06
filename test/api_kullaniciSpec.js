var chai = require('chai'),
    should = chai.should,
    expect = chai.expect,
    assert = chai.assert,
    request = require('supertest'),
    db = require("kuark-db");

describe("API Kullanıcı işlemleri", function () {

    var apiRootUrl = "http://127.0.0.1:3000";
    before(function (done) {
        done();
    });

    it("Kullanıcı tahtalarını çek", function (done) {
        request(apiRootUrl)
            .get('/api/v1/kullanicilar/1/tahtalar')
            .send({})
            .expect(200,done);
        /*

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