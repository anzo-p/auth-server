import crypto from 'crypto';

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { getUserData, saveLoginToken } from '../db/userData';
import { unixEpochNow, unixEpochToVerbal } from '../helpers/time';
import { LoginToken } from '../models/LoginToken';

export const authenticateUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(404).json(errors);
  }

  const { email }: { email: string } = req.body;
  const user = await getUserData(email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.loginToken && Number(user.loginTokenExpiration) > unixEpochNow()) {
    return res.status(409).json({ message: 'Login already in progress' });
  }

  const token = crypto
    .randomBytes(32)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '');

  const expiration = unixEpochNow() + 3 * 60;
  const loginToken: LoginToken = { userId: user.id, loginToken: token, expiration } as LoginToken;

  const cached = await saveLoginToken(loginToken);
  if (!cached) {
    return res.status(500).json({ message: 'Internal server error' });
  }

  const uri = `http://localhost:3333/api/auth/authenticate/token/${token}`;
  return res.status(200).json({
    message: 'Use this link to login',
    uri,
    expiration: unixEpochToVerbal(expiration)
  });
};
