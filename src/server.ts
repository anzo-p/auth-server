import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3333;

app.use(express.json());

app.post('/register', (req: Request, res: Response) => {
  return res.json({ message: 'Hello World' });
});

app.post('/authenticate', (req: Request, res: Response) => {
  return res.json({ message: 'Hello World' });
});

app.listen(port, () => console.log('Server is running!'));
