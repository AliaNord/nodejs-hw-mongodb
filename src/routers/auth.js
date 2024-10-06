import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import { registerUserSchema } from '../validation/registerUserSchema.js';
import { loginUserSchema } from '../validation/loginUserSchema.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  logoutUserController,
  refreshUserSessionController,
  usersLoginController,
  usersRegisterController,
} from '../controllers/auth.js';

const usersRouter = Router();

usersRouter.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(usersRegisterController),
);

usersRouter.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(usersLoginController),
);

usersRouter.post('/refresh', ctrlWrapper(refreshUserSessionController));

usersRouter.post('/logout', ctrlWrapper(logoutUserController));

export default usersRouter;
