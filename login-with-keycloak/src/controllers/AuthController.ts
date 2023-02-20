import { NextFunction, Request, Response } from "express";
import QueryString from 'qs';

export default class AuthController {
  public logout(request: Request, response: Response, next: NextFunction) {
    request.logout(function (err) {
      if (err) {
        return next(err);
      }

      const queryString = QueryString.stringify({
        client_id: process.env.KC_CLIENT_ID,
        returnTo: process.env.SERVER_URL,
      });

      return response.redirect(`${process.env.KC_LOGOUT_URL}?${queryString}`);
    })
  }
}
