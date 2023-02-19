
import express, { NextFunction, Response } from 'express';
import session from 'express-session';
import passport from 'passport';
// @ts-ignore
import OpenIDConnectStrategy from 'passport-openidconnect';
import QueryString from 'qs';
import jwt from 'jsonwebtoken';


require('dotenv').config();

const app = express();

app.use(express.json());

app.use(session({
  secret: '123',
  resave: false,
  saveUninitialized: false,
  store: new session.MemoryStore(),
}));

passport.use(new OpenIDConnectStrategy({
  issuer: "http://localhost:8080/realms/kc_login",
  authorizationURL: "http://localhost:8080/realms/kc_login/protocol/openid-connect/auth",
  tokenURL: "http://localhost:8080/realms/kc_login/protocol/openid-connect/token",
  userInfoURL: "http://localhost:8080/realms/kc_login/protocol/openid-connect/userinfo",
  clientID: process.env.KC_CLIENT_ID,
  clientSecret: process.env.KC_CLIENT_SECRET,
  callbackURL: '/callback',
  scope: ['profile'],
  passReqToCallback: true,
}, function verify(_req: any, _issuer: string, profile: any, _context: any, idToken: string, accessToken: string, refreshToken: string, verified: Function) {
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

app.use(passport.authenticate('session'));

app.get('/login', passport.authenticate('openidconnect'));

app.get('/callback', passport.authenticate('openidconnect', {
  successRedirect: '/',
  failureRedirect: '/login',
}));

async function authorized(req: any, response: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    if (!req.session['roles']) {
      const decoded: any = jwt.verify(req.user.accessToken, process.env.KC_CLIENT_PUBLIC_KEY!);

      const applicationKeys = Object.keys(decoded.resource_access);

      const fullApplicationRoles = applicationKeys.map((key) => {
        return decoded.resource_access[key].roles;
      }).reduce((acc, roles) => {
        acc = [...acc, ...roles];
        return acc;
      }, []);

      const roles = [
        ...decoded.realm_access.roles,
        ...fullApplicationRoles,
      ];

      req.session['roles'] = roles;
    }

    return next();
  }

  return response.redirect('/login');
}

type Spec = {
  and?: string[]
  or?: string[]
}

function hasPermissions(spec: Spec | string) {
  return (req: any, res: any, next: any) => {
    if (req.session['roles']) {
      const roles: string[] = req.session['roles'];

      if (typeof spec === 'string' && roles.includes(spec)) {
        return next();
      }

      if (typeof spec === 'object') {
        let containsAllRoles = true;
        let containsSomeRoles = true;

        const isASimpleOperation = (spec.and && spec.or && spec.and.length > 0 && spec.or.length === 1);

        if (isASimpleOperation) {
          throw new Error('Use just "and" instead.');
        }

        if (spec.and) {
          containsAllRoles = spec.and.every(
            (role) => roles.includes(role)
          );
        }

        if (spec.or) {
          containsSomeRoles = spec.or.some(
            (role) => roles.includes(role)
          );
        }

        if (containsAllRoles && containsSomeRoles) {
          return next();
        }
      }
    }

    return res.status(403).json({ message: 'Forbidden' });
  }
}

app.get(
  '/',
  authorized,
  hasPermissions({
    and: ['teste', 'manage-users'],
    or: ['unknown', 'uma_authorization'],
  }),
  (req, res) => {
    res.json({ message: req.isAuthenticated() ? 'Authenticated' : 'Unauthenticated' });
  }
);

app.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }

    const queryString = QueryString.stringify({
      client_id: process.env.KC_CLIENT_ID,
      returnTo: 'http://localhost:3000/',
    });

    res.redirect(`http://localhost:8080/realms/kc_login/protocol/openid-connect/logout?${queryString}`);
  })
});

app.listen(3000, () => {
  console.log('Server is running. http://localhost:3000');
});