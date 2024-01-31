import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { handleError } from '../helpers/errors';
import { AuthenticationMethod } from '../models/AuthenticationMethod';
import { authenticateByEmail, createTokensByLoginCode, createTokensFromExisting } from '../services/authenticationService';
import { DuplicateRequest, GoneEntity, InvalidArgument, NonexistentEntity } from '../services/errorTypes';

export const authenticateUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(404).json(errors);
  }

  try {
    const { data, error } = await authenticateByEmail(req.body.email!);

    if (error) {
      if (error instanceof DuplicateRequest) {
        return res.status(409).json({ message: 'Login already in progress' });
      }
      if (error instanceof NonexistentEntity) {
        return res.status(404).json({ message: `${error.message} not found` });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }

    const { uri, expiration } = data as { uri: string; expiration: string };
    return res.status(200).json({
      message: 'Use this link to login',
      uri,
      expiration
    });
  } catch (err) {
    handleError(err, 'authenticateUser');
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const authenticateToken = async (req: Request, res: Response) => {
  const loginCodeRaw: string = req.query['code']?.toString() || '';

  try {
    const { data, error } = await createTokensByLoginCode(loginCodeRaw, AuthenticationMethod.Email);

    if (error) {
      if (error instanceof GoneEntity) {
        return res.status(410).json({ message: `${error.message} has expired` });
      }
      if (error instanceof NonexistentEntity) {
        return res.status(404).json({ message: `${error.message} not found` });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }

    const { userToken, refreshToken } = data as { userToken: string; refreshToken: string };
    return res.status(200).json({ userToken, refreshToken });
  } catch (err) {
    handleError(err, 'authenticateToken');
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const authenticateRefresh = async (req: Request, res: Response) => {
  const userTokenRaw = req.body.userToken?.toString() || '';
  const refreshTokenRaw = req.body.refreshToken?.toString() || '';

  try {
    const { data, error } = await createTokensFromExisting(userTokenRaw, refreshTokenRaw);

    if (error) {
      if (error instanceof InvalidArgument) {
        return res.status(400).json({ message: `${error.message} is invalid or missing` });
      }
      if (error instanceof GoneEntity) {
        return res.status(410).json({ message: `${error.message} was already used` });
      }
      if (error instanceof NonexistentEntity) {
        return res.status(404).json({ message: `${error.message} not found` });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }

    const { userToken, refreshToken } = data as { userToken: string; refreshToken: string };
    return res.status(200).json({ userToken, refreshToken });
  } catch (err) {
    handleError(err, 'authenticateRefresh');
    return res.status(500).json({ message: 'Internal server error' });
  }
};
