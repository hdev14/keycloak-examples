import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import authRouter from './routers/auth';
import defaultRouter from './routers/default';
import adminRouter from './routers/admin';
import './passportBootstrap';

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
