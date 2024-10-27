import nodemailer from 'nodemailer';

import { SMTP } from '../constants/constants.js';
import { env } from './env.js';

export const emailClient = nodemailer.createTransport({
  host: env(SMTP.SMTP_HOST),
  port: Number(env(SMTP.SMTP_PORT)),
  secure: false,
  auth: {
    user: env(SMTP.SMTP_USER),
    pass: env(SMTP.SMTP_PASSWORD),
  },
});
