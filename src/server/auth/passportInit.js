var GoogleOAuth2Strategy = require('passport-google-oauth').OAuth2Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    LocalStrategy = require('passport-local').Strategy,
    LdapAuthStrategy = require('passport-ldapauth'),
    refresh = require('passport-oauth2-refresh'),
    /** @type {DBModel} */
     db = require('kuark-db')(),
    _ = require('lodash'),
// load the auth variables
    authConfig = require('./authConfig'),
    schema = require('kuark-schema');

module.exports = function (passport) {


    /**
     *
     * @param {Kullanici} _user
     * @param {Function} _done
     */
    var f_loginProviderUser_to_dbKullaniciID = function (_user, _done) {
        /*
         _user.Id >0  ise, sistemdeki kullanıcıyı sessiona yazdırmak için göndermiler demektir(req.logIn marifetiyle)
         serileştirip, sessiona kaydedelim bitsin
         req.user'a gelen _user atansın diye done(null,_user) diyeceğiz ve passport sonraki fonksiyonlarda işi bitirecek.
         */
        if (_user.Id > 0) {
            return _done(null, _user);
        }

        /*
         değilse, _user.Id=0 demektir ve içinde bir Provider vardır,
         - onu DB de varsa bulup serileştirelim
         - yoksa hata dönelim (bu provider'ın döndüğü kullanıcı sistemde yok diye)
         */
        (_user.Providers.TW
                ? db.kullanici.f_TWITTER_id_to_db_kullanici_id(_user.Providers.TW.id)
                : _user.Providers.GP
                ? db.kullanici.f_GPLUS_id_to_db_kullanici_id(_user.Providers.GP.id)
                : _user.Providers.FB
                ? db.kullanici.f_FACEBOOK_id_to_db_kullanici_id(_user.Providers.FB.id)
                : _user.Providers.AD
                ? db.kullanici.f_AD_to_db_kullanici_id(_user.Providers.AD.userPrincipalName)
                : db.kullanici.f_eposta_to_db_kullanici_id(_user.EPosta)
        ).then(function (dbUserId) {

            if (!dbUserId) {
                // sistemde kayıtlı olmayan kullanıcı.
                return _done({
                    code: 10001,
                    message: "Kullanıcı doğrulama mekanizmasında bulunan ama sistemde kayıtlı olmayan kullanıcı",
                    data: _user
                });
            } else {
                db.kullanici.f_db_kullanici_id(dbUserId)
                    .then(function (_dbKullanici) {
                        var err = false;
                        if (_dbKullanici) {
                            // token değişti, db dekini değiştiriyoruz
                            _.extend(_dbKullanici.Providers, _user.Providers);
                            db.kullanici.f_db_kullanici_guncelle(_dbKullanici);
                            return _done(null, _dbKullanici);
                        } else {
                            err = {
                                code: 10001,
                                message: "Kullanıcı doğrulama mekanizmasında bulunan ama sistemde kayıtlı olmayan kullanıcı",
                                data: _user
                            };
                            return _done(err);
                        }
                    });
            }
        });
    };

    /**
     * Serileştirme kısmında sistemdeki kullanıcının ID bilgisini "session.passport.user = xxx" a yazıyoruz.
     * Deserileştirmede bu ID okunup VT'den kullanıcı bilgileri tekrar çekilerek "req.user" a yazılır.
     * Sessionda tutulmasını istemediğimiz detaylı kullanıcı bilgilerini böylece taşırız.
     */
    passport.serializeUser(f_loginProviderUser_to_dbKullaniciID);

    /**
     *
     */
    passport.deserializeUser(function (id, done) {
        if (!id) {
            return done(null, false);  // invalidates the existing login session.
        }

        if (typeof id === 'object') { // user bilgisi obje olarak gelmişse aynen gidebiliriz
            return done(null, id);
        }

        db.kullanici.f_db_kullanici_id(id)
            .then(function (_dbKullanici) {

                if (!_dbKullanici) {
                    return done({
                        code: 10001,
                        message: "Sistemde kayıtlı olmayan kullanıcı",
                        data: {user_id: id}
                    });
                } else {
                    return done(null, _dbKullanici);
                }
            });
    });

    //region LOCAL
    var f_localStrategy = function (_req, EPosta, Sifre, done) {

        var kullanici = schema.f_create_default_object(schema.SCHEMA.DB.KULLANICI);
        kullanici.EPosta = EPosta;
        kullanici.Sifre = Sifre;
        kullanici.Providers = {};

        return done(err, kullanici);
    };

    var localStrategy = new LocalStrategy({
        usernameField: authConfig.localAuth.usernameField,
        passwordField: authConfig.localAuth.passwordField,
        passReqToCallback: authConfig.localAuth.passReqToCallback
    }, f_localStrategy);
    passport.use(localStrategy);
    // endregion

    //region LDAP
    var f_LDAPStrategy = function (_req, _adUser, _done) {
        //console.log("AD'den bulunan kullanıcı: ", _adUser);

        var kullanici = schema.f_create_default_object(schema.SCHEMA.DB.KULLANICI);
        kullanici.EPosta = _adUser.mail;
        kullanici.AdiSoyadi = _adUser.displayName;
        kullanici.Providers = {AD: _adUser};

        return _done(null, kullanici);
        /*return _req.logIn(kullanici, function (err) {
         console.log("\n_req.login içinde \n\tkullanici: " + JSON.stringify(kullanici));
         return _done(err, kullanici);
         });*/
        /*return _req.logIn(_adUser, function (_err) {
         // Serileştirmede hata oluştu! O zaman, VT de kayıtlı değilsin > hata karşılamaya git
         if (_err) {
         l.e("Doğrulamadan geçti ama hata aldık: ", _err);
         if (_err === "") {
         return _res.redirect('/login/registration');
         } else {
         l.e("passport.serialize'dan alınan hatayı tanıyamadım !");
         return _res.redirect('/login/registration');
         }
         }

         // VT'den geçti serileşti o halde giriş sayfasına
         l.i("Oldu tüm doğrulamalar.");
         return _res.redirect('/');
         });*/
    };
    var ldapAuthStrategy = new LdapAuthStrategy({

        server: {
            //url: 'ldap://fme.ads.fresenius.com',
            url: 'ldap://10.130.214.14',
            //url: 'ldap://10.130.214.13',
            bindDn: "TUIST-Ldapquery",
            bindCredentials: "connectmeusing389.",
            searchBase: 'DC=fme,DC=ads,DC=fresenius,DC=com',
            searchFilter: '(&(objectCategory=user)(sAMAccountName={{username}}))',
            searchAttributes: ['sAMAccountName', 'mail', 'cn', 'displayName', 'pager', 'userPrincipalName']
            //baseDN: 'DC=fme,DC=ads,DC=fresenius,DC=com',
            //searchFilter: '(&(objectClass=user)(objectCategory=user)(mail={{username}})(sAMAccountName=duygu.akmaz*))',
            //searchFilter: '(&(objectClass=user)(objectCategory=user))',
            //searchFilter: '(&(objectCategory=user)(|(sAMAccountName={{username}})(mail={{username}})))',
        },
        usernameField: authConfig.localAuth.usernameField,
        passwordField: authConfig.localAuth.passwordField,
        passReqToCallback: authConfig.localAuth.passReqToCallback
    }, f_LDAPStrategy);
    passport.use(ldapAuthStrategy);
    // endregion

    //region GOOGLE
    var f_googleStrategy = function (_req, accessToken, refreshToken, profile, _done) {

        console.log("passport 1 içinde....GOOGLE'dan bulunan refreshToken: ", refreshToken);
        console.log("passport 1 içinde....GOOGLE'dan bulunan accessToken: ", accessToken);

        var gp_profile = schema.f_create_default_object(schema.SCHEMA.LOGIN_GP);
        gp_profile.token = accessToken;
        gp_profile.refreshToken = refreshToken;
        gp_profile.id = parseInt(profile.id);
        gp_profile.name = profile.name;
        gp_profile.displayName = profile.displayName;
        gp_profile.email = profile.emails[0].value;
        gp_profile.photo = profile.photos[0].value;
        gp_profile.raw = JSON.stringify(profile);

        var kullanici = schema.f_create_default_object(schema.SCHEMA.DB.KULLANICI);
        kullanici.AdiSoyadi = profile.displayName;
        kullanici.EPosta = gp_profile.email;
        kullanici.Avatar = gp_profile.photo;
        kullanici.Providers = {GP: gp_profile};

        return _done(null, kullanici);
    };

    var googleOAuth2Strategy = new GoogleOAuth2Strategy({
        clientID: authConfig.googleAuthDev.clientID,
        clientSecret: authConfig.googleAuthDev.clientSecret,
        callbackURL: authConfig.googleAuthDev.callbackURL,
        passReqToCallback: true,
        scope: ['openid', 'email', 'profile',
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/plus.me']
    }, f_googleStrategy);
    passport.use(googleOAuth2Strategy);

    refresh.requestNewAccessToken('google', 'some_refresh_token', function (err, accessToken, refreshToken) {
        // You have a new access token, store it in the user object,
        // or use it to make a new request.
        // `refreshToken` may or may not exist, depending on the strategy you are using.
        // You probably don't need it anyway, as according to the OAuth 2.0 spec,
        // it should be the same as the initial refresh token.

        //db.kullanici.f_db_kullanici_refresh_token_ekle()


    });
    // endregion

    //region TWITTER
    var f_twitterStrategy = function (req, token, tokenSecret, profile, done) {
        l.info('Twitter strategy ile doğrulama yapılacak');

        var tw_profile = schema.f_create_default_object(schema.SCHEMA.LOGIN_TW);
        tw_profile.id = parseInt(profile.id);
        tw_profile.token = token;
        tw_profile.tokenSecret = tokenSecret;
        tw_profile.username = profile.username;
        tw_profile.displayName = profile.displayName;
        tw_profile.photo = profile.photos[0].value;
        tw_profile.provider = profile.provider;
        tw_profile.raw = JSON.stringify(profile);


        var kullanici = schema.f_create_default_object(schema.SCHEMA.DB.KULLANICI);
        kullanici.AdiSoyadi = tw_profile.displayName;
        //kullanici.EPosta = tw_profile.email; //TW'den email alınamıyor;
        kullanici.Avatar = tw_profile.photo;
        kullanici.Providers = {TW: tw_profile};

        return done(null, kullanici);
    };

    var twitterStrategy = new TwitterStrategy({
        consumerKey: authConfig.twitterAuthDev.consumerKey,
        consumerSecret: authConfig.twitterAuthDev.consumerSecret,
        callbackURL: authConfig.twitterAuthDev.callbackURL,
        passReqToCallback: true
    }, f_twitterStrategy);
    passport.use(twitterStrategy);
    // endregion

    //region FACEBOOK
    var f_facebookStrategy = function (token, tokenSecret, profile, done) {
        l.info('Facebook strategy ile doğrulama yapılacak');

        var fb_profile = schema.f_create_default_object(schema.SCHEMA.LOGIN_FB);
        fb_profile.id = parseInt(profile.id);
        fb_profile.token = token;
        fb_profile.tokenSecret = tokenSecret;
        fb_profile.displayName = profile.displayName;
        fb_profile.provider = profile.provider;
        fb_profile.raw = JSON.stringify(profile);

        var providerUser = schema.f_create_default_object(schema.SCHEMA.DB.KULLANICI);
        providerUser.AdiSoyadi = fb_profile.displayName;
        providerUser.Providers = {FB: fb_profile};

        return done(null, providerUser);
    };

    var facebookStrategy = new FacebookStrategy({
        clientID: authConfig.facebookAuthDev.clientID,
        clientSecret: authConfig.facebookAuthDev.clientSecret,
        callbackURL: authConfig.facebookAuthDev.callbackURL,
        scope: ['public_profile', 'email', 'user_friends']
    }, f_facebookStrategy);

    passport.use(facebookStrategy);


    // endregion

    return passport;
};