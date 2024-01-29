import express from 'express';
import { registerUser } from '../controllers/registerController';
import { validateRegistration } from '../controllers/validators';

const router = express.Router();

router.post('/register', validateRegistration, registerUser);

export default router;
