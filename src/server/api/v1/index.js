
function Api() {}

/**
 *
 * @returns {ApiV1}
 */
Api.v1 = function () {
    var APIBolge = require('./api_bolge')(),
        APIIhale = require('./api_ihale')(),
        APIKullanici = require('./api_kullanici')(),
        APIKurum = require('./api_kurum')(),
        APIOlay = require('./api_olay')(),
        APIKalem = require('./api_kalem')(),
        APITahta = require('./api_tahta')(),
        APIUrun = require('./api_urun')(),
        APIUyari = require('./api_uyari')(),
        APIYorum = require('./api_yorum')(),
        APISehir = require('./api_sehir')(),
        APIRol = require('./api_rol')(),
        API = require('./API');

    /** @class ApiV1 */
    return {
        bolge: APIBolge,
        ihale: APIIhale,
        kullanici: APIKullanici,
        kurum: APIKurum,
        olay: APIOlay,
        kalem: APIKalem,
        tahta: APITahta,
        urun: APIUrun,
        uyari: APIUyari,
        yorum: APIYorum,
        sehir: APISehir,
        rol: APIRol,
        API: API
    };
};

module.exports = Api;