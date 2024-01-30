import crypto from 'crypto';
import { unixEpochNow } from '../helpers/time';
import { LoginToken } from '../models/LoginToken';
import { UserData } from '../models/UserData';
import { saveLoginToken } from '../db/userData';

export const loginOngoing = (user: UserData): boolean => {
  return user.loginToken != null && user.loginTokenExpiration != null && Number(user.loginTokenExpiration) > unixEpochNow();
};

export const createLoginToken = async (user: UserData): Promise<LoginToken> => {
  const token = crypto
    .randomBytes(32)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '');

  const expiration = unixEpochNow() + 3 * 60;
  const loginToken = { userId: user.id, loginToken: token, expiration } as LoginToken;
  await saveLoginToken(loginToken);
  return loginToken;
};
