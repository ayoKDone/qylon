import app from './app';
import { logger } from './utils/logger';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;

app.listen(PORT, () => {
  logger.info('Server started', { port: PORT });
});
