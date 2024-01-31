import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserData } from '../models/UserData';
import { assertDefined, handleError } from './errors';
import { AuthenticationMethod } from '../models/AuthenticationMethod';

const algorithm = assertDefined(process.env.JWT_ALGORITHM);
const secret = assertDefined(process.env.JWT_SECRET);

type Authentications = {
  met: string;
  iat: number;
  exp: number;
};

export function createUserTokenPayload(subject: UserData, authMethod: AuthenticationMethod): JwtPayload {
  const now = Math.floor(Date.now() / 1000);

  const auth: Authentications = {
    met: authMethod,
    iat: now,
    exp: now + 60 * 60 * 3
  };

  const payload: JwtPayload = {
    sub: subject.id,
    iat: now,
    exp: now + 60 * 60 * 3,
    auth: [auth]
  };

  return payload;
}

export function signAndPack(payload: JwtPayload): string {
  return jwt.sign(JSON.stringify(payload), secret, { algorithm: algorithm as jwt.Algorithm });
}

export function unpackToken(payload: string): JwtPayload {
  const result = jwt.verify(payload, secret, { algorithms: [algorithm as jwt.Algorithm] }) as JwtPayload;
  if (typeof result === 'string') {
    throw new Error(`Malformet JTW: ${result}`);
  }
  return result;
}

export function verifyToken(payload: JwtPayload): boolean {
  const { sub } = payload;
  if (typeof sub === 'undefined') {
    //throw new Error('No sub in JTW');
    // see if your serviceError works and duplicate for tokenErrors
    return false;
  }
  return true;
}

export function validateRefreshToken(user: UserData, payload: JwtPayload, refresh: string): boolean {
  const { refreshToken, refreshExpiration } = user;
  if (!refreshToken || !refreshExpiration) {
    //throw new Error('No refresh token or expiration');
    return false;
  }

  if (refreshExpiration < Math.floor(Date.now() / 1000)) {
    //throw new Error('Refresh token expired');
    return false;
  }

  if (refresh !== refreshToken) {
    //throw new Error('Refresh token does not match');
    return false;
  }

  return true;
}
