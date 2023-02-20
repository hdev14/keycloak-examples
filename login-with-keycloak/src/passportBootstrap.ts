import passport from "passport";
// @ts-ignore
import OpenIDConnectStrategy from 'passport-openidconnect';

passport.use(new OpenIDConnectStrategy({
    issuer: process.env.KC_ISSUER_URL,
    authorizationURL: process.env.KC_AUTH_URL,
    tokenURL: process.env.KC_TOKEN_URL,
    userInfoURL: process.env.KC_USER_INFO_URL,
    clientID: process.env.KC_CLIENT_ID,
    clientSecret: process.env.KC_CLIENT_SECRET,
    callbackURL: '/callback',
    scope: ['profile'],
    passReqToCallback: true,
}, function verify(_req: object, _issuer: string, profile: any, _context: any, idToken: string, accessToken: string, refreshToken: string, verified: Function) {
    return verified(null, {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        accessToken,
        refreshToken,
        idToken,
    });
}));

passport.serializeUser(function (user: any, done) {
    process.nextTick(function () {
        done(null, user);
    })
});

passport.deserializeUser(function (user: any, cb) {
    process.nextTick(function () {
        cb(null, user);
    })
});