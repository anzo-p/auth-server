import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { getUserData } from '../db/userData';
import { unixEpochToVerbal } from '../helpers/time';
import { LoginToken } from '../models/LoginToken';
import { createLoginToken, loginOngoing } from '../services/authenticationService';
import { handleError } from '../helpers/errors';

export const authenticateUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(404).json(errors);
  }

  try {
    const { email }: { email: string } = req.body;
    const user = await getUserData(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (loginOngoing(user)) {
      return res.status(409).json({ message: 'Login already in progress' });
    }

    const token: LoginToken = await createLoginToken(user);
    const uri = `http://localhost:3333/api/auth/authenticate/token/${token.loginToken}`;
    return res.status(200).json({
      message: 'Use this link to login',
      uri,
      expiration: unixEpochToVerbal(token.expiration)
    });
  } catch (err) {
    handleError(err, 'authenticateUser');
    return res.status(500).json({ message: 'Internal server error' });
  }
};
