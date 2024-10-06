import createHttpError from 'http-errors';
import { findSession, findUserById } from '../services/auth.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    next(createHttpError(401, 'Auth header is required!'));
    return;
  }
  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    next(createHttpError(401, 'Auth header must be of type Bearer!'));
    return;
  }

  const session = await findSession(token);
  if (!session) {
    next(
      createHttpError(401, 'Auth token is not associated with any session!'),
    );
    return;
  }

  const isAccessTokenExpired = new Date() > session.accessTokenValidUntil;

  if (!isAccessTokenExpired) {
    next(createHttpError(401, 'Auth token is expired!'));
    return;
  }

  const user = await findUserById(session.userId);

  if (!user) {
    next(createHttpError(401, 'No user is associated with this session!'));
    return;
  }

  req.user = user;
  next();
};
