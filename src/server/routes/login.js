var passport = require('passport'),
    express = require('express'),
    q = require('q'),
    routerLogin = express.Router();

/**
 * Login Provider'lardan HATALI CALLBACK
 * @param err
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
var f_loginProivederCallbackError = function (err, req, res, next) {
    /**
     * 1. if(req.session.ss.kullanici.Id > 0) ise kullanıcı sisteme girmiş, yeni bir provider bağlamak istiyor ancak hata aldı
     *      a. if(typeof err === 'object')    ise bizim ürettiğimiz hatalardandır, işlemeye başlayalım
     *           if(err.code === 10001)       ise bu provider.id ile ilişkili kullanıcı yok
     *              1) halihazırdaki kullanıcının Provider bilgisini genişletip
     *                  > _.extend(req.session.ss.kullanici.Provider, err.data.Provider)
     *              2) DB'ye kaydedelim
     *                  > db.kullanici.f_update_kullanici(req.session.ss.kullanici)
     *                  > provider.id ile kullanici.Id ilişkisini kuralım
     *           else if(err.code === ????)
     *
     *           else
     *
     *      b. else   bizim bilmediğimiz, pasaportun fırlattığı hatalardan
     *          res.status(500).send(err);
     *
     * 2. 1 değilse, kullanıcı girişi yapılmak isteniyor
     *  a) Kullanıcı kayıt için Provider'dan gelen kullanıcı bilgilerini cs.ejs ye geçelim
     *      req.session.cs.ejs.loginProviderUser = err.data
     *  b) Kayıt sayfasına yönlendirelim
     *      res.redirect('/login/registration')
     */


    if (typeof err === 'object') { // Hatayı biz üretmişsek tipi object olur err = {code:10001, data:{}, ...}
        if (err.code === 10001) {  // Kullanıcı provider'dan geldi ama DB'de yok
            if (!(req.session.ss.kullanici && req.session.ss.kullanici.Id)) { // Sisteme giriş yapmış bir kullanıcı değil, demekki sisteme giriş yapmaya çalışıyor.
                return f_yeniKullaniciKaydet(err.data, req, res, next);
            } else {
                // Session'a sistemde kayıtlı bir kullanıcı mı,
                // yoksa önce bir providerla girişi deneyip
                // sonra başka provider seçmiş kararsız bir "kullanıcı adayımız" mı gelmiş
                if (req.session.ss.kullanici.Id > 0) { // Sistemde kayıtlı bir kullanıcıysa yeni provider'ını bağlayalım
                    return f_kullaniciyaYeniProviderEkle(err.data, req, res, next);
                } else { // Kararsız bir kullanıcı adayıysa
                    req.session.ss.kullanici = err.data; // Yeni provider'ını session'a yazarak kayıt sayfasına yönlendirelim.
                    res.redirect("/login/registration");
                }
            }
        }

    } else { // değilse "Hatayı passport üretmiş" demektir
        return res.status(500).send(err);
    }

    return res.send("Hata aldık o da ne: ", err);
};

/**
 * Yeni kullanıcı kaydı yapacak
 * @param {Kullanici} kullanici - DB'ye kaydedilmeye hazır kullanıcı
 * @param req
 * @param res
 * @param next
 */
var f_yeniKullaniciKaydet = function (kullanici, req, res, next) {
    req.session.ss.kullanici = JSON.parse(JSON.stringify(kullanici));
    return res.redirect('/login/registration');
};

/**
 * Kullanıcı Provider'larına yenisini ekle
 * @param kullanici
 * @param req
 * @param res
 * @param next
 */
var f_kullaniciyaYeniProviderEkle = function (kullanici, req, res, next) {
    // Yeni provider'ı da ekleyelim ve dönelim
    _.extend(req.session.ss.kullanici.Providers, kullanici.Providers);
    db.kullanici.f_db_kullanici_guncelle(req.session.ss.kullanici);
    return res.redirect('/login/providerMerging/success');
};


/**
 * Tüm login içinde kullanılacak şekilde bilgi taşıma şekli:
 * <pre>
 * _req.session.cs = {
 *               ejs : { ejs içinde render'da kullanılacak property leri içerir
 *                        form : { eposta:'', adisoyadi:'', sifre1:'', sifre2:'' ... gibi form içindeki bilgileri tutar },
 *                        dogrulamaHatasi : { hata:'hata mesajını icerir'... gerekirse hataKodu:1231, uyarilar:[] gibi bilgileri de tutabilir }
 *                      }
 * }
 * </pre>
 */
routerLogin.route('/')
    .get(function (_req, _res) {
        SABIT.URL.LOCAL = _req.get('host');
        var ss = _req.session.ss || {kullanici: null},
            cs = _req.session.cs || {
                    ejs: {
                        form: {},
                        dogrulamaHatasi: null
                    }
                };
        console.log("Login içinde ss: ", _req.session.ss);
        cs.ejs = {
            hata: null,
            form: {EPosta: ss.kullanici && ss.kullanici.EPosta ? ss.kullanici.EPosta : ''}
        };
        _res.render("page/giris", cs.ejs);
    });

function f_loginProivederLastCallback(_req, _res, _next) {
    console.log("f_loginProivederLastCallback: ");

    return _req.logIn(_req.user, function (_err) {
        if (_err) {
            return _res.redirect('/login/auth/error');
        } else {
            _req.session.ss.providerMeging = _req.session.ss.kullanici && _req.session.ss.kullanici.Id > 0;
            return _res.redirect('/login/auth/success');
        }
    });
}
routerLogin
    .post('/', function (_req, _res, _next) {

        var gelen = _req.body;
        var ldapLocalProvider = 'local';
        if (gelen.EPosta.indexOf('@') < 0 || gelen.EPosta.match(/(@fmc-ag.com)/g)) {
            ldapLocalProvider = 'ldapauth';
            gelen.EPosta = gelen.EPosta.replace("@fmc-ag.com", "");
            //_res.redirect('/login/auth/ldap');
        } else {
            ldapLocalProvider = 'local';
            //_res.redirect('/login/auth/local');
        }

        passport.authenticate(ldapLocalProvider, function (_err, _user, _info) {

            console.log("Login js içinde varsa \n\terr: ", _err, "\n\t_user: ", JSON.stringify(_user));
            if (_err) {
                f_loginProivederCallbackError(_err, _req, _res, _next);
            }

            /**
             * Provider'dan geçti
             * bu demektirki _user bilgisi dolu
             * {AdiSoyadi:'', EPosta:'', Provider:{sadece bir tane provider objesi var}}
             *
             * _user bilgisini passport'un serileştirmesine göndereceğiz.
             * serileştirilirken şunlara bakılacak:
             *   - Eğer DB de kayıtlı kullanıcı varsa serileştirecektir
             *   - yoksa hata dönecek {code:10001, hata:'DB de bulamadım ama kaydedilebilir kullanıcı'}
             */
            _req.logIn(_user, function (err) {
                //
                if (err) {
                    f_loginProivederCallbackError(err, _req, _res, _next);
                } else {
                    _res.redirect("/login/auth/success");
                }
            });

        })(_req, _res, _next);
    })

    .use('/providerMerging/success', function (_req, _res) {
        return _res.render('page/providerMergingSuccess');
    })
    .use('/auth/success', function (_req, _res) {
        _req.session.ss.kullanici = JSON.parse(JSON.stringify(_req.user));

        if (_req.session.ss.providerMeging) {
            // birden fazla eklemekten geliyor buraya
            return _res.redirect('/login/providerMerging/success');
        }
        console.log("success Auth  içinde > req.user.Id: " + _req.user.Id);
        return _res.redirect('/');
    })
    .use('/auth/error', f_loginProivederCallbackError, function (_req, _res) {
        return _res.send("ERROR auth oldu");
    })
    .use('/auth/new', function (_req, _res) {
        console.log("Auth new ***********");

        var cs = _req.session.cs,
            ss = _req.session.ss;
        console.log("Sistemde kayıtlı değil >");

        cs.ejs = {
            form: {
                AdiSoyadi: ss.kullanici.AdiSoyadi,
                EPosta: ss.kullanici.EPosta,
                Avatar: ss.kullanici.Avatar
            },
            hata: {
                baslik: "Macera sizi bekliyor ;)",
                icerik: "Kullanıcı sistemde kayıtlı değil ama <a href='/login/registration'>kayıt olması çok kolay !</a>"
            }
        };
        return _res.render("page/giris", cs.ejs);
    })


    //region GOOGLE
    .get('/auth/google', passport.authenticate('google'))
    .get('/auth/google/callback', passport.authenticate('google')
        , f_loginProivederCallbackError
        , f_loginProivederLastCallback
    )
    // endregion

    //region TWİTTER
    .get('/auth/twitter', passport.authenticate('twitter'))
    .get('/auth/twitter/callback', passport.authenticate('twitter')
        , f_loginProivederCallbackError
        , f_loginProivederLastCallback
    )
    // endregion

    //region FACEBOOK
    .get('/auth/facebook', passport.authenticate('facebook'))
    .get('/auth/facebook/callback', passport.authenticate('facebook')
        , f_loginProivederCallbackError
        , f_loginProivederLastCallback
    )
    // endregion

    //region NEW REGISTRATION
    .get('/registration', function (_req, _res) {
        var kullanici = _req.session.ss.kullanici || schema.f_create_default_object(schema.SCHEMA.DB.KULLANICI),
            cs = _req.session.cs;

        // sayfayı ilk kez gönderirken hata yok ancak post back olduğunda validasyon hatası olabilir.
        console.log(JSON.stringify(cs, null, '\t'));
        ssg = [{"cs": cs}];
        cs.ejs.form = {
            AdiSoyadi: cs.ejs.form && cs.ejs.form.AdiSoyadi ? cs.ejs.form.AdiSoyadi : kullanici.AdiSoyadi,
            EPosta: cs.ejs.form && cs.ejs.form.EPosta ? cs.ejs.form.EPosta : kullanici.EPosta,
            Avatar: cs.ejs.form && cs.ejs.form.Avatar ? cs.ejs.form.Avatar : kullanici.Avatar || '../img/avatar7.png',
            Sifre: cs.ejs.form && cs.ejs.form.Sifre ? cs.ejs.form.Sifre : kullanici.Sifre,
            Sifre2: cs.ejs.form && cs.ejs.form.Sifre2 ? cs.ejs.form.Sifre2 : kullanici.Sifre2
        };
        _res.render("page/kullaniciKayit", cs.ejs);


// Ekranda gösterdik yukarıda, şimdi boşa çekelim
        cs.ejs.dogrulamaHatasi = undefined;
    })
    .post('/register', function (_req, _res) {
        /**
         * Kullanici bilgilerini "kullanici" değişkeninde tutacağız
         * @type {Kullanici}
         */
        var kullanici = _req.session.ss.kullanici || schema.f_create_default_object(schema.SCHEMA.DB.KULLANICI),
            gelen = _req.session.cs.ejs.form = _req.body;

        kullanici.AdiSoyadi = gelen.AdiSoyadi;
        kullanici.EPosta = gelen.EPosta.toLowerCase();
        kullanici.Sifre = gelen.Sifre;


        // Doğrulama hatasını önce temizleyelim ki, içeride kirlenebilsin
        _req.session.cs.ejs.dogrulamaHatasi = null;

        //region Validasyon
        var schemaErrs = schema.f_suz_dogrula(schema.SCHEMA.DB.KULLANICI, kullanici),
            mesaj = '';

        if (schemaErrs) {
            schemaErrs.forEach(function (_err) {
                mesaj += _err.dataPath + ", " + _err.message + ". ";
            });
        }

        if (!validator.isEmail(kullanici.EPosta)) {
            mesaj = 'EPosta adresini doğru girdiğinizden emin misiniz?';
        }

        if (!gelen.Sifre || !gelen.Sifre2 || (gelen.Sifre != gelen.Sifre2)) {
            mesaj = 'Şifre bilgileri eksiksiz ve tekrarı ile aynı olmalıdır!';
        }

        if (mesaj) {
            _req.session.cs.ejs.dogrulamaHatasi = {hata: mesaj};

          /*  _req.session.cs.ejs.form = {
                AdiSoyadi:  kullanici.AdiSoyadi,
                EPosta:  kullanici.EPosta,
                Avatar:  kullanici.Avatar || '../img/avatar7.png'
            };*/

            return _res.render("page/kullaniciKayit", _req.session.cs.ejs);
            //return _res.redirect("/login/registration");
        }
        // endregion

        /**
         * Validasyonun son mertebesi.
         * Kullanıcının girdiği e-posta sistemde kayıtlıysa,
         *  - şifreni mi unuttun diye dön
         *  - kayıtlı değilse, kullanıcıyı kaydet ve giriş yap
         */
        return db.kullanici.f_eposta_to_db_kullanici_id(kullanici.EPosta)
            .then(function (_dbKullanici_id) {
                if (_dbKullanici_id) {
                    l.i("Kullanıcı db de kayıtlı");
                    ssg = [{"_dbKullanici_id": _dbKullanici_id}];

                    _req.session.cs.ejs.dogrulamaHatasi = {
                        hata: "Bu e-posta adresini kullanan bir kullanıcımız var. Yoksa siz misiniz? Şifrenizi mi unuttunuz? <a href='/login/sifreHatirlat'>Şifrenizi hatırlamamıza ne dersiniz</a>?"
                    };
                    return _res.redirect("/login/registration");

                } else { // Bu eposta kayıtlı değil, kullanıcı kaydını tamamlayalım

                    return db.kullanici.f_db_kullanici_ekle(kullanici)
                        .then(function (_dbKullanici) {
                            l.i("Kullanıcı dbye kaydedildi");
                            l.info("Yeni kullanıcı kaydı tamamlandı, tahtalar sayfasına gidilecek");

                            /**
                             * kayıt başarılı,
                             * pasaport tarafında kullanıcı bilgisi serialize edilerek session'a kaydedilsin
                             * ve req.user oluşsun diye req.logIn
                             * sonrasında hata alınmazsa redirect('/')
                             */
                            _req.logIn(_dbKullanici, function (err) {

                                _req.session.cs.ejs.dogrulamaHatasi = null;

                                if (err) {
                                    var hata = (typeof err === 'object')
                                        ? (err instanceof Error
                                        ? err.stack
                                        : JSON.stringify(err))
                                        : err;
                                    l.e("Kaydettik kullanıcıyı ama pasaport için tekrar login edemedik. Hata:\n", hata);
                                    return _res.jsonp(hata);
                                }
                                else {
                                    return _res.redirect("/login/auth/success");
                                }
                            });
                        });
                }
            });
    });
// endregion

module.exports = routerLogin;