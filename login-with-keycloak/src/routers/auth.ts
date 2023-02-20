import { Router } from 'express';
import passport from 'passport';
import AuthController from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

router.get('/login', passport.authenticate('openidconnect'));

router.get('/callback', passport.authenticate('openidconnect', {
  successRedirect: '/main',
  failureRedirect: '/login',
}));

router.get('/logout', authController.logout.bind(authController));

export default router;
