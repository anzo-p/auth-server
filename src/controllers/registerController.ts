import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { checkEmailAvailability, saveUser } from '../db/userData';
import { UserData, UserDataInput } from '../models/UserData';

export const registerUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(404).json(errors);
  }

  try {
    const userDataInput: UserDataInput = req.body;
    const emailAvailable: boolean = await checkEmailAvailability(userDataInput.email);
    if (!emailAvailable) {
      return res.status(409).json({ message: 'This email was already registered' });
    } else {
      const user: UserData = { ...userDataInput, id: uuidv4() };
      const saved = await saveUser(user);
      if (!saved) {
        return res.status(500).json({ message: 'Internal server error' });
      }
      return res.status(201).json({ message: 'User created', user });
    }
  } catch (err) {
    console.error('Error getting user:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
