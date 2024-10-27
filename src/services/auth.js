import {
  FIFTEEN_MINUTES,
  JWT,
  SMTP,
  THIRTY_DAYS,
} from '../constants/constants.js';
import { SessionsCollection } from '../db/models/Session.js';
import { UsersCollection } from '../db/models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import createHttpError from 'http-errors';
import { emailClient } from '../utils/emailClient.js';
import { env } from '../utils/env.js';
import { generateResetPasswordEmail } from '../utils/generateResetPasswordEmail.js';

export const userByEmail = (email) => UsersCollection.findOne({ email });

export const createUser = async (userData) => {
  const encryptedPassword = await bcrypt.hash(userData.password, 10);
  return UsersCollection.create({
    ...userData,
    password: encryptedPassword,
  });
};

export const createActiveSession = async (userId) => {
  await SessionsCollection.deleteOne({ userId });
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  const accessTokenValidUntil = Date.now() + FIFTEEN_MINUTES;
  const refreshTokenValidUntil = Date.now() + THIRTY_DAYS;

  return await SessionsCollection.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });
};

export const findSession = (accessToken) =>
  SessionsCollection.findOne({ accessToken });

export const findUserById = (id) => UsersCollection.findById(id);

export const refreshSession = async (sessionId, refreshToken) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const now = new Date();

  if (session.refreshTokenValidUntil < now) {
    throw createHttpError(401, 'Refresh token expired');
  }

  const newSessionData = await createActiveSession(session.userId);

  const newSession = await SessionsCollection.create({
    userId: session.userId,
    accessToken: newSessionData.accessToken,
    refreshToken: newSessionData.refreshToken,
    accessTokenValidUntil: newSessionData.accessTokenValidUntil,
    refreshTokenValidUntil: newSessionData.refreshTokenValidUntil,
  });

  await SessionsCollection.deleteOne({
    _id: sessionId,
    refreshToken,
  });

  return newSession;
};

export const logoutUser = async (sessionId, sessionToken) => {
  await SessionsCollection.deleteOne({
    _id: sessionId,
    refreshToken: sessionToken,
  });
};

export const requestResetToken = async (email) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    env(JWT.JWT_SECRET),
    {
      expiresIn: 60 * 5,
    },
  );

  const resetLink = `${env(JWT.APP_DOMAIN)}/reset-password?token=${resetToken}`;

  try {
    await emailClient.sendMail({
      from: env(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset your password',
      html: generateResetPasswordEmail({
        name: user.name,
        resetLink: resetLink,
      }),
    });
  } catch (error) {
    console.log(error);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPassword = async ({ token, password }) => {
  let payload;
  try {
    payload = jwt.verify(token, env(JWT.JWT_SECRET));
  } catch (error) {
    if (error instanceof Error)
      throw createHttpError(401, 'Token is expired or invalid.');
    throw error;
  }

  const user = await UsersCollection.findById(payload.sub);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await UsersCollection.findByIdAndUpdate(user._id, {
    password: hashedPassword,
  });

  const userSessions = await SessionsCollection.find({ userId: user._id });

  for (const session of userSessions) {
    await logoutUser(session._id);
  }
};
