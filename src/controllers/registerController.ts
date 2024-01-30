import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { getUserData, saveUser } from '../db/userData';
import { handleError } from '../helpers/errors';
import { MaybeUserData, UserData, UserDataInput } from '../models/UserData';

export const registerUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(404).json(errors);
  }

  try {
    const userDataInput: UserDataInput = req.body;
    const existingUser: MaybeUserData = await getUserData(userDataInput.email);
    if (existingUser) {
      return res.status(409).json({ message: 'This email was already registered' });
    }

    const newUser: UserData = { ...userDataInput, id: uuidv4() };
    const saved = await saveUser(newUser);
    if (!saved) {
      return res.status(500).json({ message: 'Internal server error' });
    }

    return res.status(201).json({ message: 'User created', user: newUser });
  } catch (err) {
    handleError(err, 'registerUser');
    return res.status(500).json({ message: 'Internal server error' });
  }
};
