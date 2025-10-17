import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const PORT = process.env.CLIENT_MANAGEMENT_PORT
  ? parseInt(process.env.CLIENT_MANAGEMENT_PORT)
  : 5000;

app.listen(PORT, () => {});
