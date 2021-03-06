/**
 * Created by duygu.akmaz on 02.10.2014.
 */

var express = require('express'),
    extensions = require("kuark-extensions"),
    EMail = extensions.EMail;

var routerEMail = express.Router();

routerEMail.post('/', function (_q, _r) {
    var gelen = _q.body,
        text = gelen.Text,
        to = gelen.To,
        from = gelen.From,
        cc = gelen.CC || "",
        bcc = gelen.Bcc || "",
        subject = gelen.Subject,
        mail = new EMail("", "", "", true);

    mail.f_send(text, from, to, cc, bcc, subject)
        .then(function (_res) {
            _r.send("Mail gönderildi");
        })
        .fail(function (_err) {
            _r.send('Mail gönderilemedi!');
        });
});

module.exports = routerEMail;