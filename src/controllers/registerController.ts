import { Request, Response } from 'express';
import { check, validationResult } from 'express-validator';

export const validateRegistration = [
  check('name').isLength({ min: 3 }).withMessage('Invalid name'),
  check('email').isEmail().withMessage('Invalid email address')
];

export const registerUser = (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(404).json(errors);
  }

  return res.json({ message: 'Registered' });
};
