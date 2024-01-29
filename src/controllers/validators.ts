import { check } from 'express-validator';

export const validateRegistration = [
  check('name').isLength({ min: 3 }).withMessage('Invalid name'),
  check('email').isEmail().withMessage('Invalid email address')
];
