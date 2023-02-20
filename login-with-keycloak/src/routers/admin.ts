import { Router } from 'express';
import AdminController from '../controllers/AdminController';
import authorized from '../middlewares/authorized';
import hasPermissions, { Spec } from '../middlewares/hasPermissions';

const router = Router();
const adminController = new AdminController();

router.get(
  '/main',
  authorized,
  hasPermissions({
    and: ['teste', 'manage-users'],
    or: ['unknown', 'uma_authorization'],
  }),
  adminController.main.bind(adminController)
);

export default router;
