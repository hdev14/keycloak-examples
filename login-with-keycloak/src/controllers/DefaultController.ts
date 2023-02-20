import { NextFunction, Request, Response } from "express";

export default class DefaultController {
  public home(request: Request, response: Response, next: NextFunction) {
    try {
      if (request.isAuthenticated()) {
        return response.redirect('/main');
      }

      return response.render('home');
    } catch (error) {
      return next(error);
    }
  }

  public notFound(_: Request, response: Response, next: NextFunction) {
    try {
      return response.render('404');
    } catch (error) {
      return next(error);
    }
  }
}
