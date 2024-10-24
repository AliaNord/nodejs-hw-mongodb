import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/constants.js';
import { SessionsCollection } from '../db/models/Session.js';
import { UsersCollection } from '../db/models/User.js';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import createHttpError from 'http-errors';

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

// export const refreshSession = async (sessionId, refreshToken) => {
//   const session = await SessionsCollection.findOne({
//     _id: sessionId,
//     refreshToken,
//   });
//   if (!session) {
//     throw createHttpError(401, 'Session not found');
//   }

//   const now = new Date();
//   if (session.refreshTokenValidUntil < now) {
//     throw createHttpError(401, 'Refresh token expired');
//   }
//   await SessionsCollection.deleteOne({
//     _id: sessionId,
//     refreshToken,
//   });
//   const newSession = await SessionsCollection.create({
//     userId: session.userId,
//     ...createActiveSession(),
//   });
//   return newSession;
// };

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
