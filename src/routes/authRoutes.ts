import express from 'express';
import { registerUser } from '../controllers/registerController';
import { authenticateUser } from '../controllers/authenticateController';
import { validateRegistration, validateAuthentication } from '../controllers/validators';

const router = express.Router();

router.post('/register', validateRegistration, registerUser);

router.post('/authenticate', validateAuthentication, authenticateUser);

export default router;
