'use strict';

var db = require('kuark-db');

/**
 *
 * @returns {APIYorum}
 * @constructor
 */
function APIYorum() {

    function f_api_yorum_ekle(_q, _r) {
        var yorum = _q.body,
            kul_id = _q.params.Kul_Id,
            tahta_id = _q.params.Tahta_Id;

        db.yorum.f_db_yorum_ekle(tahta_id, kul_id, yorum)
            .then(function (_dbYorum) {
                _r.send(201, mesaj.POST._201(_dbYorum, "", "Yorum BAŞARIYLA eklendi."));
            })
            .fail(function () {
                _r.send(500, mesaj.POST._500("", "", "Yorum bilgisi eklenemedi!"));
            });
    }

    /**
     * @class APIYorum
     */
    return {
        f_api_yorum_ekle: f_api_yorum_ekle
    };
}

module.exports = APIYorum;