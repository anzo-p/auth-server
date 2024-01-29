import express from 'express';
import { registerUser, validateRegistration } from '../controllers/registerController';

const router = express.Router();

router.post('/register', validateRegistration, registerUser);

export default router;
