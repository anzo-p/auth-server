import {
  createErrorResult,
  NonexistentEntity,
  DuplicateRequest,
  GoneEntity,
  InternalError,
  InvalidArgument,
  ServiceResult
} from './errorTypes';
import { getUserDataByEmail, getUserDataById, getUserDataByToken, saveLoginToken, saveRefreshToken } from '../db/userData';
import { handleError } from '../helpers/errors';
import { cleanupAlphaNumeric, cleanupJWT, generateRandomUrlSafeString } from '../helpers/string';
import { unixEpochNow, unixEpochToVerbal } from '../helpers/time';
import { createUserTokenPayload, signAndPack, unpackToken, verifyToken } from '../helpers/token';
import { AuthenticationMethod } from '../models/AuthenticationMethod';
import { LoginToken } from '../models/LoginToken';

export const authenticateByEmail = async (host: string, email: string): Promise<ServiceResult> => {
  const user = await getUserDataByEmail(email);

  if (!user) {
    return createErrorResult(new NonexistentEntity('User'));
  }
  if (user.loginTokenExpiration != null && Number(user.loginTokenExpiration) > unixEpochNow()) {
    return createErrorResult(new DuplicateRequest());
  }

  const expiration = unixEpochNow() + 60 * 3;
  const token: LoginToken = {
    userId: user.id,
    loginToken: generateRandomUrlSafeString(32),
    expiration
  };

  try {
    await saveLoginToken(token);
    return {
      data: {
        uri: `http://${host}/api/auth/authenticate?code=${token.loginToken}`,
        expiration: unixEpochToVerbal(token.expiration)
      }
    };
  } catch (err) {
    handleError(err, 'authenticateByEmail');
    return createErrorResult(new InternalError());
  }
};

export const createTokensByLoginCode = async (loginCodeRaw: string, authMethod: AuthenticationMethod): Promise<ServiceResult> => {
  const loginCode = cleanupAlphaNumeric(loginCodeRaw);
  const user = await getUserDataByToken(loginCode);

  if (!user) {
    return createErrorResult(new NonexistentEntity('User'));
  }
  if (!user.loginToken) {
    return createErrorResult(new NonexistentEntity('Login token'));
  }
  if (user.loginTokenExpiration != null && Number(user.loginTokenExpiration) < unixEpochNow()) {
    return createErrorResult(new GoneEntity('Login token'));
  }

  try {
    const payload = createUserTokenPayload(user, authMethod);
    const userToken = signAndPack(payload);
    const refreshToken = await createRefreshToken(user.id);

    return {
      data: {
        userToken,
        refreshToken
      }
    };
  } catch (err) {
    handleError(err, 'createTokensByLoginCode');
    return createErrorResult(new InternalError());
  }
};

export const createTokensFromExisting = async (userTokenRaw: string, refreshTokenRaw: string): Promise<ServiceResult> => {
  const userToken: string = cleanupJWT(userTokenRaw);
  const refreshToken: string = cleanupAlphaNumeric(refreshTokenRaw);

  if (!userToken) {
    return createErrorResult(new InvalidArgument('Argument userToken'));
  }
  if (!refreshToken) {
    return createErrorResult(new InvalidArgument('Argument refreshToken'));
  }

  try {
    const payload = unpackToken(userToken);
    if (!verifyToken(payload)) {
      return createErrorResult(new NonexistentEntity('User token'));
    }

    const user = await getUserDataById(payload.sub!);
    if (!user) {
      return createErrorResult(new NonexistentEntity('User'));
    }
    if (!user.refreshToken) {
      return createErrorResult(new NonexistentEntity('Entity refreshToken'));
    }
    if (user.refreshToken !== refreshToken) {
      return createErrorResult(new GoneEntity('Refresh token'));
    }

    const newPayload = createUserTokenPayload(user, payload.auth[0].met);
    const newUserToken = signAndPack(newPayload);
    const newRefreshToken = await createRefreshToken(user.id);

    return {
      data: {
        userToken: newUserToken,
        refreshToken: newRefreshToken
      }
    };
  } catch (err) {
    handleError(err, 'createTokensFromExisting');
    return createErrorResult(new InternalError());
  }
};

const createRefreshToken = async (userId: string): Promise<string> => {
  const refreshToken = generateRandomUrlSafeString(32);
  const refreshExpiration = unixEpochNow() + 60 * 60 * 24;
  await saveRefreshToken(userId, refreshToken, refreshExpiration);
  return refreshToken;
};
