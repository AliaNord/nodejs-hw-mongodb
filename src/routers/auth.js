import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import { registerUserSchema } from '../validation/registerUserSchema.js';
import { loginUserSchema } from '../validation/loginUserSchema.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  logoutUserController,
  refreshUserSessionController,
  requestResetEmailController,
  resetPasswordController,
  usersLoginController,
  usersRegisterController,
} from '../controllers/auth.js';
import { requestResetEmailSchema } from '../validation/requestResetEmailSchema.js';
import { resetPasswordValidationSchema } from '../validation/resetPasswordValidationSchema.js';

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

usersRouter.post(
  '/send-reset-email',
  validateBody(requestResetEmailSchema),
  ctrlWrapper(requestResetEmailController),
);

usersRouter.post(
  '/reset-pwd',
  validateBody(resetPasswordValidationSchema),
  ctrlWrapper(resetPasswordController),
);

export default usersRouter;
