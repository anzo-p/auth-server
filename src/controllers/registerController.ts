import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { handleError } from '../helpers/errors';
import { UserDataInput } from '../models/UserData';
import { DuplicateRequest } from '../services/errorTypes';
import { register } from '../services/registerService';

export const registerUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(404).json(errors);
  }

  try {
    const { data, error } = await register(req.body as UserDataInput);

    if (error) {
      if (error instanceof DuplicateRequest) {
        return res.status(409).json({ message: `${error.message} is already registered` });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }

    const { user } = data as { user: object };
    return res.status(201).json({ message: 'User created', user });
  } catch (err) {
    handleError(err, 'registerUser');
    return res.status(500).json({ message: 'Internal server error' });
  }
};
