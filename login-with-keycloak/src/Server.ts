import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
// @ts-ignore
import OpenIDConnectStrategy from 'passport-openidconnect';
import authRouter from './routers/auth';
import defaultRouter from './routers/default';
import adminRouter from './routers/admin';

export default class Server {
  private readonly _application: express.Application;

  constructor() {
    this._application = express();
    this.setTopMiddlewares();
    this.setViewOptions();
    this.setRouters();
    this.setBottomMiddlewares();
  }

  get application() {
    return this._application;
  }

  private setTopMiddlewares() {
    this._application.use(express.json());

    this._application.use(session({
      secret: '123',
      resave: false,
      saveUninitialized: false,
      store: new session.MemoryStore(),
    }));

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

    this._application.use(passport.authenticate('session'));
  }

  private setViewOptions() {
    this._application.set('view engine', 'ejs');
    this._application.set('views', path.join(__dirname, '/views'));
  }

  private setRouters() {
    this._application.use(authRouter);
    this._application.use(adminRouter);
    this._application.use(defaultRouter);
  }

  private setBottomMiddlewares() {
    this._application.use((error: Error, _request: Request, _response: Response, next: NextFunction) => {
      console.error(error);
      next();
    })
  }
}
