import express from 'express';
import { registerUser } from '../controllers/registerController';
import { authenticateRefresh, authenticateToken, authenticateUser } from '../controllers/authenticateController';
import { validateRegistration, validateAuthentication } from '../controllers/validators';

const router = express.Router();

router.post('/register', validateRegistration, registerUser);

router.post('/authenticate/get', validateAuthentication, authenticateUser);

router.get('/authenticate', authenticateToken);

router.post('/authenticate/refresh', authenticateRefresh);

export default router;
