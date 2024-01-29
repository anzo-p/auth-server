import bodyParser from 'body-parser';
import express from 'express';
import authRoutes from './routes/authRoutes';

const app = express();
const port = process.env.PORT || 3333;

app.use(bodyParser.json());

app.use('/api/auth', authRoutes);

app.listen(port, () => console.log('Server is running!'));
