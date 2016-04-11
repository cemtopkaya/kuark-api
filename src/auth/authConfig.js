module.exports = {
    facebookAuthDev: {
        clientID: '235376566794377',
        clientSecret: '2b9a4c3625a608ea05fcea05ca83c201',
        callbackURL: "http://localhost:3000/login/auth/facebook/callback"
    },
    facebookAuthProd: {
        clientID: '235376566794377',
        clientSecret: '2b9a4c3625a608ea05fcea05ca83c201',
        callbackURL: "http://10.130.214.126:3000/login/auth/facebook/callback"
    },
    twitterAuthDev: {
        consumerKey: 'zbn5snW9ABEMaJiEYTzOwCd3K',
        consumerSecret: 'le3Yf66gJIorw9SYyGjoqe7iZYiH8LuxWQjCiD6iCjnb3pAvGA',
        callbackURL: 'http://127.0.0.1:3000/login/auth/twitter/callback'
    },
    twitterAuthProd: {
        consumerKey: 'tZ8BtkW6C5YAwcAYsfWrwqBv3',
        consumerSecret: 'MBs9YHuSPI0rdWzKUTSHLY5GP3lw80Xz5KQd0uvRrHRSz6PVFL',
        callbackURL: "http://10.130.214.126:3000/login/auth/twitter/callback"
    },
   /* googleAuthDev: {
        clientID: "451576775913-0069n8pdsla0rom3r8nm0hr3m5dnucua.apps.googleusercontent.com",
        clientSecret: "0tkAQmDGThrRBA0_RQhuO9_K",
        callbackURL: "http://127.0.0.1:3000/login/auth/google/callback"
    },*/
    googleAuthDev: {
        clientID: "451576775913-0scq54pdr1kiodbdp8dmpomkpt1273f6.apps.googleusercontent.com",
        clientSecret: "iD3HhVk1Ut5B6YznGH91xBcf",
        callbackURL: "http://127.0.0.1:3000/login/auth/google/callback"
    },
    googleAuthProd: {
        clientID: "461355559354-dsv9cb7i59ccviri4vkagdajk86j1krg.apps.googleusercontent.com",
        clientSecret: "XVMsGd5LOpVz7B1J-aJRlMKr",
        callbackURL: "http://10.130.214.126:3000/login/auth/google/callback"
    },
    localAuth: {
        // by default, local strategy uses username and password,
        // we will override with email
        usernameField: 'EPosta',
        passwordField: 'Sifre',
        passReqToCallback: true
        // allows us to pass back the entire request to the callback
    }
};

