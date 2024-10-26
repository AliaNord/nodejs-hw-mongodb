import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import {
  createActiveSession,
  createUser,
  logoutUser,
  refreshSession,
  requestResetToken,
  resetPassword,
  userByEmail,
} from '../services/auth.js';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/constants.js';

export const usersRegisterController = async (req, res) => {
  const { email, name } = req.body;

  const userEmail = await userByEmail(email);

  if (userEmail) {
    throw createHttpError(409, 'Email in use');
  }

  await createUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: {
      name,
      email,
    },
  });
};

export const usersLoginController = async (req, res) => {
  const { email, password } = req.body;
  const user = await userByEmail(email);
  if (!user) {
    throw createHttpError(401, 'Email or password is wrong');
  }
  const correctPassword = bcrypt.compare(password, user.password);
  if (!correctPassword) {
    throw createHttpError(401, 'Email or password is wrong');
  }
  const session = await createActiveSession(user._id);
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + FIFTEEN_MINUTES),
  });
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken: session.accessToken },
  });
};

const setupSessionCookies = (session, res) => {
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + FIFTEEN_MINUTES),
  });
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + FIFTEEN_MINUTES),
  });
};

export const refreshUserSessionController = async (req, res) => {
  const session = await refreshSession(
    req.cookies.sessionId,
    req.cookies.refreshToken,
  );
  setupSessionCookies(session, res);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken: session.accessToken },
  });
};

export const logoutUserController = async (req, res) => {
  await logoutUser(req.cookies.sessionId, req.cookies.sessionToken);
  res.clearCookie('sessionId');
  res.clearCookie('sessionToken');
  res.status(204).send();
};

export const requestResetEmailController = async (req, res) => {
  await requestResetToken(req.body.email);
  res.json({
    status: 200,
    message: 'Reset password email has been successfully sent',
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);
  res.json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};
