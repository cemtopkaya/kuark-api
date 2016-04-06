'use strict';

var db = require('kuark-db');

/**
 *
 * @returns {APIOlay}
 * @constructor
 */
function APIOlay() {

    function f_api_olay_tumu(_q, _r) {
        _r.status(200).send(mesaj.GET._200(db.olay.SABIT.OLAYLAR, "", "Olaylar başarıyla çekildi"));
    }

    /**
     * @class APIOlay
     */
    return {
        f_api_olay_tumu: f_api_olay_tumu
    };
}

module.exports = APIOlay;