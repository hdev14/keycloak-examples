import { NextFunction, Request, Response } from "express";

export default class AdminController {
  public main(_: Request, response: Response, next: NextFunction) {
    try {
      return response.render('main', { message: 'Hello Word' });
    } catch (error) {
      return next(error);
    }
  }
}
