import { Router } from 'express';
import DefaultController from '../controllers/DefaultController';

const router = Router();

const defaultController = new DefaultController();

router.get('/', defaultController.home.bind(defaultController));

router.get('*', defaultController.notFound.bind(defaultController));

export default router;
