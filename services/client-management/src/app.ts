import cors from 'cors';
import express from 'express';
import clientRoutes from '../src/routes/clients';
import teamRoutes from '../src/routes/teamMembers';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/clients', clientRoutes);
app.use('/teams', teamRoutes);

export default app;
