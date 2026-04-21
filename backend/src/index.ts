import './config/env';
import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { authRouter } from './modules/auth/auth.routes';
import { packsRouter } from './modules/packs/packs.routes';
import { specialtiesRouter } from './modules/specialties/specialties.routes';
import { shiftsRouter } from './modules/shifts/shifts.routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/packs', packsRouter);
app.use('/api/specialties', specialtiesRouter);
app.use('/api/shifts', shiftsRouter);

app.use(errorMiddleware);

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
